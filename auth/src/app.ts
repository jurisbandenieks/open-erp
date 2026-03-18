import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "auth",
    timestamp: new Date().toISOString()
  });
});

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

app.use("/", router);

app.use(notFound);
app.use(errorHandler);

export default app;
