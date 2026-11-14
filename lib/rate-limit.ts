export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** seconds until the caller may retry (0 when allowed) */
  retryAfter: number;
  /** epoch ms when the counter drops back to zero */
  resetAt: number;
};

export type Limiter = {
  consume(key: string): RateLimitResult;
  reset(key: string): void;
};

// ponytail: per-process memory. Fine for one container; use Redis when running more replicas.
export function createLimiter(options: {
  windowMs: number;
  max: number;
  maxKeys?: number;
}): Limiter {
  const { windowMs, max, maxKeys = 1000 } = options;
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    if (hits.size <= maxKeys) return;
    for (const [key, stamps] of hits) {
      if (!stamps.some((t) => now - t < windowMs)) hits.delete(key);
    }
  }

  function consume(key: string): RateLimitResult {
    const now = Date.now();
    const active = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    const resetAt = active.length ? active[0] + windowMs : now + windowMs;

    if (active.length >= max) {
      hits.set(key, active);
      return {
        ok: false,
        limit: max,
        remaining: 0,
        retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        resetAt,
      };
    }

    active.push(now);
    hits.set(key, active);
    prune(now);

    return {
      ok: true,
      limit: max,
      remaining: Math.max(0, max - active.length),
      retryAfter: 0,
      resetAt,
    };
  }

  return { consume, reset: (key) => void hits.delete(key) };
}

export const loginLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
export const chatLimiter = createLimiter({ windowMs: 5 * 60 * 1000, max: 10 });

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(Math.ceil(r.resetAt / 1000)),
  };
  if (!r.ok) headers["Retry-After"] = String(r.retryAfter);
  return headers;
}

export function clientIp(req: Request): string {
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

// ponytail: success = redirect without error markers; adjust if NextAuth changes its callback contract.
export function isSuccessfulSignIn(body: unknown): boolean {
  const url = (body as { url?: unknown } | null)?.url;
  return (
    typeof url === "string" &&
    url.length > 0 &&
    !url.includes("error=") &&
    !url.includes("csrf=true")
  );
}
