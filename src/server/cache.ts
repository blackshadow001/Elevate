import "server-only";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const syncCache = new Map<string, CacheEntry<unknown>>();
const asyncInFlight = new Map<string, Promise<unknown>>();
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Synchronous TTL cache for fast in-process SQLite read aggregation.
 */
export function cachedSync<T>(key: string, ttlMs: number, compute: () => T): T {
  const now = Date.now();
  const hit = syncCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = compute();
  syncCache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/**
 * Singleflight async TTL cache: collapses concurrent stampeding requests for
 * the same key into a single computation.
 */
export async function cachedAsync<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const hit = syncCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  const existingFlight = asyncInFlight.get(key);
  if (existingFlight) {
    return existingFlight as Promise<T>;
  }

  const promise = compute()
    .then((value) => {
      syncCache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      asyncInFlight.delete(key);
    });

  asyncInFlight.set(key, promise);
  return promise;
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    syncCache.clear();
    return;
  }
  for (const key of syncCache.keys()) {
    if (key.startsWith(prefix)) syncCache.delete(key);
  }
}

/**
 * Lightweight fixed-window rate limiter with bounded cleanup.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets.entries()) {
      if (v.resetAt <= now) rateBuckets.delete(k);
    }
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) {
    return false;
  }
  bucket.count += 1;
  return true;
}
