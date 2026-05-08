// In-memory rate limiter for API routes.
// Resets counts per IP every WINDOW_MS. Suitable for single-instance deployments.
// For multi-instance/edge deployments, replace with Redis (e.g. Upstash).

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

// Prevent unbounded memory growth by pruning expired entries periodically.
let lastPruned = Date.now();
function pruneExpired(): void {
  const now = Date.now();
  if (now - lastPruned < WINDOW_MS) return;
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
  lastPruned = now;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number; // seconds until the window resets (0 if allowed)
}

export function checkRateLimit(
  ip: string,
  maxRequests = MAX_REQUESTS
): RateLimitResult {
  pruneExpired();

  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}
