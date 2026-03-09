import { z } from "zod";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee.entity";
import { User } from "../entities/User.entity";
import { AppError } from "../middleware/errorHandler";
import {
  EmploymentStatus,
  ContractType,
  UserRole,
  UserStatus,
  Country
} from "../entities/enums";
import * as bcrypt from "bcryptjs";

const employeeRepo = () => AppDataSource.getRepository(Employee);
const userRepo = () => AppDataSource.getRepository(User);

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.nativeEnum(EmploymentStatus).optional(),
  companyId: z.string().uuid().optional()
});

export const createEmployeeSchema = z.object({
  // User fields
  email: z.string().email(),
  password: z.string().min(8).default("Password1!"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  country: z.nativeEnum(Country).optional(),
  // Employee fields
  employeeNumber: z.string().min(1),
  dateOfBirth: z.string().optional(),
  hireDate: z.string(),
  position: z.string().min(1),
  department: z.string().min(1),
  status: z.nativeEnum(EmploymentStatus).optional(),
  contractType: z.nativeEnum(ContractType).optional(),
  salary: z.coerce.number().optional(),
  workingHoursPerWeek: z.coerce.number().int().optional(),
  companyId: z.string().uuid(),
  managerIds: z.array(z.string().uuid()).optional()
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  status: z.nativeEnum(EmploymentStatus).optional(),
  contractType: z.nativeEnum(ContractType).optional(),
  salary: z.coerce.number().optional(),
  workingHoursPerWeek: z.coerce.number().int().optional(),
  terminationDate: z.string().optional()
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDto = (emp: Employee) => ({
  id: emp.id,
  userId: emp.userId,
  employeeNumber: emp.employeeNumber,
  firstName: emp.user?.firstName ?? "",
  lastName: emp.user?.lastName ?? "",
  email: emp.user?.email ?? "",
  phoneNumber: emp.user?.phoneNumber ?? null,
  position: emp.position,
  department: emp.department,
  status: emp.status,
  contractType: emp.contractType,
  salary: emp.salary ?? null,
  workingHoursPerWeek: emp.workingHoursPerWeek ?? null,
  hireDate: emp.hireDate,
  terminationDate: emp.terminationDate ?? null,
  companyId: emp.companyId,
  managerIds: emp.managedBy?.map((m) => m.id) ?? [],
  manageeIds: emp.manages?.map((m) => m.id) ?? [],
  managerNames:
    emp.managedBy?.map((m) =>
      `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`.trim()
    ) ?? [],
  manageeNames:
    emp.manages?.map((m) =>
      `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`.trim()
    ) ?? [],
  createdAt: emp.createdAt,
  updatedAt: emp.updatedAt
});

// ─── List ──────────────────────────────────────────────────────────────────────

export const listEmployees = async (query: ListEmployeesQuery) => {
  const { page, limit, search, department, status, companyId } = query;

  const qb = employeeRepo()
    .createQueryBuilder("emp")
    .leftJoinAndSelect("emp.user", "user")
    .leftJoinAndSelect("emp.managedBy", "managedBy")
    .leftJoinAndSelect("managedBy.user", "managerUser")
    .leftJoinAndSelect("emp.manages", "manages")
    .leftJoinAndSelect("manages.user", "managedUser")
    .skip((page - 1) * limit)
    .take(limit)
    .orderBy("user.lastName", "ASC")
    .addOrderBy("user.firstName", "ASC");

  if (companyId) qb.andWhere("emp.companyId = :companyId", { companyId });
  if (department) qb.andWhere("emp.department = :department", { department });
  if (status) qb.andWhere("emp.status = :status", { status });
  if (search) {
    qb.andWhere(
      "(LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(user.email) LIKE :q OR LOWER(emp.employeeNumber) LIKE :q OR LOWER(emp.position) LIKE :q OR LOWER(emp.department) LIKE :q)",
      { q: `%${search.toLowerCase()}%` }
    );
  }

  const [employees, total] = await qb.getManyAndCount();
  return {
    data: employees.map(toDto),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// ─── Single ────────────────────────────────────────────────────────────────────

export const getEmployeeById = async (id: string) => {
  const emp = await employeeRepo()
    .createQueryBuilder("emp")
    .leftJoinAndSelect("emp.user", "user")
    .leftJoinAndSelect("emp.manages", "manages")
    .leftJoinAndSelect("manages.user", "managedUser")
    .leftJoinAndSelect("emp.managedBy", "managedBy")
    .leftJoinAndSelect("managedBy.user", "managerUser")
    .where("emp.id = :id", { id })
    .getOne();

  if (!emp) throw new AppError(`Employee ${id} not found`, 404);
  return toDto(emp);
};

// ─── Create ────────────────────────────────────────────────────────────────────

export const createEmployee = async (dto: CreateEmployeeDto) => {
  const existing = await userRepo().findOne({ where: { email: dto.email } });
  if (existing) throw new AppError("Email already in use", 409);

  const existingEmpNumber = await employeeRepo().findOne({
    where: { employeeNumber: dto.employeeNumber }
  });
  if (existingEmpNumber)
    throw new AppError("Employee number already in use", 409);

  const user = userRepo().create({
    email: dto.email,
    password: bcrypt.hashSync(dto.password, 10),
    firstName: dto.firstName,
    lastName: dto.lastName,
    phoneNumber: dto.phoneNumber,
    country: dto.country,
    role: UserRole.USER,
    status: UserStatus.ACTIVE
  });
  await userRepo().save(user);

  const managers = dto.managerIds?.length
    ? await employeeRepo().findByIds(dto.managerIds)
    : [];

  const emp = employeeRepo().create({
    userId: user.id,
    employeeNumber: dto.employeeNumber,
    hireDate: new Date(dto.hireDate),
    dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    position: dto.position,
    department: dto.department,
    status: dto.status ?? EmploymentStatus.ACTIVE,
    contractType: dto.contractType ?? ContractType.FULL_TIME,
    salary: dto.salary,
    workingHoursPerWeek: dto.workingHoursPerWeek,
    companyId: dto.companyId,
    managedBy: managers
  });
  await employeeRepo().save(emp);

  return getEmployeeById(emp.id);
};

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateEmployee = async (id: string, dto: UpdateEmployeeDto) => {
  const emp = await employeeRepo().findOne({
    where: { id },
    relations: ["user"]
  });
  if (!emp) throw new AppError(`Employee ${id} not found`, 404);

  // User fields
  if (dto.firstName !== undefined) emp.user.firstName = dto.firstName;
  if (dto.lastName !== undefined) emp.user.lastName = dto.lastName;
  if (dto.phoneNumber !== undefined) emp.user.phoneNumber = dto.phoneNumber;
  await userRepo().save(emp.user);

  // Employee fields
  if (dto.position !== undefined) emp.position = dto.position;
  if (dto.department !== undefined) emp.department = dto.department;
  if (dto.status !== undefined) emp.status = dto.status;
  if (dto.contractType !== undefined) emp.contractType = dto.contractType;
  if (dto.salary !== undefined) emp.salary = dto.salary;
  if (dto.workingHoursPerWeek !== undefined)
    emp.workingHoursPerWeek = dto.workingHoursPerWeek;
  if (dto.terminationDate !== undefined)
    emp.terminationDate = new Date(dto.terminationDate);
  await employeeRepo().save(emp);

  return getEmployeeById(id);
};

// ─── Delete ────────────────────────────────────────────────────────────────────

export const removeEmployee = async (id: string) => {
  const emp = await employeeRepo().findOne({ where: { id } });
  if (!emp) throw new AppError(`Employee ${id} not found`, 404);
  await employeeRepo().remove(emp);
};

// ─── Managers / Managees ───────────────────────────────────────────────────────

export const getEmployeeManagers = async (id: string) => {
  const emp = await employeeRepo()
    .createQueryBuilder("emp")
    .leftJoinAndSelect("emp.managedBy", "managedBy")
    .leftJoinAndSelect("managedBy.user", "managerUser")
    .where("emp.id = :id", { id })
    .getOne();
  if (!emp) throw new AppError(`Employee ${id} not found`, 404);
  return emp.managedBy.map(toDto);
};

export const setManagers = async (id: string, managerIds: string[]) => {
  const emp = await employeeRepo().findOne({
    where: { id },
    relations: ["managedBy"]
  });
  if (!emp) throw new AppError(`Employee ${id} not found`, 404);
  emp.managedBy = managerIds.length
    ? await employeeRepo().findByIds(managerIds)
    : [];
  await employeeRepo().save(emp);
  return getEmployeeById(id);
};

export const getEmployeeManagees = async (id: string) => {
  const emp = await employeeRepo()
    .createQueryBuilder("emp")
    .leftJoinAndSelect("emp.manages", "manages")
    .leftJoinAndSelect("manages.user", "managedUser")
    .where("emp.id = :id", { id })
    .getOne();
  if (!emp) throw new AppError(`Employee ${id} not found`, 404);
  return emp.manages.map(toDto);
};

export const setManagees = async (id: string, manageeIds: string[]) => {
  const emp = await employeeRepo().findOne({
    where: { id },
    relations: ["manages"]
  });
  if (!emp) throw new AppError(`Employee ${id} not found`, 404);
  emp.manages = manageeIds.length
    ? await employeeRepo().findByIds(manageeIds)
    : [];
  await employeeRepo().save(emp);
  return getEmployeeById(id);
};

/**
 * Returns all employees belonging directly to a company.
 */
export const getEmployeesByCompany = async (
  companyId: string
): Promise<Employee[]> => {
  const employees = await employeeRepo()
    .createQueryBuilder("employee")
    .where("employee.companyId = :companyId", { companyId })
    .leftJoinAndSelect("employee.user", "user")
    .leftJoinAndSelect("employee.manages", "manages")
    .leftJoinAndSelect("manages.user", "managedUser")
    .orderBy("user.lastName", "ASC")
    .addOrderBy("user.firstName", "ASC")
    .getMany();

  if (employees.length === 0) {
    throw new AppError(`No employees found for company ${companyId}`, 404);
  }

  return employees;
};
