import AsyncStorage from "@react-native-async-storage/async-storage";
import { onboardingProfileSchema, type OnboardingProfile } from "@selfforge/types";

/**
 * Onboarding happens before sign-up in our funnel (see OnboardingWizard),
 * so there's no user id yet to attach the answers to. We stash the
 * validated profile here and flush it to the database via OnboardingSync
 * once the user is authenticated.
 */
const KEY = "selfforge_pending_onboarding";

export async function savePendingOnboarding(profile: OnboardingProfile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function readPendingOnboarding(): Promise<OnboardingProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  const result = onboardingProfileSchema.safeParse(JSON.parse(raw));
  return result.success ? result.data : null;
}

export async function clearPendingOnboarding() {
  await AsyncStorage.removeItem(KEY);
}
