import type { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { Company } from "../entities/Company.entity";

const companyRepo = () => AppDataSource.getRepository(Company);

export const listCompanies = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const companies = await companyRepo().find({
      select: ["id", "name"],
      order: { name: "ASC" }
    });
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
};
