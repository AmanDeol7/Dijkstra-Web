"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { checkOnboardingStatus } from "@/services/onboarding/OnboardingService";

export default function SignUpPage() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    // Not logged in → start onboarding
    if (!session?.user) {
      window.location.href = "/onboarding";
      return;
    }

    const username =
      (session.user as any).github_user_name ||
      (session.user as any).login ||
      "";

    if (!username) {
      window.location.href = "/onboarding";
      return;
    }

    (async () => {
      try {
        const status = await checkOnboardingStatus(username);

        if (!status.user_id) {
          // User does not exist in backend → fresh onboarding
          window.location.href = "/onboarding";
          return;
        }

        if (status.onboarded) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/onboarding";
        }
      } catch {
        window.location.href = "/onboarding";
      }
    })();
  }, [session, isPending]);

  return null;
}

