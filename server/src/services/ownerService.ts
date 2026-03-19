import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { Owner } from "../entities/Owner.entity";
import { UserRole, UserStatus, Country, OwnerStatus } from "../entities/enums";
import { AppError } from "../middleware/errorHandler";

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const createOwnerFromUserSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().optional(),
  taxId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

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
  // User re-link
  userId: z.string().uuid().optional(),

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
export type CreateOwnerFromUserDto = z.infer<typeof createOwnerFromUserSchema>;
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
 * Link an existing User as an Owner without creating a new user.
 */
export const createOwnerFromUser = async (dto: CreateOwnerFromUserDto) => {
  const user = await userRepo().findOne({ where: { id: dto.userId } });
  if (!user) throw new AppError("User not found", 404);

  const existingOwner = await ownerRepo().findOne({
    where: { userId: dto.userId }
  });
  if (existingOwner) throw new AppError("User is already an owner", 409);

  return AppDataSource.transaction(async (manager) => {
    await manager.update(User, dto.userId, { role: UserRole.ADMIN });

    const owner = manager.create(Owner, {
      userId: dto.userId,
      displayName: dto.displayName ?? `${user.firstName} ${user.lastName}`,
      taxId: dto.taxId,
      metadata: dto.metadata ?? {},
      status: OwnerStatus.ACTIVE
    });
    await manager.save(owner);
    return getOwnerById(owner.id);
  });
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
    const {
      displayName,
      taxId,
      ownerStatus,
      metadata,
      userId: newUserId,
      ...userFields
    } = dto;

    // Re-link to a different user if requested
    if (newUserId !== undefined) {
      if (newUserId !== owner.userId) {
        const targetUser = await userRepo().findOne({
          where: { id: newUserId }
        });
        if (!targetUser) throw new AppError("User not found", 404);
        const conflict = await ownerRepo().findOne({
          where: { userId: newUserId }
        });
        if (conflict) throw new AppError("User is already an owner", 409);
        await manager.update(Owner, id, { userId: newUserId });
        await manager.update(User, newUserId, { role: UserRole.ADMIN });
      }
    } else if (Object.keys(userFields).length) {
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
