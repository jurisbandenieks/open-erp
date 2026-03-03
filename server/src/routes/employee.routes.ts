import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { getEmployeesByCompanyViaManagers } from "../services/employeeService";

const router = Router();

// All employee routes require authentication
router.use(authenticate);

router.get("/", (_req, res) => {
  res.json({ success: true, data: [], message: "Get all employees" });
});

// Must be declared before /:id to avoid route param collision
router.get("/by-company/:companyId", async (req, res, next) => {
  try {
    const employees = await getEmployeesByCompanyViaManagers(
      req.params.companyId
    );
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (_req, res) => {
  res.json({ success: true, data: null, message: "Get employee by id" });
});

router.post("/", authorize("admin", "hr"), (_req, res) => {
  res
    .status(201)
    .json({ success: true, data: null, message: "Create employee" });
});

router.put("/:id", authorize("admin", "hr"), (_req, res) => {
  res.json({ success: true, data: null, message: "Update employee" });
});

router.patch("/:id", authorize("admin", "hr"), (_req, res) => {
  res.json({ success: true, data: null, message: "Patch employee" });
});

router.delete("/:id", authorize("admin"), (_req, res) => {
  res.json({ success: true, message: "Delete employee" });
});

router.get("/:id/timelogs", (_req, res) => {
  res.json({ success: true, data: [], message: "Get employee timelogs" });
});

router.get("/:id/absences", (_req, res) => {
  res.json({ success: true, data: [], message: "Get employee absences" });
});

router.get("/:id/managers", (_req, res) => {
  res.json({ success: true, data: [], message: "Get employee managers" });
});

router.post("/:id/managers", authorize("admin", "hr"), (_req, res) => {
  res.json({ success: true, message: "Assign managers" });
});

export default router;
