import type { Request, Response, NextFunction } from "express";
import { getEmployeesByCompanyViaManagers } from "../services/employeeService";

export const listEmployees = (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: "Get all employees" });
};

export const getEmployeesByCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await getEmployeesByCompanyViaManagers(
      req.params.companyId
    );
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
};

export const getEmployee = (_req: Request, res: Response) => {
  res.json({ success: true, data: null, message: "Get employee by id" });
};

export const createEmployee = (_req: Request, res: Response) => {
  res
    .status(201)
    .json({ success: true, data: null, message: "Create employee" });
};

export const updateEmployee = (_req: Request, res: Response) => {
  res.json({ success: true, data: null, message: "Update employee" });
};

export const patchEmployee = (_req: Request, res: Response) => {
  res.json({ success: true, data: null, message: "Patch employee" });
};

export const removeEmployee = (_req: Request, res: Response) => {
  res.json({ success: true, message: "Delete employee" });
};

export const getEmployeeTimelogs = (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: "Get employee timelogs" });
};

export const getEmployeeAbsences = (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: "Get employee absences" });
};

export const getEmployeeManagers = (_req: Request, res: Response) => {
  res.json({ success: true, data: [], message: "Get employee managers" });
};

export const assignManagers = (_req: Request, res: Response) => {
  res.json({ success: true, message: "Assign managers" });
};
