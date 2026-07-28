import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/ai-coach(.*)",
  "/progress(.*)",
  "/habits(.*)",
  "/missions(.*)",
  "/profile(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  // Clerk-maintained CSP — already includes their own auth domains plus
  // Stripe's (api.stripe.com, js.stripe.com, hooks.stripe.com), which we
  // also need for Checkout/Portal redirects. connect-src is extended for
  // Sentry's ingest endpoint, which isn't in Clerk's default allowlist.
  {
    contentSecurityPolicy: {
      directives: {
        "connect-src": ["'self'", "https://*.ingest.us.sentry.io"],
      },
    },
  },
);

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/", "/(api|trpc)(.*)"],
};
