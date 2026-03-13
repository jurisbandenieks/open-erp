import type { Request, Response, NextFunction } from "express";
import {
  listEmployeesQuerySchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployees as fetchEmployees,
  getEmployeeById,
  createEmployee as createEmp,
  updateEmployee as updateEmp,
  removeEmployee as removeEmp,
  getEmployeeManagers,
  setManagers,
  getEmployeeManagees,
  setManagees,
  getEmployeesByCompany as fetchEmployeesByCompany
} from "../services/employeeService";
import { validate } from "../middleware/validate";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee.entity";

export const listEmployees = [
  validate(listEmployeesQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fetchEmployees(req.query as never);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const getEmployeesByCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await fetchEmployeesByCompany(req.params.companyId);
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
};

export const getEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getEmployeeById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createEmployee = [
  validate(createEmployeeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await createEmp(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const updateEmployee = [
  validate(updateEmployeeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await updateEmp(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const patchEmployee = [
  validate(updateEmployeeSchema.partial()),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await updateEmp(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const removeEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await removeEmp(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getEmployeeTimelogs = (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: "Get employee timelogs" });
};

export const getEmployeeAbsences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { year, status } = req.query as { year?: string; status?: string };
    const { getAbsencesByEmployee } =
      await import("../services/absenceService");
    const data = await getAbsencesByEmployee(
      req.params.id,
      { year: year ? Number(year) : undefined, status },
      req.user!
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeManagersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getEmployeeManagers(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const assignManagers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await setManagers(req.params.id, req.body.managerIds ?? []);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeManageesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getEmployeeManagees(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const assignManagees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await setManagees(req.params.id, req.body.manageeIds ?? []);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMyEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;
    const emp = await AppDataSource.getRepository(Employee)
      .createQueryBuilder("emp")
      .leftJoinAndSelect("emp.user", "user")
      .where("emp.userId = :userId", { userId })
      .getOne();
    res.json({ success: true, data: emp ?? null });
  } catch (err) {
    next(err);
  }
};
