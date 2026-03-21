import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

type AccountRow = { providerId?: string };

function normalizeListAccountsResponse(raw: unknown): AccountRow[] {
  if (Array.isArray(raw)) return raw as AccountRow[];
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return (raw as { data: AccountRow[] }).data;
  }
  return [];
}

/**
 * OAuth: GitHub primary session uses session.user.username (Better Auth).
 * Discord / LinkedIn linking uses list-accounts.
 */
export function useOAuthAccounts() {
  const { data: session } = authClient.useSession();
  const [linkedProviders, setLinkedProviders] = useState<Set<string>>(
    () => new Set()
  );

  const user = session?.user as { username?: string } | undefined;
  const githubUsername = user?.username ?? "";
  const githubConnected = githubUsername.length > 0;

  const loadLinkedAccounts = useCallback(async () => {
    if (!session?.user) {
      setLinkedProviders(new Set());
      return;
    }
    try {
      const raw = await authClient.$fetch("/list-accounts", {
        method: "GET",
      });
      const accounts = normalizeListAccountsResponse(raw);
      const ids = new Set(
        accounts
          .map((a) => a.providerId?.toLowerCase())
          .filter(Boolean) as string[]
      );
      setLinkedProviders(ids);
    } catch {
      setLinkedProviders(new Set());
    }
  }, [session?.user]);

  useEffect(() => {
    void loadLinkedAccounts();
  }, [loadLinkedAccounts]);

  useEffect(() => {
    const onFocus = () => {
      void loadLinkedAccounts();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadLinkedAccounts]);

  const discordConnected = linkedProviders.has("discord");
  const linkedinConnected = linkedProviders.has("linkedin");

  return {
    githubConnected,
    githubUsername,
    linkedinConnected,
    discordConnected,
    refreshLinkedAccounts: loadLinkedAccounts,
  };
}
