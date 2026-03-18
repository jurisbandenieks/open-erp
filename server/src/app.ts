import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";

const app = express();

// Security
app.use(helmet());

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(requestLogger);

// Rate limiting
app.use("/api", rateLimiter);

// Health check
app.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Swagger UI — development only
if (env.NODE_ENV !== "production") {
  app.use(
    "/docs",
    (
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
      );
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
}

// Routes
app.use("/v1", router);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
