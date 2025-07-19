import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

// Create Redis instance
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limiters for different use cases
export const rateLimiters = {
  // General API rate limit: 10 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:api",
  }),

  // Submission rate limit: 2 submissions per hour
  submissions: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit:submissions",
  }),

  // Search rate limit: 30 searches per minute
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit:search",
  }),
};

// Helper function to get client IP
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cloudflareIP = request.headers.get("cf-connecting-ip");

  if (cloudflareIP) return cloudflareIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

// Simple rate limit check function
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters = "api",
) {
  try {
    const { success, limit, reset, remaining } =
      await rateLimiters[type].limit(identifier);

    return {
      success,
      limit,
      reset,
      remaining,
      resetTime: new Date(reset),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow the request if rate limiting fails
    return {
      success: true,
      limit: 0,
      reset: 0,
      remaining: 0,
      resetTime: new Date(),
    };
  }
}

// Rate limit response headers
export function getRateLimitHeaders(
  result: Awaited<ReturnType<typeof checkRateLimit>>,
) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetTime.toISOString(),
  };
}
