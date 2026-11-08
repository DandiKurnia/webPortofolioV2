const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_TRACKED_KEYS = 1000;

const attempts = new Map<string, number[]>();

function prune(now: number) {
  if (attempts.size <= MAX_TRACKED_KEYS) return;
  for (const [key, hits] of attempts) {
    if (!hits.some((t) => now - t < WINDOW_MS)) attempts.delete(key);
  }
}

export function clientIp(req: Request): string {
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export function consume(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (hits.length >= MAX_ATTEMPTS) {
    attempts.set(key, hits);
    return {
      ok: false,
      retryAfter: Math.ceil((WINDOW_MS - (now - hits[0])) / 1000),
    };
  }

  hits.push(now);
  attempts.set(key, hits);
  prune(now);
  return { ok: true, retryAfter: 0 };
}

export function reset(key: string): void {
  attempts.delete(key);
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