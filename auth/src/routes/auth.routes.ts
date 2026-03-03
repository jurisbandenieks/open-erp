import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import {
  login,
  validate as validateToken,
  refresh,
  logout,
} from "../services/tokenService";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * POST /login
 * Body: { email, password }
 * Returns: { accessToken, refreshToken, user }
 */
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /validate
 * Header: Authorization: Bearer <accessToken>
 * Returns: AuthPayload — consumed by the api service's authenticate middleware.
 */
router.post("/validate", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError("Missing or invalid Authorization header", 401));
    }
    const token = authHeader.slice(7);
    const payload = await validateToken(token);
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /refresh
 * Body: { refreshToken }
 * Returns: { accessToken }
 */
router.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await refresh(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /logout
 * Header: Authorization: Bearer <accessToken>
 * Body: { userId }  (provided by client after successful login)
 */
router.post("/logout", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError("Missing Authorization header", 401));
    }
    const token = authHeader.slice(7);
    const { userId } = req.body as { userId?: string };
    if (!userId) return next(new AppError("userId is required", 400));

    await logout(token, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
