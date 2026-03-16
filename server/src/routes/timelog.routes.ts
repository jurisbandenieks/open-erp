import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import {
  listTimelogs,
  getTimelogSummary,
  getTimelogsByEmployee,
  getTimelogsByEntity,
  getTimelog,
  createTimelog,
  updateTimelog,
  patchTimelog,
  removeTimelog,
  submitTimelog,
  approveTimelog,
  rejectTimelog,
  bulkSubmitTimelogs,
  bulkApproveTimelogs,
  listWeeklyApprovals
} from "../controllers/timelogController";

const router = Router();

// All timelog routes require authentication
router.use(authenticate);

router.get("/", ...listTimelogs);
router.get("/summary", getTimelogSummary);
router.get("/weekly-approvals", ...listWeeklyApprovals);
router.get("/employee/:employeeId", ...getTimelogsByEmployee);
router.get("/entity/:entityId", getTimelogsByEntity);
router.get("/:id", getTimelog);
router.post("/", ...createTimelog);
router.post("/bulk/submit", ...bulkSubmitTimelogs);
router.post("/bulk/approve", ...bulkApproveTimelogs);
router.put("/:id", ...updateTimelog);
router.patch("/:id", ...patchTimelog);
router.delete("/:id", removeTimelog);
router.post("/:id/submit", submitTimelog);
router.post("/:id/approve", authorize("admin", "manager"), approveTimelog);
router.post("/:id/reject", authorize("admin", "manager"), ...rejectTimelog);

export default router;
