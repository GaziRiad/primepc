import { createHash } from "crypto";
import { NextResponse } from "next/server";

import startDbConnection from "@/lib/db";
import RateLimit from "@/models/RateLimit";

type RateLimitOptions = {
  identifier?: string;
  limit: number;
  scope: string;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const FALLBACK_IDENTIFIER = "unknown-client";
const MAX_BLOCKED_CACHE_ENTRIES = 1000;

const globalForRateLimit = globalThis as typeof globalThis & {
  rateLimitBlockedUntil?: Map<string, number>;
};

// Avoid repeated MongoDB writes for already-blocked clients on warm instances.
const blockedUntil =
  globalForRateLimit.rateLimitBlockedUntil ?? new Map<string, number>();

globalForRateLimit.rateLimitBlockedUntil = blockedUntil;

const getClientIdentifier = (request: Request) => {
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstIp = (value: string | null) => value?.split(",")[0]?.trim();

  return (
    firstIp(vercelForwardedFor) ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    firstIp(forwardedFor) ||
    request.headers.get("x-real-ip")?.trim() ||
    FALLBACK_IDENTIFIER
  );
};

const hashKey = (value: string) => {
  const salt =
    process.env.RATE_LIMIT_SALT ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "primepc-rate-limit";

  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
};

export const consumeRateLimit = async (
  request: Request,
  { identifier, limit, scope, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> => {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const rawIdentifier = String(identifier || getClientIdentifier(request))
    .trim()
    .toLowerCase()
    .slice(0, 240);
  const key = hashKey(`${scope}:${rawIdentifier}:${windowStart}`);
  const cachedResetAt = blockedUntil.get(key);

  if (cachedResetAt && cachedResetAt > now) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: cachedResetAt,
    };
  }

  if (cachedResetAt) blockedUntil.delete(key);

  try {
    await startDbConnection();

    const record = await RateLimit.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          expiresAt: new Date(resetAt + windowMs),
          scope,
        },
      },
      { new: true, upsert: true },
    ).lean<{ count: number }>();

    const count = record?.count ?? 1;
    const allowed = count <= limit;

    if (!allowed) {
      blockedUntil.set(key, resetAt);

      if (blockedUntil.size > MAX_BLOCKED_CACHE_ENTRIES) {
        for (const [cachedKey, cachedExpiry] of blockedUntil) {
          if (cachedExpiry <= now) blockedUntil.delete(cachedKey);
        }

        while (blockedUntil.size > MAX_BLOCKED_CACHE_ENTRIES) {
          const oldestKey = blockedUntil.keys().next().value;
          if (!oldestKey) break;
          blockedUntil.delete(oldestKey);
        }
      }
    }

    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt,
    };
  } catch (error) {
    console.error(`Rate limit check failed for ${scope}:`, error);

    // The limiter must never become the reason the storefront is unavailable.
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt,
    };
  }
};

export const rateLimitResponse = (
  result: RateLimitResult,
  message = "Trop de tentatives. Veuillez reessayer dans quelques instants.",
) => {
  const retryAfter = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000),
  );

  return NextResponse.json(
    {
      ok: false,
      error: "rate_limited",
      message,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
};
