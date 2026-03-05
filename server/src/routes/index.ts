import { Router } from "express";
import employeeRoutes from "./employee.routes";
import timelogRoutes from "./timelog.routes";
import userRoutes from "./user.routes";
import ownerRoutes from "./owner.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/timelogs", timelogRoutes);
router.use("/owners", ownerRoutes);

export default router;
