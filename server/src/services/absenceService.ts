import { z } from "zod";
import { AppDataSource } from "../config/database";
import { Absence } from "../entities/Absence.entity";
import { Employee } from "../entities/Employee.entity";
import { Holiday } from "../entities/Holiday.entity";
import { Owner } from "../entities/Owner.entity";
import { TimeInLieu } from "../entities/TimeInLieu.entity";
import { AppError } from "../middleware/errorHandler";
import {
  AbsenceType,
  AbsenceStatus,
  TimeInLieuStatus
} from "../entities/enums";
import type { AuthPayload } from "./authService";

const absenceRepo = () => AppDataSource.getRepository(Absence);
const employeeRepo = () => AppDataSource.getRepository(Employee);
const holidayRepo = () => AppDataSource.getRepository(Holiday);
const ownerRepo = () => AppDataSource.getRepository(Owner);
const tilRepo = () => AppDataSource.getRepository(TimeInLieu);

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const listAbsencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  employeeId: z.string().uuid().optional(),
  type: z.nativeEnum(AbsenceType).optional(),
  status: z.nativeEnum(AbsenceStatus).optional(),
  year: z.coerce.number().int().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional()
});

export const createAbsenceSchema = z
  .object({
    employeeId: z.string().uuid(),
    type: z.nativeEnum(AbsenceType),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    notes: z.string().optional(),
    timeInLieuId: z.string().uuid().optional()
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be >= startDate",
    path: ["endDate"]
  });

export const updateAbsenceSchema = z
  .object({
    type: z.nativeEnum(AbsenceType).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    notes: z.string().optional(),
    timeInLieuId: z.string().uuid().optional()
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: "endDate must be >= startDate",
    path: ["endDate"]
  });

export const reviewAbsenceSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional()
});

export type ListAbsencesQuery = z.infer<typeof listAbsencesQuerySchema>;
export type CreateAbsenceDto = z.infer<typeof createAbsenceSchema>;
export type UpdateAbsenceDto = z.infer<typeof updateAbsenceSchema>;
export type ReviewAbsenceDto = z.infer<typeof reviewAbsenceSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toDateStr = (d: Date | string): string =>
  typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);

const toDto = (a: Absence) => ({
  id: a.id,
  employeeId: a.employeeId,
  employeeName: a.employee?.user
    ? `${a.employee.user.firstName} ${a.employee.user.lastName}`.trim()
    : undefined,
  type: a.type,
  status: a.status,
  startDate: toDateStr(a.startDate),
  endDate: toDateStr(a.endDate),
  totalDays: a.totalDays,
  notes: a.notes ?? null,
  attachments: a.attachments ?? [],
  requestedAt: a.requestedAt,
  reviewedBy: a.reviewedBy ?? null,
  reviewedAt: a.reviewedAt ?? null,
  rejectionReason: a.rejectionReason ?? null,
  timeInLieuId:
    (a as Absence & { timeInLieu?: TimeInLieu | null }).timeInLieu?.id ?? null,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt
});

