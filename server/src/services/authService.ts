import axios from "axios";
import { redisClient } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";

const TOKEN_CACHE_TTL = 60; // seconds

export interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export const validateToken = async (token: string): Promise<AuthPayload> => {
  const cacheKey = `token:${token}`;

  // Check Redis cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as AuthPayload;
  }

  // Validate with auth service
  const { data } = await axios.post<AuthPayload>(
    `${env.AUTH_SERVICE_URL}/validate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    }
  );

  // Cache the valid payload
  const ttl = Math.min(data.exp - Math.floor(Date.now() / 1000), TOKEN_CACHE_TTL);
  if (ttl > 0) {
    await redisClient.setex(cacheKey, ttl, JSON.stringify(data));
  }

  return data;
};

export const invalidateToken = async (token: string): Promise<void> => {
  await redisClient.del(`token:${token}`);
  logger.debug(`Token cache invalidated`);
};
