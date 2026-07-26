import { router } from "../trpc";
import { onboardingRouter } from "./onboarding";
import { missionsRouter } from "./missions";
import { habitsRouter } from "./habits";
import { progressRouter } from "./progress";
import { dashboardRouter } from "./dashboard";
import { aiCoachRouter } from "./aiCoach";
import { billingRouter } from "./billing";

export const appRouter = router({
  onboarding: onboardingRouter,
  missions: missionsRouter,
  habits: habitsRouter,
  progress: progressRouter,
  dashboard: dashboardRouter,
  aiCoach: aiCoachRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
