# Auth API

File: `app/api/auth/[...nextauth]/route.ts`
Configuration: `lib/auth.ts`

- Handled entirely by **NextAuth**.
- Utilizes Credentials provider.
- Bcrypt for hashing passwords.
- JWT session strategy.

See [[auth-flow]] for middleware details.
