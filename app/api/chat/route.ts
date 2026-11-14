import { z } from "zod";
import { streamHermes, askHermes } from "@/lib/ai/client";
import { getCached, setCached } from "@/lib/ai/cache";
import { chatLimiter, clientIp, rateLimitHeaders } from "@/lib/rate-limit";
import {
  buildSystemPrompt,
  RATE_LIMITED_MSG,
  REFUSAL_EN,
  REFUSAL_ID,
  TOO_LONG_ID,
} from "@/lib/ai/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(1000),
});

const BodySchema = z.object({
  message: z.string().min(1).max(300),
  stream: z.boolean().optional(),
  history: z.array(HistoryItemSchema).max(10).optional(),
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

function jsonResponse(body: object, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function sseResponse(
  stream: ReadableStream<Uint8Array>,
  headers?: Record<string, string>,
  status = 200,
): Response {
  return new Response(stream, {
    status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...headers,
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
  const ip = clientIp(request);

  // [2] Rate limit — 10 questions / 5 minutes / IP, mirroring the UI copy.
  const rl = chatLimiter.consume(`chat:${ip}`);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.ok) {
    if (wantsStream) {
      return sseResponse(
        staticSseStream(RATE_LIMITED_MSG, { rateLimited: true }),
        rlHeaders,
        429,
      );
    }
    return jsonResponse(
      { error: "rate_limited", message: RATE_LIMITED_MSG },
      429,
      rlHeaders,
    );
  }

  // [4] Pre-filter
  if (isBlocked(message)) {
    const refusal = detectLang(message) === "id" ? REFUSAL_ID : REFUSAL_EN;
    if (wantsStream) {
      return sseResponse(staticSseStream(refusal, { filtered: true }), rlHeaders);
    }
    return jsonResponse({ reply: refusal, cached: false, filtered: true }, 200, rlHeaders);
  }

  // [5] Cache check
  const cached = await getCached(message);
  if (cached) {
    if (wantsStream) {
      return sseResponse(staticSseStream(cached, { cached: true }), rlHeaders);
    }
    return jsonResponse({ reply: cached, cached: true }, 200, rlHeaders);
  }

  const history = parsed.history ?? [];

  // [6] Hermes
  try {
    const systemPrompt = await buildSystemPrompt();

    if (wantsStream) {
      const { stream, full } = await streamHermes(systemPrompt, message, history);
      full
        .then((text) => {
          if (text) void setCached(message, text);
        })
        .catch(() => {});
      return sseResponse(stream, rlHeaders);
    }

    const reply = await askHermes(systemPrompt, message, history);
    void setCached(message, reply);
    return jsonResponse({ reply, cached: false }, 200, rlHeaders);
  } catch (err) {
    console.error("chat route error:", err);
    return jsonResponse(
      {
        error: "upstream_error",
        message: "Maaf, lagi ada gangguan. Coba lagi sebentar ya.",
      },
      502,
      rlHeaders,
    );
  }
}
