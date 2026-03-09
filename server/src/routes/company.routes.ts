import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { UserRole } from "../entities/enums";
import {
  listCompanies,
  getMyCompanies
} from "../controllers/companyController";

const router = Router();

router.use(authenticate);

router.get("/mine", getMyCompanies);
router.get("/", authorize(UserRole.ADMIN), listCompanies);

export default router;
