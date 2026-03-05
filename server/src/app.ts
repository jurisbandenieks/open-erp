import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { env } from "./config/env";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import router from "./routes";

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
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/v1", router);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
