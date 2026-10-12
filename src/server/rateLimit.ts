import "server-only";
import { ApiError } from "@/server/api";

const attempts = new Map<string, { count: number; resetAt: number }>();

// Per-process protection for local development. Use a shared store before multi-instance deployment.
export function rateLimit(key: string, limit = 8, windowMs = 15 * 60_000): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now >= entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (entry.count >= limit) throw new ApiError(429, "RATE_LIMITED", "Too many attempts. Try again later.");
  entry.count += 1;
  if (attempts.size > 10_000) {
    for (const [id, state] of attempts) if (state.resetAt <= now) attempts.delete(id);
  }
}
