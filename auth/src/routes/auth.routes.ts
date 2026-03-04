import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import {
  login,
  validate as validateToken,
  refresh,
  logout,
  register
} from "../services/tokenService";
import { AppError } from "../middleware/errorHandler";

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
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await login(req.body.email, req.body.password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/** POST /register — { email, password, firstName, lastName } → 201 { id, email, ... } */
router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await register(email, password, firstName, lastName);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /validate
 * Authorization: Bearer <token>
 * Returns AuthPayload — called by the api service on every authenticated request.
 */
router.post(
  "/validate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return next(
          new AppError("Missing or invalid Authorization header", 401)
        );
      }
      const payload = await validateToken(authHeader.slice(7));
      res.json(payload);
    } catch (err) {
      next(err);
    }
  }
);

/** POST /refresh — { refreshToken } → { accessToken } */
router.post(
  "/refresh",
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await refresh(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/** POST /logout — Authorization: Bearer <token>, body: { userId } */
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return next(new AppError("Missing Authorization header", 401));
      }
      const { userId } = req.body as { userId?: string };
      if (!userId) return next(new AppError("userId is required", 400));

      await logout(authHeader.slice(7), userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
