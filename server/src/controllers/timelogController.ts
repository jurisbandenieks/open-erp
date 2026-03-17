import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppDataSource } from "../config/database";
import { Timelog } from "../entities/Timelog.entity";
import { Employee } from "../entities/Employee.entity";
import { Owner } from "../entities/Owner.entity";
import { TimelogType, TimelogStatus } from "../entities/enums";
import { validate } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";

const timelogRepo = () => AppDataSource.getRepository(Timelog);
const employeeRepo = () => AppDataSource.getRepository(Employee);
const ownerRepo = () => AppDataSource.getRepository(Owner);

// ─── Schemas ─────────────────────────────────────────────────────────────────

const listSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  employeeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(TimelogStatus).optional(),
  type: z.nativeEnum(TimelogType).optional()
});

const createSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string(),
  totalHours: z.number().min(0).max(24),
  type: z.nativeEnum(TimelogType).default(TimelogType.STANDARD),
  status: z.nativeEnum(TimelogStatus).optional(),
  description: z.string().optional(),
  notes: z.string().optional()
});

const updateSchema = z.object({
  date: z.string().optional(),
  totalHours: z.number().min(0).max(24).optional(),
  type: z.nativeEnum(TimelogType).optional(),
  status: z.nativeEnum(TimelogStatus).optional(),
  description: z.string().optional(),
  notes: z.string().optional()
});

const rejectSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required")
});

const weeklyApprovalsSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)")
});

const bulkReviewWeekSchema = z
  .object({
    employeeId: z.string().uuid(),
    weekStart: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
    weekEnd: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
    action: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().optional()
  })
  .refine((d) => d.action !== "rejected" || !!d.rejectionReason?.trim(), {
    message: "Rejection reason is required when rejecting",
    path: ["rejectionReason"]
  });

const bulkSubmitSchema = z.object({
  timelogIds: z
    .array(z.string().uuid())
    .min(1, "At least one timelog ID required")
});

const summarySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
  employeeId: z.string().uuid().optional()
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toDto = (t: Timelog) => ({
  id: t.id,
  employeeId: t.employeeId,
  employeeName: t.employee?.user
    ? `${t.employee.user.firstName} ${t.employee.user.lastName}`
    : null,
  date:
    typeof t.date === "string" ? t.date : t.date?.toISOString().split("T")[0],
  totalHours: Number(t.totalHours),
  type: t.type,
  status: t.status,
  description: t.description ?? null,
  notes: t.notes ?? null,
  approved: t.approved,
  approvedBy: t.approvedBy ?? null,
  approvedAt: t.approvedAt ?? null,
  rejectionReason: t.rejectionReason ?? null,
  billable: t.billable,
  billableHours: t.billableHours != null ? Number(t.billableHours) : null,
  hourlyRate: t.hourlyRate != null ? Number(t.hourlyRate) : null,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt
});

/**
 * Throws a 409 if the employee already has a timelog for the same date+type.
 * Pass excludeId to ignore the current record when updating.
 */
const checkDuplicate = async (
  employeeId: string,
  date: string,
  type: TimelogType,
  excludeId?: string
) => {
  const qb = timelogRepo()
    .createQueryBuilder("t")
    .where("t.employeeId = :employeeId", { employeeId })
    .andWhere("DATE(t.date) = DATE(:date)", { date })
    .andWhere("t.type = :type", { type });

  if (excludeId) {
    qb.andWhere("t.id != :excludeId", { excludeId });
  }

  const existing = await qb.getOne();
  if (existing) {
    throw new AppError(
      `A ${type} timelog for this employee on ${date} already exists.`,
      409
    );
  }
};

/**
 * Returns the set of employeeIds visible to the requesting user.
 * Returns null if the user is admin (no restriction).
 * Returns an empty array if the user has no valid scope.
 */
