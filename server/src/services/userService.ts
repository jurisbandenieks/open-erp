import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { Employee } from "../entities/Employee.entity";
import { Owner } from "../entities/Owner.entity";
import { UserRole, UserStatus, Country } from "../entities/enums";
import { AppError } from "../middleware/errorHandler";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  country: z.nativeEnum(Country).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional()
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  country: z.nativeEnum(Country).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  emailVerified: z.boolean().optional()
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  companyId: z.string().uuid().optional()
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// ─── Service ──────────────────────────────────────────────────────────────────

const userRepo = () => AppDataSource.getRepository(User);

/**
 * Paginated list — no relations populated (lean response).
 * Password is never returned (select: false on the column).
 */
export const getUsers = async (query: ListUsersQuery) => {
  const { page, limit, role, status, search, companyId } = query;

  const qb = userRepo()
    .createQueryBuilder("user")
    .skip((page - 1) * limit)
    .take(limit)
    .orderBy("user.createdAt", "DESC")
    .where("user.role != :adminRole", { adminRole: UserRole.ADMIN });

  if (role) qb.andWhere("user.role = :role", { role });
  if (status) qb.andWhere("user.status = :status", { status });
  if (search) {
    qb.andWhere(
      "(LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(user.email) LIKE :q)",
      { q: `%${search.toLowerCase()}%` }
    );
  }
  if (companyId) {
    qb.innerJoin(
      Employee,
      "emp",
      "emp.userId = user.id AND emp.companyId = :companyId",
      { companyId }
    );
  }

  const [users, total] = await qb.getManyAndCount();

  // Enrich with isOwner / isManager flags using two batch lookups
  let ownerIds = new Set<string>();
  let managerIds = new Set<string>();

  if (users.length > 0) {
    const ids = users.map((u) => u.id);

    const ownerRows = await AppDataSource.getRepository(Owner)
      .createQueryBuilder("o")
      .select("o.userId", "userId")
      .where("o.userId IN (:...ids)", { ids })
      .getRawMany<{ userId: string }>();
    ownerIds = new Set(ownerRows.map((r) => r.userId));

    const managerRows = await AppDataSource.getRepository(Employee)
      .createQueryBuilder("emp")
      .innerJoin("employee_managers", "em", 'em."managerId" = emp.id')
      .select("emp.userId", "userId")
      .where("emp.userId IN (:...ids)", { ids })
      .getRawMany<{ userId: string }>();
    managerIds = new Set(managerRows.map((r) => r.userId));
  }

  const data = users.map((u) => ({
    ...u,
    isOwner: ownerIds.has(u.id),
    isManager: managerIds.has(u.id)
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Single user — fully populated with employee and owner profiles.
 */
export const getUserById = async (id: string) => {
  const user = await userRepo().findOne({ where: { id } });
  if (!user) throw new AppError(`User ${id} not found`, 404);

  const [employee, owner] = await Promise.all([
    AppDataSource.getRepository(Employee)
      .createQueryBuilder("emp")
      .leftJoinAndSelect("emp.company", "empCompany")
      .leftJoinAndSelect("emp.manages", "manages")
      .where("emp.userId = :id", { id })
      .getOne(),

    AppDataSource.getRepository(Owner)
      .createQueryBuilder("owner")
      .leftJoinAndSelect("owner.companies", "ownerCompanies")
      .where("owner.userId = :id", { id })
      .getOne()
  ]);

  return {
    ...user,
    employee: employee ?? null,
    owner: owner ?? null
  };
};

/**
 * Create a new user — password is hashed before persisting.
 */
export const createUser = async (dto: CreateUserDto) => {
  const existing = await userRepo().findOne({ where: { email: dto.email } });
  if (existing) throw new AppError("Email already in use", 409);

  const user = userRepo().create({
    ...dto,
    password: bcrypt.hashSync(dto.password, 10)
  });

  return userRepo().save(user);
};

/**
 * Update non-sensitive user fields. Password changes are intentionally excluded
 * from this endpoint and should go through a dedicated change-password flow.
 */
export const updateUser = async (id: string, dto: UpdateUserDto) => {
  const user = await userRepo().findOne({ where: { id } });
  if (!user) throw new AppError(`User ${id} not found`, 404);

  if (dto.email && dto.email !== user.email) {
    const existing = await userRepo().findOne({ where: { email: dto.email } });
    if (existing) throw new AppError("Email already in use", 409);
  }

  Object.assign(user, dto);
  return userRepo().save(user);
};

/**
 * Hard-delete a user. Cascades to Owner, Employee, Manager via DB constraints.
 */
export const deleteUser = async (id: string) => {
  const user = await userRepo().findOne({ where: { id } });
  if (!user) throw new AppError(`User ${id} not found`, 404);
  await userRepo().remove(user);
};
