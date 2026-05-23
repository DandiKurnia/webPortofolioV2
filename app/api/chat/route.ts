import { z } from "zod";
import { streamHermes } from "@/lib/hermes-client";
import {
  checkRateLimit,
  getCached,
  setCached,
} from "@/lib/redis-cache";
import {
  RATE_LIMITED_MSG,
  REFUSAL_EN,
  REFUSAL_ID,
  SYSTEM_PROMPT,
  TOO_LONG_ID,
} from "@/lib/system-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  message: z.string().min(1).max(300),
  stream: z.boolean().optional(),
});

const BLOCKED_PATTERNS: RegExp[] = [
  /write\s+(me\s+)?(a\s+)?(code|script|program|essay|story|poem)/i,
  /buatkan?\s+(saya\s+)?(kode|program|script|essay|cerita|puisi)/i,
  /tulis(kan)?\s+(saya\s+)?(kode|program|script|essay)/i,
  /resep|recipe/i,
  /ignore\s+(previous|all|the)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+/i,
  /forget\s+(everything|your\s+instructions)/i,
  /system\s+prompt|reveal\s+your\s+(prompt|instructions)/i,
  /(jailbreak|DAN\s+mode|developer\s+mode)/i,
  /\b(translate|terjemahkan)\b.*\b(this|ini|berikut)\b/i,
];

function isBlocked(message: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(message));
}

function detectLang(message: string): "id" | "en" {
  const idHints = /\b(saya|kamu|aku|gue|gw|lo|nih|dong|kah|yang|bisa|apa|kerja|punya|gimana|kenapa|kapan)\b/i;
  return idHints.test(message) ? "id" : "en";
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function jsonResponse(body: object, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function staticSseStream(text: string, meta: Record<string, unknown> = {}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, ...meta })}\n\n`));
      ctrl.close();
    },
  });
}

export async function POST(request: Request) {
  let parsed: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json();
    parsed = BodySchema.parse(raw);
  } catch {
    return jsonResponse({ error: "bad_request", message: TOO_LONG_ID }, 400);
  }

  const { message } = parsed;
  const wantsStream = parsed.stream ?? true;
  const ip = getClientIp(request);

  // [2] Rate limit
  const rl = await checkRateLimit(ip);
  if (!rl.ok) {
    if (wantsStream) {
      return sseResponse(staticSseStream(RATE_LIMITED_MSG, { rateLimited: true }));
    }
    return jsonResponse(
      { error: "rate_limited", message: RATE_LIMITED_MSG },
      429,
      { "Retry-After": String(rl.retryAfter) }
    );
  }

  // [4] Pre-filter
  if (isBlocked(message)) {
    const refusal = detectLang(message) === "id" ? REFUSAL_ID : REFUSAL_EN;
    if (wantsStream) {
      return sseResponse(staticSseStream(refusal, { filtered: true }));
    }
    return jsonResponse({ reply: refusal, cached: false, filtered: true });
  }

  // [5] Cache check
  const cached = await getCached(message);
  if (cached) {
    if (wantsStream) {
      return sseResponse(staticSseStream(cached, { cached: true }));
    }
    return jsonResponse({ reply: cached, cached: true });
  }

  // [6] Hermes
  try {
    if (wantsStream) {
      const { stream, full } = await streamHermes(SYSTEM_PROMPT, message);
      // Persist cache after stream completes (don't block response)
      full
        .then((text) => {
          if (text) void setCached(message, text);
        })
        .catch(() => {});
      return sseResponse(stream);
    }

    // Non-stream fallback
    const { askHermes } = await import("@/lib/hermes-client");
    const reply = await askHermes(SYSTEM_PROMPT, message);
    void setCached(message, reply);
    return jsonResponse({ reply, cached: false });
  } catch (err) {
    console.error("chat route error:", err);
    return jsonResponse(
      {
        error: "upstream_error",
        message: "Maaf, lagi ada gangguan. Coba lagi sebentar ya.",
      },
      502
    );
  }
}
