# Redis Cache Service

File: `lib/ai/cache.ts` (previously `lib/redis-cache.ts`)
Dependency: `@upstash/redis`

Manages IP-based rate limiting and answer caching for [[chat API]].

- Config: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- `checkRateLimit(ip)`: Employs Redis sorted set with sliding window. Max 10 requests per 300 seconds window.
- `getCached(question)`: Retrieves cached answer from Redis. Key is derived from a SHA256 of a sanitized `normalizeQuestion()` string.
- `setCached(question, reply)`: Stores answer in Redis with 86400 seconds (24 hours) expiry.
- Graceful fallbacks to `ok: true` and `return null` when Redis is unconfigured/misconfigured.
