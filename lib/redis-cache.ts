import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SEC = 300;
const CACHE_TTL_SEC = 86_400;

let _redis: Redis | null = null;
let _warned = false;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!_warned) {
      console.warn(
        "[chat] Upstash Redis not configured — rate limit & cache disabled. Set UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN to enable."
      );
      _warned = true;
    }
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

export function normalizeQuestion(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, " ").replace(/[?!.,;:]+$/g, "");
}

function cacheKey(question: string): string {
  const hash = createHash("sha256").update(normalizeQuestion(question)).digest("hex");
  return `cache:${hash}`;
}

export async function getCached(question: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<{ reply: string; ts: number }>(cacheKey(question));
    return raw?.reply ?? null;
  } catch (err) {
    console.error("redis getCached error:", err);
    return null;
  }
}

export async function setCached(question: string, reply: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(cacheKey(question), { reply, ts: Date.now() }, { ex: CACHE_TTL_SEC });
  } catch (err) {
    console.error("redis setCached error:", err);
  }
}

export async function checkRateLimit(
  ip: string
): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const redis = getRedis();
  if (!redis) {
    return { ok: true, remaining: RATE_LIMIT_MAX, retryAfter: 0 };
  }
  try {
    const key = `rl:${ip}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_SEC * 1000;

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    pipeline.expire(key, RATE_LIMIT_WINDOW_SEC);
    const results = (await pipeline.exec()) as [number, number, number, number];

    const count = (results[1] ?? 0) + 1;
    const ok = count <= RATE_LIMIT_MAX;
    const remaining = Math.max(0, RATE_LIMIT_MAX - count);
    const retryAfter = ok ? 0 : RATE_LIMIT_WINDOW_SEC;
    return { ok, remaining, retryAfter };
  } catch (err) {
    console.error("redis checkRateLimit error:", err);
    return { ok: true, remaining: RATE_LIMIT_MAX, retryAfter: 0 };
  }
}
