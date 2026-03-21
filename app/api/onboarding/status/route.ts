import { NextRequest } from "next/server";
import { getOnboardingStatusController } from "@/nextjs-server/Controllers/OnboardingController";

export async function GET(request: NextRequest) {
  return getOnboardingStatusController(request);
}
