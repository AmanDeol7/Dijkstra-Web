import { getUserOnboardingByUsername } from "@/nextjs-server/Repository/OnboardingRepository";
import { updateUserOnboardingByUsername } from "@/nextjs-server/Repository/OnboardingRepository";
import { OnboardingStatusOutputDTO } from "@/types/client/onboarding/api";

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
  step: number,
  completedOnboarding: boolean
): Promise<OnboardingStatusOutputDTO> {
  try {
    const user = await updateUserOnboardingByUsername({
      username: username,
      onboardingStep: step,
      completedOnboarding: completedOnboarding,
    });

    if (!user) {
      throw new Error("Failed to update onboarding step");
    }

    return user as OnboardingStatusOutputDTO;
  } catch (error) {
    throw new Error("Failed to update onboarding step: " + error);
  }
}
