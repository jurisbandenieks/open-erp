import { Router } from "express";
import employeeRoutes from "./employee.routes";
import timelogRoutes from "./timelog.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/timelogs", timelogRoutes);

export default router;
