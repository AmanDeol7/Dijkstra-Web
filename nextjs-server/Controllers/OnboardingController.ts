import { NextRequest, NextResponse } from "next/server";
import {
  checkOnboardingStatus,
  updateOnboardingStep,
} from "@/nextjs-server/Services/Onboarding/OnboardingService";
import type {
  OnboardingStatusInputDTO,
  OnboardingStatusOutputDTO,
  OnboardingStepUpdateInputDTO,
  OnboardingSubmitInputDTO,
} from "@/types/client/onboarding/api";

import { updateUserOnboardingByUsername } from "../Repository/OnboardingRepository";


export async function getOnboardingStatusController(request: NextRequest) {
  try {
    const input: OnboardingStatusInputDTO = await request.json();
    const data: OnboardingStatusOutputDTO = await checkOnboardingStatus(
      input.username
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch onboarding status",
      },
      { status: 500 }
    );
  }
}

export async function updateOnboardingStepController(request: NextRequest) {
  try {
    const input: OnboardingStepUpdateInputDTO = await request.json();
    const data: OnboardingStatusOutputDTO = await updateOnboardingStep(
      input.username,
      input.step
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to update onboarding step",
      },
      { status: 500 }
    );
  }
}

export async function submitOnboardingController(request: NextRequest) {
    // Make call to updateUserOnboardingByUsername service
    const input: OnboardingSubmitInputDTO = await request.json();
    const user = await updateUserOnboardingByUsername({
      username: input.username,
      completedOnboarding: input.completedOnboarding,
      onboardingStep: input.onboardingStep,
    });
    if (!user) {
      return NextResponse.json({ message: "Failed to update user onboarding status" }, { status: 500 });
    }

    return NextResponse.json({ message: "Onboarding submitted to Dijkstra Web DB successfully" }, { status: 200 });
}
