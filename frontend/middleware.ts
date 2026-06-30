import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware to protect routes and enforce onboarding flow.
 * - Redirects unauthenticated users to the landing page.
 * - Redirects users who haven't completed onboarding away from /dashboard.
 * - Redirects users who have completed onboarding away from /onboarding.
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Protect /dashboard and all sub-routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Protect /onboarding and all sub-routes
  if (pathname.startsWith("/onboarding")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // If we have a token, check onboarding status to prevent flash
  if (token) {
    const accessToken = (token as Record<string, unknown>).accessToken as string | undefined;

    if (accessToken) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(
          `${apiUrl}/api/onboarding/status?auth_token=${accessToken}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();

          // User hasn't completed onboarding but is on dashboard - redirect to onboarding
          if (!data.complete && pathname.startsWith("/dashboard")) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding";
            return NextResponse.redirect(url);
          }

          // User has completed onboarding but is on onboarding page - redirect to dashboard
          if (data.complete && pathname.startsWith("/onboarding")) {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
          }
        }
      } catch {
        // If the API call fails (network, timeout, etc.), fall through.
        // The client-side check in dashboard/page.tsx still works as a fallback.
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
