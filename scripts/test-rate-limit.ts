import assert from "node:assert/strict";
import {
  createLimiter,
  loginLimiter,
  chatLimiter,
  rateLimitHeaders,
  isSuccessfulSignIn,
  clientIp,
} from "../lib/rate-limit";

function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}
// 1. IP extraction (Cloudflare-aware)
const reqWithCf = new Request("http://localhost", { headers: { "cf-connecting-ip": "1.2.3.4" } });
assert.equal(clientIp(reqWithCf), "1.2.3.4");

const reqWithXff = new Request("http://localhost", {
  headers: { "x-forwarded-for": "5.6.7.8, 9.10.11.12" },
});
assert.equal(clientIp(reqWithXff), "5.6.7.8");

const reqBare = new Request("http://localhost");
assert.equal(clientIp(reqBare), "unknown");

// 2. Login limiter: 5 attempts / 15 minutes
for (let i = 1; i <= 5; i++) {
  assert.equal(loginLimiter.consume("t:login").ok, true, `login attempt ${i} should pass`);
}
const loginBlocked = loginLimiter.consume("t:login");
assert.equal(loginBlocked.ok, false, "6th login attempt must be blocked");
assert(loginBlocked.retryAfter > 0 && loginBlocked.retryAfter <= 900, "retryAfter within 15min");
loginLimiter.reset("t:login");
assert.equal(loginLimiter.consume("t:login").ok, true, "after reset login passes again");
loginLimiter.reset("t:login");

// 3. Chat limiter: 10 questions / 5 minutes (matches the UI copy)
for (let i = 1; i <= 10; i++) {
  const r = chatLimiter.consume("t:chat");
  assert.equal(r.ok, true, `chat question ${i} should pass`);
  assert.equal(r.limit, 10);
  assert.equal(r.remaining, 10 - i);
}
const chatBlocked = chatLimiter.consume("t:chat");
assert.equal(chatBlocked.ok, false, "11th chat question must be blocked");
assert.equal(chatBlocked.remaining, 0);
assert(chatBlocked.retryAfter > 0 && chatBlocked.retryAfter <= 300, "retryAfter within 5min");
chatLimiter.reset("t:chat");

// 4. Keys are isolated per IP
assert.equal(chatLimiter.consume("t:chat:a").ok, true);
for (let i = 0; i < 9; i++) chatLimiter.consume("t:chat:a");
assert.equal(chatLimiter.consume("t:chat:a").ok, false, "exhausted key stays blocked");
assert.equal(chatLimiter.consume("t:chat:b").ok, true, "other IP unaffected");
chatLimiter.reset("t:chat:a");
chatLimiter.reset("t:chat:b");

// 5. Window expiry frees the key (fake clock via small window)
async function main(): Promise<void> {
  const quick = createLimiter({ windowMs: 60, max: 1 });
  assert.equal(quick.consume("k").ok, true);
  assert.equal(quick.consume("k").ok, false);
  await delay(80);
  assert.equal(quick.consume("k").ok, true, "limit resets after the window elapses");

  // 6. Headers
  const allowed = rateLimitHeaders({ ok: true, limit: 10, remaining: 7, retryAfter: 0, resetAt: 1_700_000_000_000 });
  assert.equal(allowed["X-RateLimit-Limit"], "10");
  assert.equal(allowed["X-RateLimit-Remaining"], "7");
  assert.equal(allowed["X-RateLimit-Reset"], "1700000000");
  assert.equal(allowed["Retry-After"], undefined);

  const blocked = rateLimitHeaders({ ok: false, limit: 10, remaining: 0, retryAfter: 42, resetAt: 1_700_000_000_000 });
  assert.equal(blocked["X-RateLimit-Remaining"], "0");
  assert.equal(blocked["Retry-After"], "42");

  // 7. Success predicate
  assert.equal(isSuccessfulSignIn({ url: "http://localhost:3000/admin/overview" }), true);
  assert.equal(isSuccessfulSignIn({ url: "http://localhost:3000/api/auth/signin?csrf=true" }), false);
  assert.equal(isSuccessfulSignIn({ url: "http://localhost:3000/api/auth/signin?error=CredentialsSignin" }), false);
  assert.equal(isSuccessfulSignIn(null), false);
  assert.equal(isSuccessfulSignIn({}), false);

  console.log("ALL RATE LIMIT TESTS PASSED");
}

void main();
