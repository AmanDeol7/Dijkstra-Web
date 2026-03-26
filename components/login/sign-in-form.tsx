"use client";

import { Button } from "@/components/ui/button"
import { DijkstraLogo } from "@/components/login/dijkstra-logo"
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export function SignInForm() {
  const { data: session, isPending } = authClient.useSession();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isPending || !session?.user) return;

    if (!session.user.username) {
      console.error('GitHub username missing from session');
      return;
    }

    if (session.user.completedOnboarding === false) {
      window.location.href = '/onboarding';
    } else {
      window.location.href = '/dashboard';
    }
  }, [session, isPending]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/login", // come back here, let the useEffect handle redirect
      });
    } catch (error) {
      console.error("Login error:", error);
      alert("An unexpected error occurred. Please try again later.");
      setIsLoggingIn(false);
    }
  };

  if (isPending || isLoggingIn || session?.user) {
    return (
      <div className="flex w-full flex-col bg-[#ffffff] lg:w-[60%]">
        <div className="p-6">
          <DijkstraLogo />
        </div>
        <div className="flex flex-1 items-center justify-center px-8 pb-12">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#1a1a1a]">Verifying your account</h1>
            <p className="text-[13px] text-[#666666]">Please wait while we check your account status...</p>
            <Loader2 className="w-8 h-8 animate-spin text-[#1a1a1a] mt-8" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex w-full flex-col bg-[#ffffff] lg:w-[60%]">
      <div className="p-6">
        <DijkstraLogo />
      </div>

      <div className="flex flex-1 items-center justify-center px-8 pb-12">
        <div className="w-full max-w-[280px]">
          <div className="mb-6 text-center">
            <h1 className="mb-1.5 text-2xl font-semibold text-[#1a1a1a]">Sign in to Dijkstra</h1>
            <p className="text-[13px] text-[#666666]">Welcome back! To continue, sign in to your account</p>
          </div>

          <div className="space-y-3.5">
            <Button 
              className="w-full bg-[#1a1a1a] text-[14px] text-white hover:bg-[#2a2a2a]" 
              size="default"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to GitHub...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </>
              )}
            </Button>

            <div className="space-y-0.5 pt-1 text-center text-[13px]">
              <p className="text-[#666666]">
                Do not have GitHub (or) First Time User?{" "}
                <Link href="/onboarding" className="text-[#1a1a1a] underline hover:no-underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


/*
  // Redirect based on onboarding status from backend
  useEffect(() => {
    // Run when coming back from callback, or when already logged in
    if (isPending || !session?.user) return;

    const username = session.user?.username;

    if (!username) return;

    (async () => {
      try {
        const status = await fetch(`/api/onboarding/status?username=${username}`);
        const data = await status.json();
        if (data.userId) {
          // User exists in backend
          if (data.completedOnboarding) {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/onboarding";
          }
        } else {
          // User not yet created in backend
          window.location.href = "/onboarding";
        }
      } catch {
        // On error, prefer onboarding over blocking
        window.location.href = "/onboarding";
      }
    })();
  }, [session, isPending, justLoggedIn]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { error } = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });

      if (error) {
        console.error("GitHub login failed:", error);
        alert("Login failed. Please try again." + error.message);
        setIsLoggingIn(false);
        return;
      } 
      else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An unexpected error occurred. Please try again later." + error);
      setIsLoggingIn(false);
    }
  };
  */