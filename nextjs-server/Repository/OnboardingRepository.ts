import { queryOneNextJsDb } from "../NextJsDBIntegration";
import type { SqlParam } from "@/nextjs-server/NextJsDBIntegration";
import type {
  OnboardingStatusOutputDTO,
  OnboardingSubmitInputDTO,
} from "@/types/client/onboarding/api";

export async function getUserOnboardingByUsername(
  username: string
): Promise<OnboardingStatusOutputDTO | null> {
  return queryOneNextJsDb<OnboardingStatusOutputDTO>(
    `SELECT
        completedOnboarding,
        id,
        onboardingStep
       FROM "user"
       WHERE username = $1
       LIMIT 1`,
    [username]
  );
}

export async function updateUserOnboardingByUsername(
  onboardingData: OnboardingSubmitInputDTO
): Promise<OnboardingStatusOutputDTO | null> {
  const { completedOnboarding, onboardingStep, username } = onboardingData;
  return queryOneNextJsDb<OnboardingStatusOutputDTO>(
    `UPDATE "user"
       SET "completedOnboarding" = $1, "onboardingStep" = $2
       WHERE username = $3
       RETURNING id, username, "completedOnboarding", "onboardingStep"`,
    [completedOnboarding, onboardingStep, username]
  );
}
