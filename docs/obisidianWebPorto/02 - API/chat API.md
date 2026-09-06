# Chat API

File: `app/api/chat/route.ts`

## `POST /api/chat`
- **Access**: Public
- **Body**: `{ message, stream?, history? }`
  - `message`: `string` (1–300 chars)
  - `stream`: `boolean` (default `true`)
  - `history`: `Array<{ role: "user"|"assistant", content: string }>` (max 10 items, max 1000 chars each). Optional conversation history for multi-turn context.
- **Flow**:
  1. Zod validation (`min(1)`, `max(300)` for message, max 10 history items).
  2. Extracts Client IP for rate-limiting.
  3. Checks Redis [[redis-cache]] rate-limit (`checkRateLimit`). (Limits 10 msgs / 5 mins). Returns HTTP 429 if failed.
  4. Pre-filter validation via `isBlocked()` Regex list (refuses prompt injections, requests for essays, logic, code, recipes). Returns canned response if flagged.
  5. Checks Redis [[redis-cache]] for a cached answer via `getCached()`.
  6. Builds dynamic system prompt via `buildSystemPrompt()` in `lib/ai/prompt.ts` (merges `content/ai/rules.md`, `content/ai/profile.md`, all `.md` under `content/ai/knowledge/` loaded recursively, and DB records for skills, certs, projects).
  7. Dispatches to [[hermes-client]] with the dynamic prompt and conversation history.
  8. Supports HTTP JSON or Server-Sent Events (SSE) streaming depending on `stream` parameter.
  9. Upon completion, stores answer in Redis cache.
