import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { Owner } from "../entities/Owner.entity";
import { UserRole, UserStatus, Country, OwnerStatus } from "../entities/enums";
import { AppError } from "../middleware/errorHandler";

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const createOwnerSchema = z.object({
  // User fields
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  country: z.nativeEnum(Country).optional(),

  // Owner-specific fields
  displayName: z.string().optional(),
  taxId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const updateOwnerSchema = z.object({
  // User fields
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  country: z.nativeEnum(Country).optional(),
  status: z.nativeEnum(UserStatus).optional(),

  // Owner-specific fields
  displayName: z.string().optional(),
  taxId: z.string().optional(),
  ownerStatus: z.nativeEnum(OwnerStatus).optional(),
  metadata: z.record(z.unknown()).optional()
});

export type CreateOwnerDto = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerDto = z.infer<typeof updateOwnerSchema>;

// ─── Service ──────────────────────────────────────────────────────────────────

const ownerRepo = () => AppDataSource.getRepository(Owner);
const userRepo = () => AppDataSource.getRepository(User);

/**
 * Get the owner record belonging to a specific userId (null if not an owner).
 */
export const getOwnerByUserId = async (userId: string) => {
  return ownerRepo().findOne({
    where: { userId },
    relations: { user: true, companies: true }
  });
};

/**
 * List all owners with their user data populated.
 */
export const getOwners = async () => {
  return ownerRepo().find({
    relations: { user: true, companies: true },
    order: { createdAt: "DESC" }
  });
};

/**
 * Get a single owner by id with full relations.
 */
export const getOwnerById = async (id: string) => {
  const owner = await ownerRepo().findOne({
    where: { id },
    relations: { user: true, companies: true }
  });
  if (!owner) throw new AppError("Owner not found", 404);
  return owner;
};

/**
 * Create a new User (role=OWNER placeholder via ADMIN) + Owner record atomically.
 */
export const createOwner = async (dto: CreateOwnerDto) => {
  const existing = await userRepo().findOne({
    where: { email: dto.email.toLowerCase() }
  });
  if (existing) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(dto.password, 12);

  return AppDataSource.transaction(async (manager) => {
    const user = manager.create(User, {
      email: dto.email.toLowerCase(),
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      country: dto.country,
      role: UserRole.ADMIN, // owners get admin-level access
      status: UserStatus.ACTIVE,
      emailVerified: false
    });
    await manager.save(user);

    const owner = manager.create(Owner, {
      userId: user.id,
      displayName: dto.displayName ?? `${dto.firstName} ${dto.lastName}`,
      taxId: dto.taxId,
      metadata: dto.metadata ?? {},
      status: OwnerStatus.ACTIVE
    });
    await manager.save(owner);

    const { password: _pw, ...safeUser } = user;
    return { ...owner, user: safeUser };
  });
};

/**
 * Update owner and/or their linked user record.
 */
export const updateOwner = async (id: string, dto: UpdateOwnerDto) => {
  const owner = await ownerRepo().findOne({
    where: { id },
    relations: { user: true }
  });
  if (!owner) throw new AppError("Owner not found", 404);

  return AppDataSource.transaction(async (manager) => {
    // Update User fields if provided
    const { displayName, taxId, ownerStatus, metadata, ...userFields } = dto;
    if (Object.keys(userFields).length) {
      await manager.update(User, owner.userId, userFields);
    }

    // Update Owner fields if provided
    const ownerUpdate: Record<string, unknown> = {};
    if (displayName !== undefined) ownerUpdate.displayName = displayName;
    if (taxId !== undefined) ownerUpdate.taxId = taxId;
    if (ownerStatus !== undefined) ownerUpdate.status = ownerStatus;
    if (metadata !== undefined) ownerUpdate.metadata = metadata;
    if (Object.keys(ownerUpdate).length) {
      await manager.update(Owner, id, ownerUpdate);
    }

    return getOwnerById(id);
  });
};

/**
 * Delete an owner — cascades to delete the user record too.
 */
export const deleteOwner = async (id: string) => {
  const owner = await ownerRepo().findOne({ where: { id } });
  if (!owner) throw new AppError("Owner not found", 404);
  // Deleting the user cascades (onDelete: "CASCADE") to remove the owner row
  await userRepo().delete(owner.userId);
};
