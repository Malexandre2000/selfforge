import { router } from "../trpc";
import { onboardingRouter } from "./onboarding";
import { missionsRouter } from "./missions";
import { habitsRouter } from "./habits";
import { progressRouter } from "./progress";
import { dashboardRouter } from "./dashboard";
import { aiCoachRouter } from "./aiCoach";
import { billingRouter } from "./billing";
import { waitlistRouter } from "./waitlist";
import { betaRouter } from "./beta";
import { feedbackRouter } from "./feedback";
import { featureRequestsRouter } from "./featureRequests";
import { adminRouter } from "./admin";

export const appRouter = router({
  onboarding: onboardingRouter,
  missions: missionsRouter,
  habits: habitsRouter,
  progress: progressRouter,
  dashboard: dashboardRouter,
  aiCoach: aiCoachRouter,
  billing: billingRouter,
  waitlist: waitlistRouter,
  beta: betaRouter,
  feedback: feedbackRouter,
  featureRequests: featureRequestsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
