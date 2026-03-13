import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import {
  listAbsences,
  getAbsence,
  getAbsencesByEmployeeHandler,
  createAbsence,
  updateAbsence,
  removeAbsence,
  reviewAbsence,
  vacationBalance
} from "../controllers/absenceController";

const router = Router();

// All absence routes require authentication
router.use(authenticate);

// List all absences (admin sees all; users see their own)
router.get("/", ...listAbsences);

// Get single absence
router.get("/:id", getAbsence);

// Create absence
router.post("/", ...createAbsence);

// Update pending absence
router.put("/:id", ...updateAbsence);

// Cancel / delete absence
router.delete("/:id", removeAbsence);

// Approve or reject (company owner or direct manager of the employee)
router.post("/:id/review", ...reviewAbsence);

// Get absences for a specific employee
router.get("/employee/:employeeId", getAbsencesByEmployeeHandler);

// Vacation balance for a specific employee
router.get("/employee/:employeeId/balance", vacationBalance);

export default router;
