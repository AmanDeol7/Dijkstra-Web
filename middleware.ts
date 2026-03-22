// middleware.ts - Better Auth + QA gate
import { NextRequest, NextResponse } from "next/server";
import { ENV } from "./constants/constants";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // QA lockdown - block EVERYTHING except QA gate routes
  if (ENV === "QA") {
    const bypassCookie = req.cookies.get("qa_verified")?.value;

    // ONLY allow QA gate routes and essential API routes
    const isQAGateRoute =
      pathname.startsWith("/qa-gate") ||
      pathname.startsWith("/api/qa-gate") ||
      pathname.startsWith("/api/qa-logout") ||
      pathname.startsWith("/api/auth"); // Auth API routes

    // If QA gate route, allow through
    if (isQAGateRoute) {
      return NextResponse.next();
    }

    // For ALL other routes (including /login), check QA bypass first
    if (!bypassCookie) {
      return NextResponse.redirect(new URL("/qa-gate", origin));
    }

    // After QA bypass is confirmed, allow public auth routes
    if (
      pathname === "/" ||
      pathname === "/login" ||
      pathname.startsWith("/onboarding")
    ) {
      return NextResponse.next();
    }

    // For all other protected routes, require Better Auth session cookie
    const sessionCookie = getSessionCookie(req);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", origin));
    }
  }

  // Non-QA environments: Always allow public routes
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // For protected routes, require Better Auth session cookie
  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};