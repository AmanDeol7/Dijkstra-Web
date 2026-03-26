import { NextRequest } from "next/server";
import { updateOnboardingStepController } from "@/nextjs-server/Controllers/OnboardingController";

export async function POST(request: NextRequest) {
  return updateOnboardingStepController(request);
}
