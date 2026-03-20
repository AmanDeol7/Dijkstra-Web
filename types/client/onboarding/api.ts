
export interface OnboardingStatusInputDTO {
  username: string;
}

export interface OnboardingStepUpdateInputDTO {
  username: string;
  step: number;
}

export interface OnboardingStatusOutputDTO {
  completedOnboarding: boolean;
  userId: string | null;
  onboardingStep: number;
}

export interface OnboardingSubmitInputDTO {
  username: string;
  completedOnboarding: boolean;
  onboardingStep: number;
}