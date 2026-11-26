import "server-only";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const MAX_CACHE_ENTRIES = 5000;
const syncCache = new Map<string, CacheEntry<unknown>>();
const asyncInFlight = new Map<string, Promise<unknown>>();
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function pruneCacheIfNeeded(): void {
  if (syncCache.size < MAX_CACHE_ENTRIES) return;
  const now = Date.now();
  for (const [k, entry] of syncCache.entries()) {
    if (entry.expiresAt <= now) syncCache.delete(k);
  }
  // Evict oldest FIFO entries if still above cap
  while (syncCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = syncCache.keys().next().value;
    if (!oldestKey) break;
    syncCache.delete(oldestKey);
  }
}

/**
 * Synchronous bounded TTL cache for fast in-process SQLite read aggregation.
 */
export function cachedSync<T>(key: string, ttlMs: number, compute: () => T): T {
  const now = Date.now();
  const hit = syncCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = compute();
  pruneCacheIfNeeded();
  syncCache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/**
 * Singleflight async bounded TTL cache: collapses concurrent stampeding requests
 * for the same key into a single computation.
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
      pruneCacheIfNeeded();
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
 * Lightweight fixed-window rate limiter with bounded memory cleanup.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  if (rateBuckets.size > 10000) {
    for (const [k, v] of rateBuckets.entries()) {
      if (v.resetAt <= now) rateBuckets.delete(k);
    }
    while (rateBuckets.size > 10000) {
      const oldestKey = rateBuckets.keys().next().value;
      if (!oldestKey) break;
      rateBuckets.delete(oldestKey);
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

/**
 * Bounded semaphore to protect local/GPU LLM engines from memory exhaustion
 * under high-concurrency traffic bursts. Returns true when acquired.
 */
let activeLlmCalls = 0;
const llmWaitQueue: Array<(granted: boolean) => void> = [];

export async function withLlmConcurrencyGuard<T>(
  maxConcurrent: number,
  maxQueueDepth: number,
  queueWaitMs: number,
  fn: () => Promise<T | null>
): Promise<T | null> {
  if (activeLlmCalls < maxConcurrent) {
    activeLlmCalls += 1;
    try {
      return await fn();
    } finally {
      activeLlmCalls = Math.max(0, activeLlmCalls - 1);
      const next = llmWaitQueue.shift();
      if (next) next(true);
    }
  }

  // Reject queue overflow immediately so server fails open gracefully via RAG
  if (llmWaitQueue.length >= maxQueueDepth) {
    return null;
  }

  const granted = await new Promise<boolean>((resolve) => {
    let settled = false;
    const wrapped = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => {
      const idx = llmWaitQueue.indexOf(wrapped);
      if (idx !== -1) llmWaitQueue.splice(idx, 1);
      wrapped(false);
    }, queueWaitMs);
    llmWaitQueue.push(wrapped);
  });

  if (!granted) return null;

  activeLlmCalls += 1;
  try {
    return await fn();
  } finally {
    activeLlmCalls = Math.max(0, activeLlmCalls - 1);
    const next = llmWaitQueue.shift();
    if (next) next(true);
  }
}
