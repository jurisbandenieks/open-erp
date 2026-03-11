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
  bulkApproveTimelogs
} from "../controllers/timelogController";

const router = Router();

// All timelog routes require authentication
router.use(authenticate);

router.get("/", ...listTimelogs);
router.get("/summary", getTimelogSummary);
router.get("/employee/:employeeId", ...getTimelogsByEmployee);
router.get("/entity/:entityId", getTimelogsByEntity);
router.get("/:id", getTimelog);
router.post("/", ...createTimelog);
router.put("/:id", ...updateTimelog);
router.patch("/:id", ...patchTimelog);
router.delete("/:id", removeTimelog);
router.post("/:id/submit", submitTimelog);
router.post("/:id/approve", authorize("admin", "manager"), approveTimelog);
router.post("/:id/reject", authorize("admin", "manager"), rejectTimelog);
router.post("/bulk/submit", bulkSubmitTimelogs);
router.post(
  "/bulk/approve",
  authorize("admin", "manager"),
  bulkApproveTimelogs
);

export default router;
