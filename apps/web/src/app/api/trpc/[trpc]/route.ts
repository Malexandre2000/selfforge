import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// The Expo dev server (native/web) runs on a different origin than this
// Next.js server, and every procedure requires a Bearer token rather than
// a same-site cookie, so a permissive CORS policy here doesn't expose
// anything a valid token wouldn't already gate.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function handler(req: Request) {
  const res = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

function options() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export { handler as GET, handler as POST, options as OPTIONS };
