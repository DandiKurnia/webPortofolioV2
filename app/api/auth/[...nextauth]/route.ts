import { GET as authGET, POST as authPOST } from "@/lib/auth";
import { clientIp, consume, reset, isSuccessfulSignIn } from "@/lib/rate-limit";

// ponytail: in-memory limiter scoped per process. Fine for 1 instance; move to Redis when horizontal scaling.

export { authGET as GET };

type Context = { params: Promise<{ nextauth: string[] }> };
type AuthHandler = (req: Request, context: Context) => Promise<Response>;

const nextAuth = authPOST as unknown as AuthHandler;

export async function POST(req: Request, context: Context) {
  const params = await context.params;
  if (params?.nextauth?.[0] !== "callback" || params?.nextauth?.[1] !== "credentials") {
    return nextAuth(req, context);
  }

  const key = `login:${clientIp(req)}`;
  const limit = consume(key);
  if (!limit.ok) {
    return Response.json(
      { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const res = await nextAuth(req, context);

  // NextAuth answers 200 even for failed sign-ins, so inspect the redirect target
  // instead of the status code before clearing the counter.
  const body = await res.clone().json().catch(() => null);
  if (isSuccessfulSignIn(body)) reset(key);

  return res;
}
