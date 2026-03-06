import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { UserRole } from "../entities/enums";
import {
  listUsers,
  getUser,
  createUserHandler,
  updateUserHandler,
  removeUser
} from "../controllers/userController";

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get("/", ...listUsers);
router.get("/:id", getUser);
router.post("/", ...createUserHandler);
router.put("/:id", ...updateUserHandler);
router.patch("/:id", ...updateUserHandler);
router.delete("/:id", removeUser);

export default router;
