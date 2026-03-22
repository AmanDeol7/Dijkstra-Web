import { NextRequest } from "next/server";
import { submitOnboardingController } from "@/nextjs-server/Controllers/OnboardingController";

export async function POST(request: NextRequest) {
  return submitOnboardingController(request);
}