async function getScopedEmployeeIds(userId: string): Promise<string[] | null> {
  const myEmp = await employeeRepo().findOne({
    where: { userId },
    relations: ["manages"]
  });

  const owner = await ownerRepo().findOne({ where: { userId } });

  if (owner) {
    const rows = await employeeRepo()
      .createQueryBuilder("emp")
      .innerJoin("emp.company", "cmp", "cmp.ownerId = :ownerId", {
        ownerId: owner.id
      })
      .select("emp.id", "id")
      .getRawMany<{ id: string }>();
    return rows.map((r) => r.id);
  }

  if (myEmp?.manages?.length) {
    return myEmp.manages.map((e) => e.id);
  }

  return myEmp ? [] : [];
}

const buildListQuery = (
  params: z.infer<typeof listSchema>,
  employeeId?: string
) => {
  const qb = timelogRepo()
    .createQueryBuilder("t")
    .leftJoinAndSelect("t.employee", "employee")
    .leftJoinAndSelect("employee.user", "user");

  const eid = employeeId ?? params.employeeId;
  if (eid) qb.andWhere("t.employeeId = :eid", { eid });
  if (params.startDate) qb.andWhere("t.date >= :sd", { sd: params.startDate });
  if (params.endDate) qb.andWhere("t.date <= :ed", { ed: params.endDate });
  if (params.status)
    qb.andWhere("t.status = :status", { status: params.status });
  if (params.type) qb.andWhere("t.type = :type", { type: params.type });

  qb.orderBy("t.date", "ASC")
    .skip((params.page - 1) * params.limit)
    .take(params.limit);

  return qb;
};

// ─── Handlers ────────────────────────────────────────────────────────────────

