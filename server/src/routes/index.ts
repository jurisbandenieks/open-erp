import { Router } from "express";
import employeeRoutes from "./employee.routes";
import timelogRoutes from "./timelog.routes";
import userRoutes from "./user.routes";
import ownerRoutes from "./owner.routes";
import companyRoutes from "./company.routes";
import absenceRoutes from "./absence.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/employees", employeeRoutes);
router.use("/timelogs", timelogRoutes);
router.use("/owners", ownerRoutes);
router.use("/companies", companyRoutes);
router.use("/absences", absenceRoutes);

export default router;
