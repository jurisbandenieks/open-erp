import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  lazyConnect: true
});

redisClient.on("error", (err) => {
  logger.error("Redis error:", err);
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info("Redis connected");
  } catch (error) {
    logger.error("Redis connection failed:", error);
    throw error;
  }
};
