import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import {
  loginHandler,
  registerHandler,
  validateHandler,
  refreshHandler,
  logoutHandler,
  changePasswordHandler
} from "../controllers/authController";
import { requireBearer } from "../middleware/requireBearer";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

/** POST /login — { email, password } → { accessToken, refreshToken, user } */
router.post("/login", validate(loginSchema), loginHandler);

/** POST /register — { email, password, firstName, lastName } → 201 { id, email, ... } */
router.post("/register", validate(registerSchema), registerHandler);

/**
 * POST /validate
 * Authorization: Bearer <token>
 * Body (optional): { requiredRoles: string[] }
 */
router.post("/validate", requireBearer, validateHandler);

/** POST /refresh — { refreshToken } → { accessToken } */
router.post("/refresh", validate(refreshSchema), refreshHandler);

/** POST /logout — Authorization: Bearer <token>, body: { userId } */
router.post("/logout", requireBearer, logoutHandler);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

/** POST /change-password — Authorization: Bearer <token> */
router.post(
  "/change-password",
  requireBearer,
  validate(changePasswordSchema),
  changePasswordHandler
);

export default router;
