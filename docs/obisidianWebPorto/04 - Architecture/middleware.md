# Middleware Route Protection

File: `middleware.ts`
Matcher: `/admin/:path*`

- Authenticates using `next-auth/middleware`.
- **Unknown & Visiting `/admin/login`**: Authenticated visitors get redirected back directly to `/admin/overview`. Unauthenticated pass through via `NextResponse.next()` (fixed 404).
- **Unknown & Visiting `/admin/*`**: Unauthenticated are redirected back to `/admin/login?from=...`.
- **Admin**: No further restrictions defined beyond the underlying `authorized: () => true` callback.

See [[auth-flow]].
