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
  console.log("Authenticating request:", req.headers);
  const authHeader = req.headers.authorization;

  console.log("Authenticating token:", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header", 401));
  }

  const token = authHeader.slice(7);

  console.log("Extracted token:", token);

  try {
    req.user = await validateToken(token);
    next();
  } catch (error) {
    logger.warn("Token validation failed:", error);
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorize = (...roles: string[]) => {
  console.log("Authorizing with required roles:", roles);
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError("Unauthenticated", 401));
    }
    const token = authHeader.slice(7);
    try {
      // Re-validate token against auth service and check required roles there
      req.user = await validateToken(token, roles);
      next();
    } catch (error) {
      console.log("Authorization failed:", error);
      next(error);
    }
  };
};
