import jwt, { SignOptions } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { AuthDataSource } from "../config/database";
import { redisClient } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { User } from "../entities/User.entity";
import { UserRole, UserStatus, Country } from "@shared/entities/enums";
import type { AuthPayload } from "@shared/types/auth";
import { AppError } from "../middleware/errorHandler";

// ─── Token helpers ────────────────────────────────────────────────────────────

const sign = (payload: object, expiresIn: string): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn } as SignOptions);

const verify = (token: string): AuthPayload =>
  jwt.verify(token, env.JWT_SECRET) as AuthPayload;

const REFRESH_PREFIX = "refresh:";
const BLOCK_PREFIX = "blocked:";

// ─── Register ─────────────────────────────────────────────────────────────────

export interface RegisterResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
}

export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<RegisterResult> => {
  const userRepo = AuthDataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: email.toLowerCase() }
  });
  if (existing) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(password, 12);

  const user = userRepo.create({
    email: email.toLowerCase(),
    password: hashed,
    firstName,
    lastName,
    role: UserRole.USER,
    status: UserStatus.PENDING,
    country: undefined as unknown as Country
  });

  await userRepo.save(user);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status
  };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "password">;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const userRepo = AuthDataSource.getRepository(User);

  // Explicitly re-select password (column has select:false)
  const user = await userRepo
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email: email.toLowerCase() })
    .getOne();

  if (!user) throw new AppError("Invalid credentials", 401);

  if (user.status === UserStatus.SUSPENDED)
    throw new AppError("Account is suspended", 403);

  if (user.status === UserStatus.INACTIVE)
    throw new AppError("Account is inactive", 403);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError("Invalid credentials", 401);

  const payload: Omit<AuthPayload, "iat" | "exp"> = {
    userId: user.id,
    email: user.email,
    roles: [user.role]
  };

  const accessToken = sign(payload, env.JWT_ACCESS_EXPIRES_IN);
  const refreshToken = sign({ userId: user.id }, env.JWT_REFRESH_EXPIRES_IN);

  // Persist refresh token in Redis (one active session per user)
  const refreshTtl = 7 * 24 * 60 * 60; // 7 days in seconds
  await redisClient.setex(
    `${REFRESH_PREFIX}${user.id}`,
    refreshTtl,
    refreshToken
  );

  // Update lastLoginAt (fire & forget — do not block the response)
  userRepo
    .update(user.id, { lastLoginAt: new Date() })
    .catch((err: unknown) => logger.warn("Failed to update lastLoginAt", err));

  const { password: _pw, ...safeUser } = user;
  return {
    accessToken,
    refreshToken,
    user: safeUser as Omit<User, "password">
  };
};

// ─── Validate ─────────────────────────────────────────────────────────────────

export const validate = async (token: string): Promise<AuthPayload> => {
  // Check if the token has been explicitly blocked (logout)
  const blocked = await redisClient.get(`${BLOCK_PREFIX}${token}`);
  if (blocked) throw new AppError("Token has been revoked", 401);

  try {
    return verify(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { userId: string };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Verify the stored refresh token matches (single-session enforcement)
  const stored = await redisClient.get(`${REFRESH_PREFIX}${decoded.userId}`);
  if (!stored || stored !== refreshToken)
    throw new AppError("Refresh token is no longer valid", 401);

  const userRepo = AuthDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: decoded.userId } });
  if (!user) throw new AppError("User not found", 404);

  const accessToken = sign(
    { userId: user.id, email: user.email, roles: [user.role] },
    env.JWT_ACCESS_EXPIRES_IN
  );

  return { accessToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (
  accessToken: string,
  userId: string
): Promise<void> => {
  // Block the access token for its remaining lifetime
  try {
    const decoded = verify(accessToken);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redisClient.setex(`${BLOCK_PREFIX}${accessToken}`, ttl, "1");
    }
  } catch {
    // Token already expired — nothing to block
  }

  // Remove the refresh token so it cannot be used to create new sessions
  await redisClient.del(`${REFRESH_PREFIX}${userId}`);
};

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const userRepo = AuthDataSource.getRepository(User);

  const user = await userRepo
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.id = :id", { id: userId })
    .getOne();

  if (!user) throw new AppError("User not found", 404);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError("Current password is incorrect", 400);

  if (newPassword.length < 8)
    throw new AppError("New password must be at least 8 characters", 400);

  user.password = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  await userRepo.save(user);
};
