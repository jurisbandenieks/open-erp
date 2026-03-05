import axios from "axios";
import { redisClient } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { AuthPayload } from "@shared/types/auth";

export type { AuthPayload };

const TOKEN_CACHE_TTL = 60; // seconds

export const validateToken = async (
  token: string,
  requiredRoles?: string[]
): Promise<AuthPayload> => {
  // Use a cache key that incorporates required roles so role-scoped
  // and role-free lookups don't collide.
  const rolesSuffix =
    requiredRoles && requiredRoles.length > 0
      ? `:${requiredRoles.sort().join(",")}`
      : "";
  const cacheKey = `token:${token}${rolesSuffix}`;

  // Check Redis cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as AuthPayload;
  }

  // Validate (and optionally authorise) with the auth service
  const body =
    requiredRoles && requiredRoles.length > 0 ? { requiredRoles } : {};
  const { data } = await axios.post<AuthPayload>(
    `${env.AUTH_SERVICE_URL}/validate`,
    body,
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    }
  );

  // Cache the valid payload
  const ttl = Math.min(
    data.exp - Math.floor(Date.now() / 1000),
    TOKEN_CACHE_TTL
  );
  if (ttl > 0) {
    await redisClient.setex(cacheKey, ttl, JSON.stringify(data));
  }

  return data;
};

export const invalidateToken = async (token: string): Promise<void> => {
  await redisClient.del(`token:${token}`);
  logger.debug(`Token cache invalidated`);
};
