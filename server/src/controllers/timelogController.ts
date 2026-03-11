import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppDataSource } from "../config/database";
import { Timelog } from "../entities/Timelog.entity";
import { Employee } from "../entities/Employee.entity";
import { TimelogType, TimelogStatus } from "../entities/enums";
import { validate } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";

const timelogRepo = () => AppDataSource.getRepository(Timelog);
const employeeRepo = () => AppDataSource.getRepository(Employee);

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

// ─── Stub handlers (approval workflow — future) ───────────────────────────────

export const getTimelogSummary = (_req: Request, res: Response) => {
  res.json({ success: true, data: {} });
};

export const getTimelogsByEntity = (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};

export const submitTimelog = (_req: Request, res: Response) => {
  res.json({ success: true, data: null, message: "Submit timelog" });
};

export const approveTimelog = (_req: Request, res: Response) => {
  res.json({ success: true, data: null, message: "Approve timelog" });
};

export const rejectTimelog = (_req: Request, res: Response) => {
  res.json({ success: true, data: null, message: "Reject timelog" });
};

export const bulkSubmitTimelogs = (_req: Request, res: Response) => {
  res.json({ success: true, message: "Bulk submit timelogs" });
};

export const bulkApproveTimelogs = (_req: Request, res: Response) => {
  res.json({ success: true, message: "Bulk approve timelogs" });
};
