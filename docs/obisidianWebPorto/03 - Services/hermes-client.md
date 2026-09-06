# Hermes Client

File: `lib/ai/client.ts` (previously `lib/hermes-client.ts`)

Thin wrapper around a standard OpenAI-compatible `chat/completions` server (Hermes).

- Env: `HERMES_BASE_URL`, `HERMES_MODEL`, `HERMES_API_KEY`.
- `buildPayload(systemPrompt, userMessage, stream, history)`: Builds OpenAI-format payload. `history` is injected between the system prompt and the current user message.
- `askHermes(systemPrompt, userMessage, history?)`: Sends a blocking chat request and awaits the entire content string.
- `streamHermes(systemPrompt, userMessage, history?)`: Sends a streamed Chat request using SSE. Returns a `ReadableStream<Uint8Array>` combined with a `full` string promise. Parses the upstream stream line-by-line.

Config: `MAX_TOKENS = 500`, `TIMEOUT_MS = 60_000` (timeout cleared after connection for streaming, only covers connect phase).
