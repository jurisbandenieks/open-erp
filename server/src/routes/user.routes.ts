import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import {
  listUsers,
  getUser,
  createUserHandler,
  updateUserHandler,
  removeUser
} from "../controllers/userController";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get("/", ...listUsers);
router.get("/:id", getUser);
router.post("/", authorize("admin"), ...createUserHandler);
router.put("/:id", authorize("admin"), ...updateUserHandler);
router.patch("/:id", authorize("admin"), ...updateUserHandler);
router.delete("/:id", authorize("admin"), removeUser);

export default router;
