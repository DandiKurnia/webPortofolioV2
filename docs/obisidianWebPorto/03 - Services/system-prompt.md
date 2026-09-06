# System Prompt

File: `lib/ai/prompt.ts`
Content files: `content/ai/rules.md`, `content/ai/profile.md`, `content/ai/knowledge/**/*.md`

Builds the system prompt dynamically for [[hermes-client]] used by [[chat API]].

- Reads `rules.md` (AI persona, guardrails, refusal templates) and `profile.md` (Dandi's static bio/contact/education/work experience) from `content/ai/`.
- Recursively loads every `.md` under `content/ai/knowledge/` (subfolders allowed, e.g. `knowledge/resume/resume.md`). Just drop a pasted file there — no code change needed.
- Fetches live data from database: **Skills**, **Certifications**, **Projects** via Prisma.
- Merges all sections into a single prompt string per request.
- Exports canned strings: `REFUSAL_EN`, `REFUSAL_ID`, `TOO_LONG_ID`, `RATE_LIMITED_MSG`.
- To update AI knowledge: edit `rules.md`/`profile.md`, drop `.md` files into `content/ai/knowledge/`, or update DB records via admin dashboard.
