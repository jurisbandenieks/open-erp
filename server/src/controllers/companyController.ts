import type { Request, Response, NextFunction } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Company } from "../entities/Company.entity";
import { Owner } from "../entities/Owner.entity";
import { Employee } from "../entities/Employee.entity";
import { User } from "../entities/User.entity";
import { UserRole } from "../entities/enums";
import { validate } from "../middleware/validate";
import {
  listCompaniesQuerySchema,
  createCompanySchema,
  updateCompanySchema,
  listCompanies as fetchCompanies,
  getCompanyById,
  createCompany as createComp,
  updateCompany as updateComp,
  getOwnerIdForUser
} from "../services/companyService";

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

export const getMyCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roles } = req.user!;

    // Check JWT roles first; fall back to DB lookup in case token predates the
    // `roles` claim (e.g. old cached token) or roles is otherwise absent.
    const jwtIsAdmin = Array.isArray(roles) && roles.includes("admin");
    let isAdmin = jwtIsAdmin;
    if (!isAdmin) {
      const dbUser = await AppDataSource.getRepository(User).findOne({
        where: { id: userId },
        select: ["role"]
      });
      isAdmin = dbUser?.role === UserRole.ADMIN;
    }

    if (isAdmin) {
      const companies = await companyRepo().find({
        select: ["id", "name"],
        order: { name: "ASC" }
      });
      return res.json({ success: true, data: companies });
    }

    const companyIds = new Set<string>();

    const owner = await AppDataSource.getRepository(Owner).findOne({
      where: { userId }
    });
    if (owner) {
      const ownedCompanies = await companyRepo().find({
        where: { ownerId: owner.id },
        select: ["id"]
      });
      ownedCompanies.forEach((c) => companyIds.add(c.id));
    }

    const employee = await AppDataSource.getRepository(Employee).findOne({
      where: { userId }
    });
    if (employee) {
      companyIds.add(employee.companyId);
    }

    if (companyIds.size === 0) {
      return res.json({ success: true, data: [] });
    }

    const companies = await companyRepo().find({
      where: { id: In([...companyIds]) },
      select: ["id", "name"],
      order: { name: "ASC" }
    });
    return res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
};

// ─── Full CRUD ────────────────────────────────────────────────────────────────

export const listAllCompanies = [
  validate(listCompaniesQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.user!;

      const jwtIsAdmin = Array.isArray(roles) && roles.includes("admin");
      let isAdmin = jwtIsAdmin;
      if (!isAdmin) {
        const dbUser = await AppDataSource.getRepository(User).findOne({
          where: { id: userId },
          select: ["role"]
        });
        isAdmin = dbUser?.role === UserRole.ADMIN;
      }

      // Owners can only manage their own companies
      let ownerIds: string[] | undefined;
      if (!isAdmin) {
        const ownerId = await getOwnerIdForUser(userId);
        if (!ownerId)
          return res.status(403).json({ success: false, message: "Forbidden" });
        ownerIds = [ownerId];
      }

      const result = await fetchCompanies(req.query as never, ownerIds);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const getCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getCompanyById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createCompanyHandler = [
  validate(createCompanySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.user!;
      const jwtIsAdmin = Array.isArray(roles) && roles.includes("admin");
      let isAdmin = jwtIsAdmin;
      if (!isAdmin) {
        const dbUser = await AppDataSource.getRepository(User).findOne({
          where: { id: userId },
          select: ["role"]
        });
        isAdmin = dbUser?.role === UserRole.ADMIN;
      }

      // Owners can only create companies under themselves
      if (!isAdmin) {
        const ownerId = await getOwnerIdForUser(userId);
        if (!ownerId || req.body.ownerId !== ownerId) {
          return res
            .status(403)
            .json({
              success: false,
              message:
                "You can only create companies under your own owner account"
            });
        }
      }

      const data = await createComp(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const updateCompanyHandler = [
  validate(updateCompanySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, roles } = req.user!;
      const jwtIsAdmin = Array.isArray(roles) && roles.includes("admin");
      let isAdmin = jwtIsAdmin;
      if (!isAdmin) {
        const dbUser = await AppDataSource.getRepository(User).findOne({
          where: { id: userId },
          select: ["role"]
        });
        isAdmin = dbUser?.role === UserRole.ADMIN;
      }

      if (!isAdmin) {
        const ownerId = await getOwnerIdForUser(userId);
        const company = await getCompanyById(req.params.id);
        if (!ownerId || company.ownerId !== ownerId) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
        // Non-admins cannot re-assign the owner
        if (req.body.ownerId !== undefined) {
          return res.status(403).json({ success: false, message: "Only admins can reassign the owner" });
        }
      }

      const data = await updateComp(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;
