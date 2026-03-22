import type { authClient } from "@/lib/auth/auth-client";

type AuthClient = typeof authClient;

/**
 * Persists onboarding progress on the Better Auth user record (single source of truth).
 */
export async function updateOnboardingUserState(
  client: AuthClient,
  params: {
    onboardingStep: number;
    completedOnboarding?: boolean;
  }
): Promise<void> {
  const payload: {
    onboardingStep: number;
    completedOnboarding?: boolean;
  } = { onboardingStep: params.onboardingStep };
  if (params.completedOnboarding !== undefined) {
    payload.completedOnboarding = params.completedOnboarding;
  }

  const result = await (
    client as unknown as {
      updateUser: (body: typeof payload) => Promise<{ error?: { message?: string } }>;
    }
  ).updateUser(payload);

  if (result?.error) {
    throw new Error(result.error.message ?? "Failed to update onboarding state");
  }
}
