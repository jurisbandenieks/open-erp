import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { UserRole } from "../entities/enums";
import {
  listOwners,
  getOwner,
  createOwnerHandler,
  updateOwnerHandler,
  removeOwner
} from "../controllers/ownerController";

const router = Router();

// All owner routes require authentication + admin role
router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/", listOwners);
router.get("/:id", getOwner);
router.post("/", ...createOwnerHandler);
router.put("/:id", ...updateOwnerHandler);
router.delete("/:id", removeOwner);

export default router;
