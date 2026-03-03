import { DataSource } from "typeorm";
import { env } from "./env";
import { logger } from "./logger";
import { User } from "../entities/User.entity";
import { Owner } from "../entities/Owner.entity";
import { Company } from "../entities/Company.entity";
import { Employee } from "../entities/Employee.entity";
import { Manager } from "../entities/Manager.entity";
import { Timelog } from "../entities/Timelog.entity";
import { Absence } from "../entities/Absence.entity";
import { Holiday } from "../entities/Holiday.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  synchronize: env.NODE_ENV === "development",
  logging: env.NODE_ENV === "development",
  entities: [
    User,
    Owner,
    Company,
    Employee,
    Manager,
    Timelog,
    Absence,
    Holiday
  ],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: []
});

export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("PostgreSQL connected");
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
};
