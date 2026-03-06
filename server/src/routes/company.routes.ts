import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { UserRole } from "../entities/enums";
import { listCompanies } from "../controllers/companyController";

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/", listCompanies);

export default router;
