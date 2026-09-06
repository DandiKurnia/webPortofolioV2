# Web Portfolio — Tech Stack & Feature Analysis

> **Project root:** `D:\mySelf\project\webportofolio`
> **Domain:** danbildad.web.id
> **Owner:** Dandi Kurnia Putra
> **Type:** Personal portfolio + admin CMS + AI chat assistant

---

## 1. Tech Stack

| Layer | Tech | Notes |
| --- | --- | --- |
| Framework | **Next.js 16.2.6** (App Router, standalone output) | Breaking changes vs. older Next — docs live in `node_modules/next/dist/docs/` |
| UI | **React 19.2.4** | Client components for interactive sections |
| Styling | **Tailwind CSS 4** (`@tailwindcss/postcss`) | Custom `@theme` tokens; brutalist design system |
| Language | **TypeScript 5** | `tsconfig` strict-ish, `@/*` path alias |
| ORM | **Prisma 7** + `@prisma/adapter-pg` | Custom client output at `app/generated/prisma` |
| DB | **PostgreSQL 16** (docker) | Port `5433` |
| Auth | **NextAuth v4** (Credentials, JWT) | 30-day session, custom login page `/admin/login` |
| Object storage | **MinIO** (S3-compatible) | Images + resume PDF; `forcePathStyle: true` |
| AI chat | **Hermes client** (OpenAI-compatible LLM) | Self-hosted endpoint, default `http://10.254.200.211:8643/v1` |
| Cache + rate-limit | **Upstash Redis** (REST) | Chat cache + sliding-window rate limit |
| Validation | **Zod 4** | Chat body schema |
| Server state | **@tanstack/react-query** | `QueryProvider` wraps app |
| Hash | **bcryptjs** | Admin password hashing |
| Fonts | Montserrat, Space Grotesk, Space Mono (next/font) | Brutalist type pairing |
| Icons | Material Symbols Outlined (self-hosted woff2) | `FILL` variation-settings |
| Deploy | **Docker** (multi-stage, `docker-compose.yml`) + GitHub Actions | See [Section 8 — Docker & Deployment](#8-docker--deployment) |

---

## 2. Folder Structure

```
webportofolio/
├── app/                       # Next.js App Router
│   ├── page.tsx               # Public landing (Hero→Skills→Projects→Certs→Footer)
│   ├── layout.tsx             # Fonts, QueryProvider, metadata
│   ├── globals.css            # Tailwind v4 theme + brutalist utilities
│   ├── projects/page.tsx      # "View All Projects" page
│   ├── admin/                 # Admin area
│   │   ├── page.tsx           # Redirect (probably → /admin/overview)
│   │   ├── login/             # Auth pages (layout + page)
│   │   └── (dashboard)/       # Overview / project / certificates / skills
│   │       ├── layout.tsx     # Admin shell + AdminSidebar
│   │       ├── overview/
│   │       ├── project/
│   │       ├── certificates/
│   │       └── skills/
│   └── api/                   # Route handlers
│       ├── auth/[...nextauth]/route.ts
│       ├── projects/  + [id]/
│       ├── skills/    + [id]/
│       ├── certifications/ + [id]/
│       ├── resume/            # Singleton resume GET/POST/DELETE
│       ├── portfolio/         # Singleton portfolio PDF GET/POST/DELETE (2026-08-01)
│       ├── upload/            # S3 upload (image/resume/portfolio)
│       └── chat/              # SSE streaming AI chat
├── components/
│   ├── Hero.tsx  Navbar.tsx  Skills.tsx  Projects.tsx
│   ├── Certifications.tsx  Footer.tsx  ChatWidget.tsx
│   ├── admin/AdminSidebar.tsx, DocumentManager.tsx
│   └── providers/ (QueryProvider, SessionProvider)
├── lib/
│   ├── auth.ts               # NextAuth options
│   ├── prisma.ts             # PrismaClient + PrismaPg adapter
│   ├── minio.ts              # S3 client + publicUrl helpers
│   ├── hermes-client.ts      # LLM ask + SSE streaming
│   ├── redis-cache.ts        # rate limit + response cache
│   └── system-prompt.ts      # AI persona + refusal templates
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts             # /admin/* route guard
├── Dockerfile / docker-compose.yml / DOCKER.md
└── .github/workflows/docker-publish.yml
```

---

## 3. Database Models (Prisma)

| Model | Fields | Notes |
| --- | --- | --- |
| `User` | id, email, password, name | bcrypt-hashed; admin only |
| `Certification` | id, title, company, link?, years | years stored as string |
| `Skill` | id, title, description, icon | icon = Material Symbol name |
| `Project` | id, title, description, link?, image?, technologies[] | image = MinIO URL |
| `Resume` | id, url, filename, sizeBytes | singleton pattern (latest wins) |
| `Portfolio` | id, url, filename, sizeBytes | singleton pattern, added 2026-08-01 |

---

## 4. Public Site Features

### Hero
- Big brutalist headline "HELLO, I AM DANDI" + star/squiggle SVGs
- `contact.exe` computer-window card w/ profile pic + email
- "Let's Talk" / "View Work" buttons
- Responsive: window stacks below on mobile, beside on desktop

### Navbar
- Sticky, scroll-spy active section highlighting (`#hero/#skills/#projects/#certifications`)
- "View CV" button — fetches latest resume from `/api/resume`, opens in new tab

### Skills (`#skills`) — "Tech Arsenal"
- Cards cycled through 5 bg colors + 5 rotations
- Desktop: **infinite CSS marquee** (2 duplicated groups)
- Mobile: separate yellow marquee band
- Data fetched client-side from `/api/skills`

### Projects (`#projects`) — "Selected Work"
- Shows top 2 most recent, staggered column offset (zig-zag)
- Each card = fake OS window (`cyber_dash.zip`, `neo-poster.png`, ...)
- Tech tags (max 5 + "+N" overflow), image or placeholder
- "View Description" opens **modal** (locks body scroll) w/ full description
- "View All Projects" → `/projects` page

### Certifications (`#certifications`) — "Wall of Validation"
- Horizontal scroll row w/ desktop left/right arrow buttons
- Dashed timeline line decoration
- Card rotations + color cycling; "VERIFIED" stamp
- Card links out if `link` present; hover scale

### Chat Widget (AI Assistant Dandi)
- Floating profile-pic bubble, bottom-right
- Panel styled like `ai-dandi.exe` OS window
- **Streaming SSE** replies via `/api/chat`
- History persisted to `localStorage` (`ai-dandi-chat-v1`)
- Reset `[reset]`, close `[x]`, typing dots while streaming
- Max input 300 chars + counter; body-scroll lock
- Indonesian-first persona

### Footer (`#contact`)
- Big "Let's Make Something Loud." CTA
- Mailto link + GitHub / LinkedIn / Instagram ("Stalk Me")
- © 2026 Dandi Kurnia

---

## 5. Chat Backend (`/api/chat`)

**Pipeline:** validate (Zod) → rate-limit → pre-filter → cache → Hermes.

- **Rate limit:** Upstash Redis sorted-set sliding window — **10 msgs / 5 min / IP**
- **Pre-filter (`BLOCKED_PATTERNS`):** blocks code/essay-writing requests, jailbreak attempts (`ignore previous instructions`, `DAN mode`, `you are now`), system-prompt extraction, translation, recipes — in EN **and** ID
- **Language detect:** regex on Indonesian particles (`nih`, `dong`, `gue`, `gw`...) → chooses ID/EN refusal
- **Cache:** SHA-256 of normalized question → Redis, TTL 24h (`CACHE_TTL_SEC = 86400`)
- **Hermes client:** 30s timeout, single retry on 5xx/network, `max_tokens=200`, `temp=0.5`
- **Response format:** SSE `data: {delta}`, `data: {done}` — for both real stream, static refusal, rate-limit, and cache hits
- Graceful degradation: Redis unconfigured → rate-limit & cache disabled (warn once)

### AI Persona (`system-prompt.ts`)
- "AI Assistant Dandi" — soft-spoken recruiter-facing assistant
- Strict scope: **only** answer about Dandi; refuse everything else
- Anti-jailbreak + never reveal prompt; < 120 words; match user language

---

## 6. Admin Panel (`/admin`)

Protected by `middleware.ts` (`withAuth`, matcher `/admin/:path*`). Logged-in users hitting `/admin/login` get redirected to `/admin/overview`.

| Route | Purpose |
| --- | --- |
| `/admin/overview` | Dashboard overview |
| `/admin/project` | Project CRUD (title, desc, link, image, technologies) |
| `/admin/certificates` | Certification CRUD (title, company, link, years) |
| `/admin/skills` | Skill CRUD (title, description, icon) |
| `/admin/login` | Credentials login |

**AdminSidebar:** sidebar nav (Overview / Project / Certificates / Skills), mobile hamburger + backdrop, active-route highlighting, Logout (signOut → `/admin/login`).

### API auth pattern
- **GET** endpoints (projects/skills/certifications/resume) — **public** (portfolio reads)
- **POST/PUT/DELETE** — require `getServerSession(authOptions)`, else `401`

### File upload (`/api/upload`)
- Auth required
- `kind`: `image` → `projects/` folder, `resume` → `resume/` folder
- Allowed: JPG/PNG/WEBP/GIF (≤5MB), PDF only for resume (≤10MB)
- Key: `{folder}/{randomUUID()}.{ext}` → MinIO bucket, returns `{url, key, filename, size}`

### Resume singleton (`/api/resume`)
- POST: create new row, then **delete old rows + their MinIO objects**
- DELETE: removes all rows + objects

---

## 7. Auth Flow

1. POST `/api/auth/callback/credentials` → NextAuth `authorize`:
   - find user by email → `bcrypt.compare(password)`
   - success → return user; session JWT
2. `jwt` callback copies id/email/name into token; `session` callback exposes them
3. Session maxAge 30 days; custom `signIn` page `/admin/login`
4. `middleware.ts` guards all `/admin/*`; login page bounces authed users to overview
5. Login form posts via `next-auth/react` (`signIn("credentials")`), redirect param `from`

---

## 8. Docker & Deployment

- **docker-compose**: `postgres:16-alpine` (5433), `minio/minio` (9000/9001), `minio-init` (mc alias + bucket + public download policy), `app`
- **App container** runs `npx prisma migrate deploy && node server.js`
- **Dockerfile**: multi-stage (deps → builder → runner); standalone output; non-root `nextjs` user; Prisma client + CLI copied for migrations
- **GitHub Actions** (`docker-publish.yml`) pushes image on push/tag
- Next config: `output: "standalone"`, image `remotePatterns` for `localhost:9000`, `minio.danbildad.my.id`, `danbildad.web.id`; `dangerouslyAllowLocalIP: true`

---

## 9. Design System — "Neubrutalism"

- 4px hard black borders, hard offset shadows (`brutal-shadow`: 8px/8px), press-down on hover/active
- Neon palette: `neon-yellow #d7ff00`, `neon-blue #3b82f6`, `neon-pink #ec4899`, pure black
- Material-you-style tone tokens in `globals.css` `@theme`
- OS window motif: traffic-light dots (red/yellow/green) + filename tab (`contact.exe`, `ai-dandi.exe`, project names)
- Marquee animation (skills), rotating/card-stack sections, dotted grid backgrounds
- Fonts: Montserrat (headline, black/900), Space Grotesk (body), Space Mono (mono labels)

---

## 10. Key Files Cheat Sheet

| Want | File |
| --- | --- |
| Landing composition | `app/page.tsx` |
| Chat SSE logic | `app/api/chat/route.ts` |
| LLM client | `lib/hermes-client.ts` |
| AI persona | `lib/system-prompt.ts` |
| Redis rate-limit/cache | `lib/redis-cache.ts` |
| MinIO/S3 | `lib/minio.ts` |
| Auth options | `lib/auth.ts` |
| DB client | `lib/prisma.ts` |
| Schema | `prisma/schema.prisma` |
| Route guard | `middleware.ts` |
| Deploy | `docker-compose.yml`, `Dockerfile`, `DOCKER.md` |

---

## 11. Potential Improvement Notes

- **GET routes lack caching** — React Query is set up but components fetch with plain `fetch`; could use RSC server fetch or React Query cache
- **Chat uses `Math.random()`** inside `redis-cache` pipeline member — fine, just noting
- **`image` field on Project** is MinIO URL string — no delete-on-replace for old project images (resume does cleanup, projects don't)
- **No Zod on CRUD routes** — only chat validates; project/skill/cert bodies hand-checked
- **Auth is single-admin** — no role model / user management UI
- **`projects.slice(0, 2)`** hard-codes 2 "Selected Work" cards — ties to DB order, no pin/feature flag
