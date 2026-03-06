import * as bcrypt from "bcryptjs";
import { AuthDataSource } from "../config/database";
import { User } from "../entities/User.entity";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { UserRole, UserStatus } from "@shared/entities/enums";

/**
 * Idempotent — runs on every startup.
 * Creates the sysadmin user if it doesn't exist.
 */
export const ensureSysadmin = async () => {
  const userRepo = AuthDataSource.getRepository(User);
  const email = env.SYSADMIN_EMAIL;

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    logger.info(`Auth service — Sysadmin "${email}" already exists`);
    return;
  }

  const password = await bcrypt.hash(env.SYSADMIN_PASSWORD, 12);
  await userRepo.save(
    userRepo.create({
      email,
      password,
      firstName: "System",
      lastName: "Admin",
      role: UserRole.SYSADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true
    })
  );

  logger.info(`Auth service — Sysadmin "${email}" created`);
};
