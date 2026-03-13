import type { Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import {
  listAbsencesQuerySchema,
  createAbsenceSchema,
  updateAbsenceSchema,
  reviewAbsenceSchema,
  listAbsences as fetchAbsences,
  getAbsenceById,
  getAbsencesByEmployee,
  createAbsence as createAbs,
  updateAbsence as updateAbs,
  deleteAbsence as deleteAbs,
  reviewAbsence as reviewAbs,
  getVacationBalance
} from "../services/absenceService";

// ─── List ─────────────────────────────────────────────────────────────────────

export const listAbsences = [
  validate(listAbsencesQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fetchAbsences(req.query as never, req.user!);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
] as const;

// ─── Single ───────────────────────────────────────────────────────────────────

export const getAbsence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getAbsenceById(req.params.id, req.user!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── By employee ──────────────────────────────────────────────────────────────

export const getAbsencesByEmployeeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { year, status } = req.query as { year?: string; status?: string };
    const data = await getAbsencesByEmployee(
      req.params.employeeId,
      {
        year: year ? Number(year) : undefined,
        status
      },
      req.user!
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createAbsence = [
  validate(createAbsenceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await createAbs(req.body, req.user!);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateAbsence = [
  validate(updateAbsenceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await updateAbs(req.params.id, req.body, req.user!);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

// ─── Delete / Cancel ──────────────────────────────────────────────────────────

export const removeAbsence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteAbs(req.params.id, req.user!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ─── Review ───────────────────────────────────────────────────────────────────

export const reviewAbsence = [
  validate(reviewAbsenceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await reviewAbs(req.params.id, req.body, req.user!);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

// ─── Vacation balance ─────────────────────────────────────────────────────────

export const vacationBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const year = req.query.year
      ? Number(req.query.year)
      : new Date().getFullYear();
    const data = await getVacationBalance(
      req.params.employeeId,
      year,
      req.user!
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
