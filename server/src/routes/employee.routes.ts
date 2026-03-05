import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import {
  listEmployees,
  getEmployeesByCompany,
  getEmployee,
  createEmployee,
  updateEmployee,
  patchEmployee,
  removeEmployee,
  getEmployeeTimelogs,
  getEmployeeAbsences,
  getEmployeeManagers,
  assignManagers
} from "../controllers/employeeController";

const router = Router();

// All employee routes require authentication
router.use(authenticate);

router.get("/", listEmployees);
router.get("/by-company/:companyId", getEmployeesByCompany);
router.get("/:id", getEmployee);
router.post("/", authorize("admin", "hr"), createEmployee);
router.put("/:id", authorize("admin", "hr"), updateEmployee);
router.patch("/:id", authorize("admin", "hr"), patchEmployee);
router.delete("/:id", authorize("admin"), removeEmployee);
router.get("/:id/timelogs", getEmployeeTimelogs);
router.get("/:id/absences", getEmployeeAbsences);
router.get("/:id/managers", getEmployeeManagers);
router.post("/:id/managers", authorize("admin", "hr"), assignManagers);

export default router;
