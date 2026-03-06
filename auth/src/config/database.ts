import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../entities/User.entity";
import { env } from "./env";
import { logger } from "./logger";
import { UserRole, UserStatus } from "@shared/entities/enums";

export const AuthDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  synchronize: false, // schema is managed by the api service
  logging: env.NODE_ENV === "development",
  entities: [User]
});

const seedSysadmin = async () => {
  if (!env.SYSADMIN_PASSWORD) {
    logger.warn("Auth service — SYSADMIN_PASSWORD not set, skipping sysadmin seed");
    return;
  }

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

export const connectDatabase = async () => {
  try {
    await AuthDataSource.initialize();
    logger.info("Auth service — PostgreSQL connected");
    await seedSysadmin();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Auth service — Database connection failed:", error);
    throw new Error(`Database connection failed: ${msg}`);
  }
};
