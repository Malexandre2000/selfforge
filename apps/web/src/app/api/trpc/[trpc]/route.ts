import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Every procedure requires a Bearer token or Clerk session rather than a
// same-site cookie, so a stolen response here still needs a stolen token —
// but we still scope this to known origins rather than wildcard, since an
// allowlist costs nothing and narrows the attack surface regardless.
const ALLOWED_ORIGINS = [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:8081"].filter(
  (v): v is string => !!v,
);

function resolveCorsOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  // Local/Expo dev origins vary (LAN IP, alternate ports) — stay permissive
  // outside production rather than hand-maintaining every dev origin.
  if (process.env.NODE_ENV !== "production") return origin;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function corsHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  const origin = resolveCorsOrigin(req);
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

async function handler(req: Request) {
  const res = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
  for (const [key, value] of Object.entries(corsHeaders(req))) {
    res.headers.set(key, value);
  }
  return res;
}

function options(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export { handler as GET, handler as POST, options as OPTIONS };
