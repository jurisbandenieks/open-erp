import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
}

/**
 * Extracts the Bearer token from the Authorization header and attaches it
 * to `req.token`. Returns 401 if the header is missing or malformed.
 */
export const requireBearer = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }
  req.token = authHeader.slice(7);
  next();
};
