"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { readPendingOnboarding, clearPendingOnboarding } from "@/lib/onboardingStorage";

/**
 * Onboarding is collected before sign-up (see OnboardingWizard), so the
 * answers are stashed in localStorage until a real user id exists. This
 * runs once per authenticated session and flushes them to the database.
 */
export function OnboardingSync() {
  const attempted = useRef(false);
  const submit = trpc.onboarding.submit.useMutation({
    onSuccess: () => clearPendingOnboarding(),
  });

  useEffect(() => {
    if (attempted.current) return;
    const pending = readPendingOnboarding();
    if (!pending) return;
    attempted.current = true;
    submit.mutate(pending);
  }, [submit]);

  return null;
}
