import { Request, Response, NextFunction } from "express";
import {
  login,
  validate as validateToken,
  refresh,
  logout,
  register
} from "../services/tokenService";
import { AppError } from "../middleware/errorHandler";
import "../middleware/requireBearer";

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const result = await register(email, password, firstName, lastName);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /validate
 * Authorization: Bearer <token>
 * Body (optional): { requiredRoles: string[] }
 * Returns AuthPayload — called by the api service on every authenticated request.
 * If requiredRoles is provided, returns 403 when the token holder lacks all of them.
 */
export const validateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await validateToken(req.token!);

    const { requiredRoles } = req.body as { requiredRoles?: string[] };
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) =>
        payload.roles.includes(role)
      );
      if (!hasRole) {
        return next(new AppError("Insufficient permissions", 403));
      }
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await refresh(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) return next(new AppError("userId is required", 400));

    await logout(req.token!, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
