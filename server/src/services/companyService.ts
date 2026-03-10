import { z } from "zod";
import { AppDataSource } from "../config/database";
import { Company } from "../entities/Company.entity";
import { Owner } from "../entities/Owner.entity";
import { AppError } from "../middleware/errorHandler";
import { CompanyStatus, Country } from "../entities/enums";

const companyRepo = () => AppDataSource.getRepository(Company);
const ownerRepo = () => AppDataSource.getRepository(Owner);

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const listCompaniesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(CompanyStatus).optional(),
  ownerId: z.string().uuid().optional()
});

export const createCompanySchema = z.object({
  name: z.string().min(1),
  registrationNumber: z.string().min(1),
  vatNumber: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.nativeEnum(Country).optional(),
  currency: z.string().optional(),
  foundedAt: z.string().optional(),
  ownerId: z.string().uuid()
});

export const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  vatNumber: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.nativeEnum(Country).optional(),
  currency: z.string().optional(),
  status: z.nativeEnum(CompanyStatus).optional()
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;
export type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

// ─── DTO ──────────────────────────────────────────────────────────────────────

const toDto = (company: Company) => ({
  id: company.id,
  name: company.name,
  registrationNumber: company.registrationNumber,
  vatNumber: company.vatNumber ?? null,
  status: company.status,
  description: company.description ?? null,
  website: company.website ?? null,
  phone: company.phone ?? null,
  email: company.email ?? null,
  address: company.address ?? null,
  city: company.city ?? null,
  country: company.country ?? null,
  logoUrl: company.logoUrl ?? null,
  currency: company.currency ?? null,
  foundedAt: company.foundedAt ?? null,
  ownerId: company.ownerId,
  ownerName: company.owner
    ? `${company.owner.user?.firstName ?? ""} ${company.owner.user?.lastName ?? ""}`.trim()
    : null,
  createdAt: company.createdAt,
  updatedAt: company.updatedAt
});

// ─── List ──────────────────────────────────────────────────────────────────────

export const listCompanies = async (
  query: ListCompaniesQuery,
  ownerIds?: string[] // if provided, filter to only these owners
) => {
  const { page, limit, search, status, ownerId } = query;

  const qb = companyRepo()
    .createQueryBuilder("company")
    .leftJoinAndSelect("company.owner", "owner")
    .leftJoinAndSelect("owner.user", "ownerUser")
    .skip((page - 1) * limit)
    .take(limit)
    .orderBy("company.name", "ASC");

  if (status) qb.andWhere("company.status = :status", { status });

  if (ownerId) {
    qb.andWhere("company.ownerId = :ownerId", { ownerId });
  } else if (ownerIds && ownerIds.length > 0) {
    qb.andWhere("company.ownerId IN (:...ownerIds)", { ownerIds });
  }

  if (search) {
    qb.andWhere(
      "(LOWER(company.name) LIKE :q OR LOWER(company.registrationNumber) LIKE :q OR LOWER(company.city) LIKE :q)",
      { q: `%${search.toLowerCase()}%` }
    );
  }

  const [companies, total] = await qb.getManyAndCount();
  return {
    data: companies.map(toDto),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// ─── Single ────────────────────────────────────────────────────────────────────

export const getCompanyById = async (id: string) => {
  const company = await companyRepo()
    .createQueryBuilder("company")
    .leftJoinAndSelect("company.owner", "owner")
    .leftJoinAndSelect("owner.user", "ownerUser")
    .where("company.id = :id", { id })
    .getOne();

  if (!company) throw new AppError(`Company ${id} not found`, 404);
  return toDto(company);
};

// ─── Create ────────────────────────────────────────────────────────────────────

export const createCompany = async (dto: CreateCompanyDto) => {
  const existing = await companyRepo().findOne({
    where: { registrationNumber: dto.registrationNumber }
  });
  if (existing) throw new AppError("Registration number already in use", 409);

  const owner = await ownerRepo().findOne({ where: { id: dto.ownerId } });
  if (!owner) throw new AppError("Owner not found", 404);

  const company = companyRepo().create({
    name: dto.name,
    registrationNumber: dto.registrationNumber,
    vatNumber: dto.vatNumber,
    description: dto.description,
    website: dto.website,
    phone: dto.phone,
    email: dto.email,
    address: dto.address,
    city: dto.city,
    country: dto.country as never,
    currency: dto.currency,
    foundedAt: dto.foundedAt ? new Date(dto.foundedAt) : undefined,
    ownerId: dto.ownerId,
    status: CompanyStatus.ACTIVE
  });

  const saved = await companyRepo().save(company);
  return getCompanyById(saved.id);
};

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateCompany = async (id: string, dto: UpdateCompanyDto) => {
  const company = await companyRepo().findOne({ where: { id } });
  if (!company) throw new AppError(`Company ${id} not found`, 404);

  Object.assign(company, {
    ...(dto.name !== undefined && { name: dto.name }),
    ...(dto.vatNumber !== undefined && { vatNumber: dto.vatNumber }),
    ...(dto.description !== undefined && { description: dto.description }),
    ...(dto.website !== undefined && { website: dto.website }),
    ...(dto.phone !== undefined && { phone: dto.phone }),
    ...(dto.email !== undefined && { email: dto.email }),
    ...(dto.address !== undefined && { address: dto.address }),
    ...(dto.city !== undefined && { city: dto.city }),
    ...(dto.country !== undefined && { country: dto.country }),
    ...(dto.currency !== undefined && { currency: dto.currency }),
    ...(dto.status !== undefined && { status: dto.status })
  });

  await companyRepo().save(company);
  return getCompanyById(id);
};

// ─── Ownership check helper ───────────────────────────────────────────────────

export const getOwnerIdForUser = async (
  userId: string
): Promise<string | null> => {
  const owner = await ownerRepo().findOne({ where: { userId } });
  return owner?.id ?? null;
};
