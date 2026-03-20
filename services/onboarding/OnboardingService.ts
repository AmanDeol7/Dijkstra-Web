import { apiCall } from "@/services/CoreApiService";
import type {
  OnboardUserRequest,
  OnboardUserResponse,
} from "@/types/server/dataforge/User/user";

const ONBOARD_PATH = "Dijkstra/v1/u/onboard";

/**
 * Submit onboarding data
 */
export async function submitDataforgeOnboarding(
  data: OnboardUserRequest
): Promise<OnboardUserResponse> {
  // Finally Submit to Dataforge DB
  return apiCall<OnboardUserResponse>("dataforge", ONBOARD_PATH, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
