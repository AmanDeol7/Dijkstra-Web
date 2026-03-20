import { getUserOnboardingByUsername } from "@/server/Repository/OnboardingRepository";
import { updateUserOnboardingByUsername } from "@/server/Repository/OnboardingRepository";
import { OnboardingStatusOutputDTO } from "@/types/client/onboarding/api";
import type { OnboardingFormData } from "@/types/client/onboarding/onboarding";

/**
 * Check onboarding status for a username
 */
export async function checkOnboardingStatus(
  username: string
): Promise<OnboardingStatusOutputDTO> {
  try {
    const user = await getUserOnboardingByUsername(username);

    if (!user) throw new Error("User not found");

    return user as OnboardingStatusOutputDTO;
  } catch (error) {
    throw new Error("Failed to check onboarding status: " + error);
  }
}

/**
 * Update onboarding step for a username
 */
export async function updateOnboardingStep(
  username: string,
  step: number
): Promise<OnboardingStatusOutputDTO> {
  try {
    const user = await updateUserOnboardingByUsername({
      username: username,
      onboardingStep: step,
      completedOnboarding: step >= 7 ? true : false,
    });

    if (!user) {
      throw new Error("Failed to update onboarding step");
    }

    return user as OnboardingStatusOutputDTO;
  } catch (error) {
    throw new Error("Failed to update onboarding step: " + error);
  }
}
