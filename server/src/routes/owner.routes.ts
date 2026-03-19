import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { UserRole } from "../entities/enums";
import {
  listOwners,
  getOwner,
  createOwnerHandler,
  createOwnerFromUserHandler,
  updateOwnerHandler,
  removeOwner,
  getMyOwner
} from "../controllers/ownerController";

const router = Router();

router.use(authenticate);

// Any authenticated user can check if they are an owner
router.get("/me", getMyOwner);

// All remaining owner routes require admin role
router.use(authorize(UserRole.ADMIN));

router.get("/", listOwners);
router.get("/:id", getOwner);
router.post("/", ...createOwnerHandler);
router.post("/from-user", ...createOwnerFromUserHandler);
router.put("/:id", ...updateOwnerHandler);
router.delete("/:id", removeOwner);

export default router;
