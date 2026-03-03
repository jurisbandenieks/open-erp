import { Request, Response, NextFunction } from "express";
import { validateToken, type AuthPayload } from "../services/authService";
import { AppError } from "./errorHandler";
import { logger } from "../config/logger";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header", 401));
  }

  const token = authHeader.slice(7);

  try {
    req.user = await validateToken(token);
    next();
  } catch (error) {
    logger.warn("Token validation failed:", error);
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthenticated", 401));
    }
    const hasRole = roles.some((role) => req.user!.roles.includes(role));
    if (!hasRole) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
};
