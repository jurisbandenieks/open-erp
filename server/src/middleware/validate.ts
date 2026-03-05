import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./errorHandler";

export const validate =
  (schema: ZodSchema, target: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    console.log(`Validating ${req[target]} with schema:`, schema);
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return next(new AppError(message, 400));
    }
    req[target] = result.data;
    next();
  };
