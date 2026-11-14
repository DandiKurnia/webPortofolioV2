import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";

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