export const listTimelogs = [
  validate(listSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.query as unknown as z.infer<typeof listSchema>;
      const qb = buildListQuery(params);
      const [rows, total] = await qb.getManyAndCount();
      res.json({
        success: true,
        data: rows.map(toDto),
        total,
        page: params.page,
        limit: params.limit
      });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const getTimelogsByEmployee = [
  validate(listSchema.omit({ employeeId: true }), "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.query as unknown as z.infer<typeof listSchema>;
      const qb = buildListQuery(params, req.params.employeeId);
      const [rows, total] = await qb.getManyAndCount();
      res.json({
        success: true,
        data: rows.map(toDto),
        total,
        page: params.page,
        limit: params.limit
      });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const getTimelog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const t = await timelogRepo()
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.employee", "employee")
      .leftJoinAndSelect("employee.user", "user")
      .where("t.id = :id", { id: req.params.id })
      .getOne();
    if (!t) throw new AppError("Timelog not found", 404);
    res.json({ success: true, data: toDto(t) });
  } catch (err) {
    next(err);
  }
};

export const createTimelog = [
  validate(createSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as z.infer<typeof createSchema>;

      const employee = await employeeRepo().findOne({
        where: { id: dto.employeeId }
      });
      if (!employee) throw new AppError("Employee not found", 404);

      await checkDuplicate(dto.employeeId, dto.date, dto.type);

      const timelog = timelogRepo().create({
        employeeId: dto.employeeId,
        date: new Date(dto.date) as unknown as Date,
        totalHours: dto.totalHours,
        type: dto.type,
        status: dto.status ?? TimelogStatus.DRAFT,
        description: dto.description,
        notes: dto.notes
      });

      await timelogRepo().save(timelog);

      const saved = await timelogRepo()
        .createQueryBuilder("t")
        .leftJoinAndSelect("t.employee", "employee")
        .leftJoinAndSelect("employee.user", "user")
        .where("t.id = :id", { id: timelog.id })
        .getOne();

      res.status(201).json({ success: true, data: toDto(saved!) });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const updateTimelog = [
  validate(updateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as z.infer<typeof updateSchema>;
      const t = await timelogRepo().findOne({ where: { id: req.params.id } });
      if (!t) throw new AppError("Timelog not found", 404);

      // Only check for duplicates if date or type is actually changing
      const rawDate =
        typeof t.date === "string"
          ? t.date
          : t.date!.toISOString().split("T")[0];
      const newDate = dto.date ?? rawDate;
      const newType = dto.type ?? t.type;
      if (dto.date !== undefined || dto.type !== undefined) {
        await checkDuplicate(t.employeeId!, newDate, newType, t.id);
      }

      if (dto.date !== undefined)
        t.date = new Date(dto.date) as unknown as Date;
      if (dto.totalHours !== undefined) t.totalHours = dto.totalHours;
      if (dto.type !== undefined) t.type = dto.type;
      if (dto.status !== undefined) t.status = dto.status;
      if (dto.description !== undefined) t.description = dto.description;
      if (dto.notes !== undefined) t.notes = dto.notes;

      await timelogRepo().save(t);

      const saved = await timelogRepo()
        .createQueryBuilder("t")
        .leftJoinAndSelect("t.employee", "employee")
        .leftJoinAndSelect("employee.user", "user")
        .where("t.id = :id", { id: t.id })
        .getOne();

      res.json({ success: true, data: toDto(saved!) });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const patchTimelog = [
  validate(updateSchema.partial()),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as Partial<z.infer<typeof updateSchema>>;
      const t = await timelogRepo().findOne({ where: { id: req.params.id } });
      if (!t) throw new AppError("Timelog not found", 404);

      // Only check for duplicates if date or type is actually changing
      const rawDate =
        typeof t.date === "string"
          ? t.date
          : t.date!.toISOString().split("T")[0];
      const newDate = dto.date ?? rawDate;
      const newType = dto.type ?? t.type;
      if (dto.date !== undefined || dto.type !== undefined) {
        await checkDuplicate(t.employeeId!, newDate, newType, t.id);
      }

      if (dto.date !== undefined)
        t.date = new Date(dto.date) as unknown as Date;
      if (dto.totalHours !== undefined) t.totalHours = dto.totalHours;
      if (dto.type !== undefined) t.type = dto.type;
      if (dto.status !== undefined) t.status = dto.status;
      if (dto.description !== undefined) t.description = dto.description;
      if (dto.notes !== undefined) t.notes = dto.notes;

      await timelogRepo().save(t);
      res.json({ success: true, data: toDto(t) });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const removeTimelog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const t = await timelogRepo().findOne({ where: { id: req.params.id } });
    if (!t) throw new AppError("Timelog not found", 404);
    await timelogRepo().remove(t);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ─── Approval workflow ────────────────────────────────────────────────────────

export const getTimelogSummary = [
  validate(summarySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, employeeId } = req.query as z.infer<
        typeof summarySchema
      >;
      const user = req.user!;
      const isAdmin = user.roles.includes("admin");

      let scopedIds: string[] | null = null;
      if (!isAdmin) {
        scopedIds = await getScopedEmployeeIds(user.userId);
        if (scopedIds !== null && scopedIds.length === 0) {
          return res.json({
            success: true,
            data: [],
            totals: { totalHours: 0, byType: {}, byStatus: {} }
          });
        }
      }

      const qb = timelogRepo()
        .createQueryBuilder("t")
        .leftJoinAndSelect("t.employee", "employee")
        .leftJoinAndSelect("employee.user", "user")
        .where("t.date >= :startDate", { startDate })
        .andWhere("t.date <= :endDate", { endDate });

      if (employeeId) {
        qb.andWhere("t.employeeId = :employeeId", { employeeId });
      } else if (scopedIds !== null) {
        qb.andWhere("t.employeeId IN (:...scopedIds)", { scopedIds });
      }

      const timelogs = await qb.getMany();

      // Group by employee
      const byEmployee = new Map<
        string,
        { name: string; rows: typeof timelogs }
      >();
      for (const t of timelogs) {
        if (!t.employeeId) continue;
        if (!byEmployee.has(t.employeeId)) {
          const name = t.employee?.user
            ? `${t.employee.user.firstName} ${t.employee.user.lastName}`
            : t.employeeId;
          byEmployee.set(t.employeeId, { name, rows: [] });
        }
        byEmployee.get(t.employeeId)!.rows.push(t);
      }

      const data = Array.from(byEmployee.entries()).map(
        ([eid, { name, rows }]) => {
          const byType: Record<string, number> = {};
          const byStatus: Record<string, number> = {};
          let totalHours = 0;
          for (const t of rows) {
            const h = Number(t.totalHours);
            totalHours += h;
            byType[t.type] = (byType[t.type] ?? 0) + h;
            byStatus[t.status] = (byStatus[t.status] ?? 0) + h;
          }
          return {
            employeeId: eid,
            employeeName: name,
            totalHours,
            byType,
            byStatus
          };
        }
      );

      // Aggregate totals across all employees
      const totals = data.reduce(
        (acc, row) => {
          acc.totalHours += row.totalHours;
          for (const [k, v] of Object.entries(row.byType)) {
            acc.byType[k] = (acc.byType[k] ?? 0) + v;
          }
          for (const [k, v] of Object.entries(row.byStatus)) {
            acc.byStatus[k] = (acc.byStatus[k] ?? 0) + v;
          }
          return acc;
        },
        {
          totalHours: 0,
          byType: {} as Record<string, number>,
          byStatus: {} as Record<string, number>
        }
      );

      res.json({ success: true, data, totals });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const getTimelogsByEntity = (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};

export const submitTimelog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const t = await timelogRepo().findOne({ where: { id: req.params.id } });
    if (!t) throw new AppError("Timelog not found", 404);

    t.status = TimelogStatus.SUBMITTED;
    await timelogRepo().save(t);

    const saved = await timelogRepo()
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.employee", "employee")
      .leftJoinAndSelect("employee.user", "user")
      .where("t.id = :id", { id: t.id })
      .getOne();

    res.json({ success: true, data: toDto(saved!) });
  } catch (err) {
    next(err);
  }
};

export const approveTimelog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const t = await timelogRepo().findOne({ where: { id: req.params.id } });
    if (!t) throw new AppError("Timelog not found", 404);

    t.status = TimelogStatus.APPROVED;
    t.approved = true;
    t.approvedBy = req.user!.userId;
    t.approvedAt = new Date();
    t.rejectionReason = null as unknown as string;

    await timelogRepo().save(t);

    const saved = await timelogRepo()
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.employee", "employee")
      .leftJoinAndSelect("employee.user", "user")
      .where("t.id = :id", { id: t.id })
      .getOne();

    res.json({ success: true, data: toDto(saved!) });
  } catch (err) {
    next(err);
  }
};

export const rejectTimelog = [
  validate(rejectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rejectionReason } = req.body as z.infer<typeof rejectSchema>;
      const t = await timelogRepo().findOne({ where: { id: req.params.id } });
      if (!t) throw new AppError("Timelog not found", 404);

      t.status = TimelogStatus.REJECTED;
      t.approved = false;
      t.rejectionReason = rejectionReason;

      await timelogRepo().save(t);

      const saved = await timelogRepo()
        .createQueryBuilder("t")
        .leftJoinAndSelect("t.employee", "employee")
        .leftJoinAndSelect("employee.user", "user")
        .where("t.id = :id", { id: t.id })
        .getOne();

      res.json({ success: true, data: toDto(saved!) });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const bulkSubmitTimelogs = [
  validate(bulkSubmitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { timelogIds } = req.body as z.infer<typeof bulkSubmitSchema>;

      const timelogs = await timelogRepo()
        .createQueryBuilder("t")
        .where("t.id IN (:...timelogIds)", { timelogIds })
        .andWhere("t.status = :status", { status: TimelogStatus.DRAFT })
        .getMany();

      for (const t of timelogs) {
        t.status = TimelogStatus.SUBMITTED;
      }

      await timelogRepo().save(timelogs);
      res.json({ success: true, updated: timelogs.length });
    } catch (err) {
      next(err);
    }
  }
] as const;

/**
 * Bulk-approve or bulk-reject all timelogs for an employee in a given week.
 * Body: { employeeId, weekStart, weekEnd, action, rejectionReason? }
 */
export const bulkApproveTimelogs = [
  validate(bulkReviewWeekSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId, weekStart, weekEnd, action, rejectionReason } =
        req.body as z.infer<typeof bulkReviewWeekSchema>;
      const user = req.user!;
      const isAdmin = user.roles.includes("admin");

      if (!isAdmin) {
        const scopedIds = await getScopedEmployeeIds(user.userId);
        if (!scopedIds || !scopedIds.includes(employeeId)) {
          throw new AppError(
            "Not authorised to review this employee's timelogs",
            403
          );
        }
      }

      const timelogs = await timelogRepo()
        .createQueryBuilder("t")
        .where("t.employeeId = :employeeId", { employeeId })
        .andWhere("t.date >= :weekStart", { weekStart })
        .andWhere("t.date <= :weekEnd", { weekEnd })
        .andWhere("t.status IN (:...statuses)", {
          statuses: [TimelogStatus.SUBMITTED, TimelogStatus.DRAFT]
        })
        .getMany();

      const now = new Date();
      for (const t of timelogs) {
        if (action === "approved") {
          t.status = TimelogStatus.APPROVED;
          t.approved = true;
          t.approvedBy = user.userId;
          t.approvedAt = now;
          t.rejectionReason = null as unknown as string;
        } else {
          t.status = TimelogStatus.REJECTED;
          t.approved = false;
          t.rejectionReason = rejectionReason!;
        }
      }

      await timelogRepo().save(timelogs);
      res.json({ success: true, updated: timelogs.length });
    } catch (err) {
      next(err);
    }
  }
] as const;

/**
 * GET /timelogs/weekly-approvals?weekStart=YYYY-MM-DD&weekEnd=YYYY-MM-DD
 * Returns per-employee weekly summaries, scoped by role.
 */
export const listWeeklyApprovals = [
  validate(weeklyApprovalsSchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { weekStart, weekEnd } = req.query as z.infer<
        typeof weeklyApprovalsSchema
      >;
      const user = req.user!;
      const isAdmin = user.roles.includes("admin");

      let scopedIds: string[] | null = null;

      if (!isAdmin) {
        scopedIds = await getScopedEmployeeIds(user.userId);
        if (scopedIds !== null && scopedIds.length === 0) {
          return res.json({ success: true, data: [] });
        }
      }

      const qb = timelogRepo()
        .createQueryBuilder("t")
        .leftJoinAndSelect("t.employee", "employee")
        .leftJoinAndSelect("employee.user", "user")
        .where("t.date >= :weekStart", { weekStart })
        .andWhere("t.date <= :weekEnd", { weekEnd });

      if (scopedIds !== null) {
        qb.andWhere("t.employeeId IN (:...scopedIds)", { scopedIds });
      }

      const timelogs = await qb.getMany();

      // Group by employee
      const byEmployee = new Map<string, Timelog[]>();
      for (const t of timelogs) {
        if (!t.employeeId) continue;
        const arr = byEmployee.get(t.employeeId) ?? [];
        arr.push(t);
        byEmployee.set(t.employeeId, arr);
      }

      const data = Array.from(byEmployee.entries()).map(([empId, tls]) => {
        const emp = tls[0].employee;
        const employeeName = emp?.user
          ? `${emp.user.firstName} ${emp.user.lastName}`.trim()
          : empId;

        const totalHours = tls.reduce((s, t) => s + Number(t.totalHours), 0);
        const draftCount = tls.filter(
          (t) => t.status === TimelogStatus.DRAFT
        ).length;
        const submittedCount = tls.filter(
          (t) => t.status === TimelogStatus.SUBMITTED
        ).length;
        const approvedCount = tls.filter(
          (t) => t.status === TimelogStatus.APPROVED
        ).length;
        const rejectedCount = tls.filter(
          (t) => t.status === TimelogStatus.REJECTED
        ).length;

        let weekStatus: "approved" | "rejected" | "submitted" | "draft" =
          "draft";
        if (approvedCount === tls.length) weekStatus = "approved";
        else if (rejectedCount > 0) weekStatus = "rejected";
        else if (submittedCount > 0) weekStatus = "submitted";

        return {
          employeeId: empId,
          employeeName,
          weekStart,
          weekEnd,
          totalHours,
          draftCount,
          submittedCount,
          approvedCount,
          rejectedCount,
          weekStatus,
          timelogs: tls.map(toDto)
        };
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;
