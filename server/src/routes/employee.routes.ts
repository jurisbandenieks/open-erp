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
  getEmployeeManagersHandler,
  assignManagers,
  getEmployeeManageesHandler,
  assignManagees
} from "../controllers/employeeController";

const router = Router();

// All employee routes require authentication
router.use(authenticate);

router.get("/", ...listEmployees);
router.get("/by-company/:companyId", getEmployeesByCompany);
router.get("/:id", getEmployee);
router.post("/", authorize("admin"), ...createEmployee);
router.put("/:id", authorize("admin"), ...updateEmployee);
router.patch("/:id", authorize("admin"), ...patchEmployee);
router.delete("/:id", authorize("admin"), removeEmployee);
router.get("/:id/timelogs", getEmployeeTimelogs);
router.get("/:id/absences", getEmployeeAbsences);
router.get("/:id/managers", getEmployeeManagersHandler);
router.post("/:id/managers", authorize("admin", "hr"), assignManagers);
router.get("/:id/managees", getEmployeeManageesHandler);
router.post("/:id/managees", authorize("admin", "hr"), assignManagees);

export default router;