// Count working days in [start, end] inclusive, excluding weekends and public/national/company holidays
async function countWorkingDays(
  startStr: string,
  endStr: string,
  companyId?: string
): Promise<number> {
  const qb = holidayRepo()
    .createQueryBuilder("h")
    .where("h.date >= :start AND h.date <= :end", {
      start: startStr,
      end: endStr
    })
    .andWhere("h.type IN ('public', 'national')");

  if (companyId) {
    qb.orWhere(
      "(h.type = 'company' AND h.companyId = :companyId AND h.date >= :start AND h.date <= :end)",
      { companyId, start: startStr, end: endStr }
    );
  }

  const holidays = await qb.getMany();
  const holidaySet = new Set(holidays.map((h) => toDateStr(h.date)));

  let days = 0;
  const current = new Date(startStr);
  const end = new Date(endStr);
  while (current <= end) {
    const dow = current.getDay();
    const dateStr = current.toISOString().slice(0, 10);
    if (dow !== 0 && dow !== 6 && !holidaySet.has(dateStr)) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// Throws 409 if dates overlap with existing non-cancelled/non-rejected absences
async function assertNoOverlap(
  employeeId: string,
  startDate: string,
  endDate: string,
  excludeId?: string
): Promise<void> {
  const qb = absenceRepo()
    .createQueryBuilder("a")
    .where("a.employeeId = :employeeId", { employeeId })
    .andWhere("a.status NOT IN (:...excluded)", {
      excluded: [AbsenceStatus.CANCELLED, AbsenceStatus.REJECTED]
    })
    .andWhere("a.startDate <= :endDate AND a.endDate >= :startDate", {
      startDate,
      endDate
    });

  if (excludeId) {
    qb.andWhere("a.id != :excludeId", { excludeId });
  }

  const overlap = await qb.getOne();
  if (overlap) {
    throw new AppError(
      `Absence dates overlap with an existing absence (${toDateStr(overlap.startDate)} – ${toDateStr(overlap.endDate)})`,
      409
    );
  }
}

// Resolve the employee ID for the requesting user (non-admin must own the absence)
async function resolveOwnEmployeeId(userId: string): Promise<string> {
  const emp = await employeeRepo().findOne({ where: { userId } });
  if (!emp)
    throw new AppError("No employee record found for your user account", 404);
  return emp.id;
}

// ─── List ──────────────────────────────────────────────────────────────────────

export const listAbsences = async (
  query: ListAbsencesQuery,
  user: AuthPayload
) => {
  const {
    page,
    limit,
    employeeId,
    type,
    status,
    year,
    startDateFrom,
    startDateTo
  } = query;
  const isAdmin = user.roles.includes("admin");

  const qb = absenceRepo()
    .createQueryBuilder("a")
    .leftJoinAndSelect("a.employee", "emp")
    .leftJoinAndSelect("emp.user", "user")
    .leftJoinAndSelect("a.timeInLieu", "til")
    .skip((page - 1) * limit)
    .take(limit)
    .orderBy("a.requestedAt", "DESC");

  if (!isAdmin) {
    const myEmp = await employeeRepo().findOne({
      where: { userId: user.userId },
      relations: ["manages"]
    });
    if (!myEmp) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Build the set of employee IDs visible to this user
    let scopedIds: string[] = [myEmp.id];

    const owner = await ownerRepo().findOne({ where: { userId: user.userId } });
    if (owner) {
      // Owner: all employees across their companies
      const companyEmps = await employeeRepo()
        .createQueryBuilder("emp")
        .innerJoin("emp.company", "cmp", "cmp.ownerId = :ownerId", {
          ownerId: owner.id
        })
        .select("emp.id", "id")
        .getRawMany<{ id: string }>();
      if (companyEmps.length > 0) scopedIds = companyEmps.map((e) => e.id);
    } else if (myEmp.manages?.length) {
      // Manager: own record + direct managees
      scopedIds = [myEmp.id, ...myEmp.manages.map((e) => e.id)];
    }

    if (employeeId) {
      if (!scopedIds.includes(employeeId)) {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
      qb.andWhere("a.employeeId = :employeeId", { employeeId });
    } else {
      qb.andWhere("a.employeeId IN (:...empIds)", { empIds: scopedIds });
    }
  } else if (employeeId) {
    qb.andWhere("a.employeeId = :employeeId", { employeeId });
  }

  if (type) qb.andWhere("a.type = :type", { type });
  if (status) qb.andWhere("a.status = :status", { status });
  if (year) {
    qb.andWhere("EXTRACT(year FROM a.startDate) = :year", { year });
  }
  if (startDateFrom)
    qb.andWhere("a.startDate >= :startDateFrom", { startDateFrom });
  if (startDateTo) qb.andWhere("a.startDate <= :startDateTo", { startDateTo });

  const [absences, total] = await qb.getManyAndCount();
  return {
    data: absences.map(toDto),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// ─── Single ────────────────────────────────────────────────────────────────────

export const getAbsenceById = async (id: string, user: AuthPayload) => {
  const a = await absenceRepo()
    .createQueryBuilder("a")
    .leftJoinAndSelect("a.employee", "emp")
    .leftJoinAndSelect("emp.user", "user")
    .leftJoinAndSelect("a.timeInLieu", "til")
    .where("a.id = :id", { id })
    .getOne();

  if (!a) throw new AppError(`Absence ${id} not found`, 404);

  const isAdmin = user.roles.includes("admin");
  if (!isAdmin) {
    // Allow if they can review this absence (owner/manager) or it belongs to them
    const myEmp = await employeeRepo().findOne({
      where: { userId: user.userId },
      relations: ["manages"]
    });
    if (!myEmp) throw new AppError("Forbidden", 403);

    if (myEmp.id !== a.employeeId) {
      try {
        await assertCanReview(a.employee, user);
      } catch {
        throw new AppError("Forbidden", 403);
      }
    }
  }

  return toDto(a);
};

// ─── Get by employee ───────────────────────────────────────────────────────────

export const getAbsencesByEmployee = async (
  employeeId: string,
  query: { year?: number; status?: string },
  user: AuthPayload
) => {
  const isAdmin = user.roles.includes("admin");
  if (!isAdmin) {
    const myEmp = await employeeRepo().findOne({
      where: { userId: user.userId },
      relations: ["manages"]
    });
    if (!myEmp) throw new AppError("Forbidden", 403);

    if (myEmp.id !== employeeId) {
      // Allow if owner or manager of that employee
      const targetEmp = await employeeRepo().findOne({
        where: { id: employeeId }
      });
      if (!targetEmp) throw new AppError("Employee not found", 404);
      try {
        await assertCanReview(targetEmp, user);
      } catch {
        throw new AppError("Forbidden", 403);
      }
    }
  }

  const qb = absenceRepo()
    .createQueryBuilder("a")
    .leftJoinAndSelect("a.employee", "emp")
    .leftJoinAndSelect("emp.user", "user")
    .leftJoinAndSelect("a.timeInLieu", "til")
    .where("a.employeeId = :employeeId", { employeeId })
    .orderBy("a.startDate", "DESC");

  if (query.year) {
    qb.andWhere("EXTRACT(year FROM a.startDate) = :year", { year: query.year });
  }
  if (query.status) {
    qb.andWhere("a.status = :status", { status: query.status });
  }

  const absences = await qb.getMany();
  return absences.map(toDto);
};

// ─── Create ────────────────────────────────────────────────────────────────────

export const createAbsence = async (
  dto: CreateAbsenceDto,
  user: AuthPayload
) => {
  const isAdmin = user.roles.includes("admin");

  // Non-admin can only create for themselves
  if (!isAdmin) {
    const myEmpId = await resolveOwnEmployeeId(user.userId);
    if (dto.employeeId !== myEmpId) {
      throw new AppError("You can only create absences for yourself", 403);
    }
  }

  const employee = await employeeRepo()
    .createQueryBuilder("emp")
    .leftJoinAndSelect("emp.company", "company")
    .where("emp.id = :id", { id: dto.employeeId })
    .getOne();

  if (!employee)
    throw new AppError(`Employee ${dto.employeeId} not found`, 404);

  // Validate TIME_IN_LIEU specific logic
  let timeInLieu: TimeInLieu | null = null;
  if (dto.type === AbsenceType.TIME_IN_LIEU) {
    if (!dto.timeInLieuId) {
      throw new AppError(
        "timeInLieuId is required for TIME_IN_LIEU absence type",
        400
      );
    }
    timeInLieu = await tilRepo().findOne({
      where: { id: dto.timeInLieuId, employeeId: dto.employeeId }
    });
    if (!timeInLieu) {
      throw new AppError(
        "Time in lieu record not found or does not belong to this employee",
        404
      );
    }
    if (timeInLieu.status !== TimeInLieuStatus.APPROVED) {
      throw new AppError(
        "Time in lieu record must be approved before it can be used",
        400
      );
    }
    if (timeInLieu.absenceId) {
      throw new AppError("This time in lieu record has already been used", 409);
    }
  }

  await assertNoOverlap(dto.employeeId, dto.startDate, dto.endDate);

  const totalDays = await countWorkingDays(
    dto.startDate,
    dto.endDate,
    employee.companyId
  );

  const absence = absenceRepo().create({
    employeeId: dto.employeeId,
    type: dto.type,
    status: AbsenceStatus.PENDING,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    totalDays,
    notes: dto.notes,
    requestedAt: new Date(),
    timeInLieu: timeInLieu ?? undefined
  });

  await absenceRepo().save(absence);

  return getAbsenceById(absence.id, user);
};

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateAbsence = async (
  id: string,
  dto: UpdateAbsenceDto,
  user: AuthPayload
) => {
  const a = await absenceRepo()
    .createQueryBuilder("a")
    .leftJoinAndSelect("a.employee", "emp")
    .leftJoinAndSelect("emp.company", "company")
    .where("a.id = :id", { id })
    .getOne();

  if (!a) throw new AppError(`Absence ${id} not found`, 404);

  const isAdmin = user.roles.includes("admin");
  if (!isAdmin) {
    const myEmpId = await resolveOwnEmployeeId(user.userId);
    if (a.employeeId !== myEmpId) throw new AppError("Forbidden", 403);
  }

  if (a.status !== AbsenceStatus.PENDING) {
    throw new AppError("Only pending absences can be edited", 400);
  }

  const newStartDate = dto.startDate ?? toDateStr(a.startDate);
  const newEndDate = dto.endDate ?? toDateStr(a.endDate);
  const newType = dto.type ?? a.type;

  // Validate TIME_IN_LIEU if type is being set/changed
  let timeInLieu: TimeInLieu | undefined;
  if (newType === AbsenceType.TIME_IN_LIEU && dto.timeInLieuId) {
    const til = await tilRepo().findOne({
      where: { id: dto.timeInLieuId, employeeId: a.employeeId }
    });
    if (!til) throw new AppError("Time in lieu record not found", 404);
    if (til.status !== TimeInLieuStatus.APPROVED) {
      throw new AppError("Time in lieu record must be approved", 400);
    }
    if (til.absenceId && til.absenceId !== id) {
      throw new AppError("This time in lieu record has already been used", 409);
    }
    timeInLieu = til;
  }

  await assertNoOverlap(a.employeeId, newStartDate, newEndDate, id);

  const totalDays = await countWorkingDays(
    newStartDate,
    newEndDate,
    a.employee?.companyId
  );

  if (dto.startDate) a.startDate = new Date(dto.startDate);
  if (dto.endDate) a.endDate = new Date(dto.endDate);
  if (dto.type) a.type = dto.type;
  if (dto.notes !== undefined) a.notes = dto.notes;
  if (timeInLieu)
    (a as Absence & { timeInLieu: TimeInLieu }).timeInLieu = timeInLieu;
  a.totalDays = totalDays;

  await absenceRepo().save(a);

  return getAbsenceById(id, user);
};

// ─── Delete / Cancel ───────────────────────────────────────────────────────────

export const deleteAbsence = async (id: string, user: AuthPayload) => {
  const a = await absenceRepo().findOne({ where: { id } });
  if (!a) throw new AppError(`Absence ${id} not found`, 404);

  const isAdmin = user.roles.includes("admin");
  if (!isAdmin) {
    const myEmpId = await resolveOwnEmployeeId(user.userId);
    if (a.employeeId !== myEmpId) throw new AppError("Forbidden", 403);
  }

  if (a.status === AbsenceStatus.APPROVED && !isAdmin) {
    throw new AppError(
      "Approved absences can only be cancelled by an admin",
      403
    );
  }

  // Instead of hard-delete, cancel pending/rejected absences; admins can delete
  if (isAdmin) {
    await absenceRepo().remove(a);
  } else {
    a.status = AbsenceStatus.CANCELLED;
    await absenceRepo().save(a);
  }
};

// ─── Review authorisation helper ─────────────────────────────────────────────

/**
 * Returns true when the user is allowed to approve/reject absences for the
 * given employee.  Permitted reviewers are:
 *   1. Admins (system-wide)
 *   2. The owner of the company the employee belongs to
 *   3. Any direct manager of the employee
 */
async function assertCanReview(
  employee: Employee,
  user: AuthPayload
): Promise<void> {
  if (user.roles.includes("admin")) return;

  // Check: is the user the owner of the employee's company?
  const owner = await ownerRepo().findOne({
    where: { userId: user.userId }
  });
  if (owner) {
    // Verify this owner actually owns the employee's company
    const ownsCompany = await AppDataSource.getRepository("Company")
      .createQueryBuilder("c")
      .where("c.id = :companyId AND c.ownerId = :ownerId", {
        companyId: employee.companyId,
        ownerId: owner.id
      })
      .getCount();
    if (ownsCompany > 0) return;
  }

  // Check: is the user a direct manager of this employee?
  const emp = await employeeRepo()
    .createQueryBuilder("emp")
    .leftJoinAndSelect("emp.managedBy", "mgr")
    .leftJoinAndSelect("mgr.user", "mgrUser")
    .where("emp.id = :id", { id: employee.id })
    .getOne();

  const isManager =
    emp?.managedBy?.some((m) => m.userId === user.userId) ?? false;
  if (isManager) return;

  throw new AppError(
    "Only the employee's company owner or a direct manager may review this absence",
    403
  );
}

// ─── Review (Approve / Reject) ─────────────────────────────────────────────────

export const reviewAbsence = async (
  id: string,
  dto: ReviewAbsenceDto,
  user: AuthPayload
) => {
  const a = await absenceRepo()
    .createQueryBuilder("a")
    .leftJoinAndSelect("a.employee", "emp")
    .leftJoinAndSelect("emp.user", "user")
    .leftJoinAndSelect("a.timeInLieu", "til")
    .where("a.id = :id", { id })
    .getOne();

  if (!a) throw new AppError(`Absence ${id} not found`, 404);

  await assertCanReview(a.employee, user);

  if (a.status === AbsenceStatus.CANCELLED) {
    throw new AppError("Cannot review a cancelled absence", 400);
  }

  const reviewStatus =
    dto.status === "approved" ? AbsenceStatus.APPROVED : AbsenceStatus.REJECTED;

  if (reviewStatus === AbsenceStatus.REJECTED && !dto.rejectionReason) {
    throw new AppError(
      "rejectionReason is required when rejecting an absence",
      400
    );
  }

  // If approving a TIME_IN_LIEU absence, mark the TIL record as USED
  if (
    reviewStatus === AbsenceStatus.APPROVED &&
    a.type === AbsenceType.TIME_IN_LIEU
  ) {
    const til = (a as Absence & { timeInLieu?: TimeInLieu | null }).timeInLieu;
    if (til) {
      til.status = TimeInLieuStatus.USED;
      til.hoursUsed = Number(til.hours);
      til.usedDate = new Date();
      await tilRepo().save(til);
    }
  }

  // If rejecting a previously approved TIME_IN_LIEU, restore the TIL record
  if (
    reviewStatus === AbsenceStatus.REJECTED &&
    a.status === AbsenceStatus.APPROVED &&
    a.type === AbsenceType.TIME_IN_LIEU
  ) {
    const til = (a as Absence & { timeInLieu?: TimeInLieu | null }).timeInLieu;
    if (til) {
      til.status = TimeInLieuStatus.APPROVED;
      til.hoursUsed = 0;
      til.usedDate = null as unknown as Date;
      await tilRepo().save(til);
    }
  }

  a.status = reviewStatus;
  a.reviewedBy = user.userId;
  a.reviewedAt = new Date();
  a.rejectionReason = dto.rejectionReason ?? (null as unknown as string);

  await absenceRepo().save(a);

  return toDto(a);
};

// ─── Vacation balance ─────────────────────────────────────────────────────────

export const getVacationBalance = async (
  employeeId: string,
  year: number,
  user: AuthPayload
) => {
  const isAdmin = user.roles.includes("admin");
  if (!isAdmin) {
    const myEmpId = await resolveOwnEmployeeId(user.userId);
    if (myEmpId !== employeeId) throw new AppError("Forbidden", 403);
  }

  const emp = await employeeRepo().findOne({ where: { id: employeeId } });
  if (!emp) throw new AppError(`Employee ${employeeId} not found`, 404);

  const absences = await absenceRepo()
    .createQueryBuilder("a")
    .where("a.employeeId = :employeeId", { employeeId })
    .andWhere("a.type = :type", { type: AbsenceType.VACATION })
    .andWhere("EXTRACT(year FROM a.startDate) = :year", { year })
    .andWhere("a.status IN (:...statuses)", {
      statuses: [AbsenceStatus.APPROVED, AbsenceStatus.PENDING]
    })
    .getMany();

  const approved = absences
    .filter((a) => a.status === AbsenceStatus.APPROVED)
    .reduce((sum, a) => sum + a.totalDays, 0);

  const pending = absences
    .filter((a) => a.status === AbsenceStatus.PENDING)
    .reduce((sum, a) => sum + a.totalDays, 0);

  // Default allowance — can be extended to a per-employee allocation table
  const DEFAULT_VACATION_DAYS = 25;

  return {
    employeeId,
    year,
    totalAllowed: DEFAULT_VACATION_DAYS,
    usedDays: approved,
    pendingDays: pending,
    remainingDays: DEFAULT_VACATION_DAYS - approved - pending
  };
};
