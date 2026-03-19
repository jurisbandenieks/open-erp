import { DataSource } from "typeorm";
import { User } from "../entities/User.entity";
import { env } from "./env";
import { logger } from "./logger";
import { ensureSysadmin } from "../seeds/ensureSysadmin";

export const AuthDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  synchronize: true,
  logging: env.NODE_ENV === "development",
  entities: [User]
});

export const connectDatabase = async () => {
  try {
    await AuthDataSource.initialize();
    logger.info("Auth service — PostgreSQL connected");
    await ensureSysadmin();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Auth service — Database connection failed:", error);
    throw new Error(`Database connection failed: ${msg}`);
  }
};
