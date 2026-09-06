type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const HERMES_BASE_URL = process.env.HERMES_BASE_URL || "http://10.254.200.211:8643/v1";
const HERMES_MODEL = process.env.HERMES_MODEL || "claude";
const HERMES_API_KEY = process.env.HERMES_API_KEY || "";
const TIMEOUT_MS = 60_000;
const MAX_TOKENS = 500;
const TEMPERATURE = 0.5;

function buildPayload(
  systemPrompt: string,
  userMessage: string,
  stream: boolean,
  history: ChatMessage[] = []
) {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];
  return {
    model: HERMES_MODEL,
    messages,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    stream,
  };
}

async function postWithRetry(body: object, signal: AbortSignal): Promise<Response> {
  const url = `${HERMES_BASE_URL}/chat/completions`;
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HERMES_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  };

  try {
    const res = await fetch(url, init);
    if (!res.ok && res.status >= 500) {
      throw new Error(`Hermes upstream ${res.status}`);
    }
    return res;
  } catch {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error(`Hermes failed after retry: ${res.status}`);
    }
    return res;
  }
}

export async function askHermes(
  systemPrompt: string,
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await postWithRetry(
      buildPayload(systemPrompt, userMessage, false, history),
      controller.signal
    );
    if (!res.ok) {
      throw new Error(`Hermes ${res.status}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) throw new Error("Empty response from Hermes");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export async function streamHermes(
  systemPrompt: string,
  userMessage: string,
  history: ChatMessage[] = []
): Promise<{ stream: ReadableStream<Uint8Array>; full: Promise<string> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const upstream = await postWithRetry(
    buildPayload(systemPrompt, userMessage, true, history),
    controller.signal
  );

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timer);
    throw new Error(`Hermes stream failed: ${upstream.status}`);
  }
  clearTimeout(timer);

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = "";
  let fullText = "";

  let resolveFull!: (s: string) => void;
  let rejectFull!: (e: unknown) => void;
  const full = new Promise<string>((resolve, reject) => {
    resolveFull = resolve;
    rejectFull = reject;
  });

  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          clearTimeout(timer);
          ctrl.close();
          resolveFull(fullText.trim());
          return;
        }
        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split("\n");
        buffered = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          } catch {
            // skip malformed line
          }
        }
      } catch (err) {
        clearTimeout(timer);
        ctrl.error(err);
        rejectFull(err);
      }
    },
    cancel() {
      clearTimeout(timer);
      reader.cancel().catch(() => {});
    },
  });

  return { stream, full };
}
