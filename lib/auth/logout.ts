// lib/logout.ts
import { authClient } from "@/lib/auth/auth-client";

interface LogoutOptions {
  callbackUrl?: string;
  redirect?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const handleLogout = async (options: LogoutOptions = {}) => {
  const {
    callbackUrl = "/login",
    redirect = true,
    onSuccess,
    onError,
  } = options;

  try {
    console.log("Starting logout process...");
    console.log("Current cookies before clear:", document.cookie);

    // Clearing the QA cookie (if it exists)
    const qaLogoutResponse = await fetch("/api/qa-logout", {
      method: "POST",
      credentials: "include",
    });

    if (qaLogoutResponse.ok) {
      const data = await qaLogoutResponse.json();
      console.log("QA logout response:", data);
      console.log("Current cookies after clear:", document.cookie);
    } else {
      console.warn("QA logout failed:", qaLogoutResponse.status);
    }

    console.log("Proceeding with Better Auth signout");

    const { error } = await authClient.signOut(
      {},
      {
        onSuccess() {
          if (redirect) {
            window.location.href = callbackUrl;
          }
        },
      }
    );

    if (error) {
      throw new Error(error.message || "Failed to sign out");
    }

    onSuccess?.();
  } catch (error) {
    console.error("Logout error:", error);

    const logoutError = error instanceof Error ? error : new Error("Unknown logout error");
    onError?.(logoutError);
  }
};
