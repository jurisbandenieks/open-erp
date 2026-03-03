import "reflect-metadata";
import app from "./app";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import { env } from "./config/env";
import { logger } from "./config/logger";

const start = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    app.listen(env.PORT, () => {
      logger.info(`API server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
