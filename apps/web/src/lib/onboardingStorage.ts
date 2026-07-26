import { onboardingProfileSchema, type OnboardingProfile } from "@selfforge/types";

/**
 * Onboarding happens before sign-up in our funnel (see OnboardingWizard),
 * so there's no user id yet to attach the answers to. We stash the
 * validated profile here and flush it to the database via OnboardingSync
 * once the user is authenticated.
 */
const KEY = "selfforge_pending_onboarding";

export function savePendingOnboarding(profile: OnboardingProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function readPendingOnboarding(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  const result = onboardingProfileSchema.safeParse(JSON.parse(raw));
  return result.success ? result.data : null;
}

export function clearPendingOnboarding() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
