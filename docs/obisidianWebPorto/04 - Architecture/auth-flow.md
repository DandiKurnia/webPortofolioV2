# Auth Flow

File: `lib/auth.ts`

- Provider: **Credentials Provider** (email and password).
- Password Check: Async `bcryptjs#compare`.
- Validations: User findBy unique `email` then `compare(passInput, passStored)`.
- Session Strategy: **JWT** (30 days).
- Callbacks:
  - `jwt`: Embed `id`, `email`, `name` into token.
  - `session`: Hydrate `session.user` from token.
- Page mapping: `signIn: "/admin/login"`.

API handler exposed at `app/api/auth/[...nextauth]/route.ts` via `export { GET, POST } from "@/lib/auth"`.
