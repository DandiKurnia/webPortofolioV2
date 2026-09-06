# Project Overview

Web Portfolio platform built with **Next.js 16**, **React 19**, **Prisma**, **PostgreSQL**, **NextAuth**, **MinIO**, and **Upstash Redis**. It features a visitor-facing frontend containing information about skills, projects, and certifications, an AI assistant, and a protected administration panel.

## Architecture Map

- **Frontend**: Next.js App Router (React 19, Tailwind CSS v4)
- **Database**: PostgreSQL with Prisma Client. See [[Schema Overview]]
- **Auth**: NextAuth.js (Credentials Provider). See [[auth-flow]]
- **File Storage**: MinIO S3-compatible API. See [[minio-s3]]
- **Caching & Rate Limiting**: Upstash Redis. See [[redis-cache]]
- **AI Chatbot**: Integration with Hermes API. See [[chat]] and [[hermes-client]]

## Core Directories

- `/app`: App router routes (pages & APIs)
- `/components`: Shared React UI components (`/components/chat` holds the AI chat widget)
- `/lib`: Shared utilities (database, auth, S3 client) + `/lib/ai` (chatbot: `prompt.ts`, `client.ts`, `cache.ts`)
- `/content/ai`: AI knowledge base — `rules.md` (guardrails), `profile.md` (bio), `knowledge/` (any pasted `.md`, loaded recursively)
- `/prisma`: Database schema and migrations
- `/docs`: Project docs — `/docs/obisidianWebPorto` is the documentation vault (this vault), plus implementation notes (`*.md`), `/docs/template`, `/docs/myportofoliov2`
