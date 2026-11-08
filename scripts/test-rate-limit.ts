import assert from "node:assert/strict";
import { consume, reset, isSuccessfulSignIn, clientIp } from "../lib/rate-limit";

// 1. IP extraction
const reqWithCf = new Request("http://localhost", { headers: { "cf-connecting-ip": "1.2.3.4" } });
assert.equal(clientIp(reqWithCf), "1.2.3.4");

const reqWithXff = new Request("http://localhost", { headers: { "x-forwarded-for": "5.6.7.8, 9.10.11.12" } });
assert.equal(clientIp(reqWithXff), "5.6.7.8");

// 2. Rate limit 5/15mnt
const key = "test:ip:1";
reset(key);
for (let i = 1; i <= 5; i++) {
  const r = consume(key);
  assert.equal(r.ok, true, `attempt ${i} should pass`);
}
const sixth = consume(key);
assert.equal(sixth.ok, false, "6th attempt must be blocked");
assert(sixth.retryAfter > 0 && sixth.retryAfter <= 900, "retryAfter within 15min window");

// 3. Reset works
reset(key);
assert.equal(consume(key).ok, true, "after reset, first attempt should pass");
reset(key);

// 4. Success predicate
assert.equal(isSuccessfulSignIn({ url: "http://localhost:3000/admin/overview" }), true);
assert.equal(isSuccessfulSignIn({ url: "http://localhost:3000/api/auth/signin?csrf=true" }), false);
assert.equal(isSuccessfulSignIn({ url: "http://localhost:3000/api/auth/signin?error=CredentialsSignin" }), false);
assert.equal(isSuccessfulSignIn(null), false);
assert.equal(isSuccessfulSignIn({}), false);

console.log("ALL RATE LIMIT TESTS PASSED");
