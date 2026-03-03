import { Router } from "express";
import employeeRoutes from "./employee.routes";
import timelogRoutes from "./timelog.routes";

const router = Router();

router.use("/employees", employeeRoutes);
router.use("/timelogs", timelogRoutes);

export default router;
