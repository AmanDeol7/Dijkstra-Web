"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export default function SignUpPage() {
  const { data: session, isPending } = authClient.useSession();
  const username = session?.user?.username ?? "";

  useEffect(() => {
    if (isPending) return;

    // Not logged in → start onboarding
    if (!session?.user) {
      window.location.href = "/onboarding";
      return;
    }

    if (!username) {
      window.location.href = "/onboarding";
      return;
    }

    if (session?.user?.completedOnboarding) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/onboarding";
    }
  }, [session, isPending]);

  return null;
}

