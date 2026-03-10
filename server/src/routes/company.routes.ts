import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { UserRole } from "../entities/enums";
import {
  listCompanies,
  getMyCompanies,
  listAllCompanies,
  getCompany,
  createCompanyHandler,
  updateCompanyHandler
} from "../controllers/companyController";

const router = Router();

router.use(authenticate);

// Lightweight lookups used by dropdowns elsewhere
router.get("/mine", getMyCompanies);
router.get("/", authorize(UserRole.ADMIN), listCompanies);

// Full CRUD — admin or owner (ownership enforced in controller)
router.get("/manage", ...listAllCompanies);
router.get("/manage/:id", getCompany);
router.post("/manage", ...createCompanyHandler);
router.put("/manage/:id", ...updateCompanyHandler);

export default router;
