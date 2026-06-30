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
      const response = NextResponse.redirect(url);
      response.cookies.delete("haven-onboarding-complete");
      return response;
    }
  }

  // Protect /onboarding and all sub-routes
  if (pathname.startsWith("/onboarding")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      const response = NextResponse.redirect(url);
      response.cookies.delete("haven-onboarding-complete");
      return response;
    }
  }

  // Short-circuit: if onboarding is already confirmed complete via cookie, skip the backend fetch
  if (
    pathname.startsWith("/dashboard") &&
    request.cookies.get("haven-onboarding-complete")?.value === "true"
  ) {
    return NextResponse.next();
  }

  // If we have a token, check onboarding status to prevent flash
  if (token) {
    const accessToken = (token as Record<string, unknown>).accessToken as string | undefined;

    // Resolve the backend URL for the server-side fetch. On the deployed
    // frontend, localhost:8000 does not exist inside the container, so derive
    // the public backend URL from NEXT_PUBLIC_WS_URL (wss://.../ws -> https://...)
    // the same way lib/api.ts getApiBase() does.
    const resolveApiUrl = (): string => {
      if (process.env.BACKEND_INTERNAL_URL) return process.env.BACKEND_INTERNAL_URL.replace(/\/$/, "");
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
      const ws = process.env.NEXT_PUBLIC_WS_URL;
      if (ws) {
        return ws.replace(/^ws/, "http").replace(/\/ws\/?$/, "").replace(/\/$/, "");
      }
      return "http://localhost:8000";
    };

    if (accessToken && pathname.startsWith("/dashboard")) {
      try {
        const apiUrl = resolveApiUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(
          `${apiUrl}/api/onboarding/status?auth_token=${accessToken}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();

          // User hasn't completed onboarding - redirect to onboarding
          if (!data.complete) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding";
            const response = NextResponse.redirect(url);
            response.cookies.delete("haven-onboarding-complete");
            return response;
          }

          // Onboarding complete - set cookie to skip future checks
          const response = NextResponse.next();
          response.cookies.set("haven-onboarding-complete", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365,
          });
          return response;
        } else {
          // API returned non-OK (e.g. 401, 500) — fail OPEN to match the
          // dashboard's client-side gate. The client gate remains the backstop,
          // so a transient backend error / expired token won't strand an
          // onboarded user on /onboarding.
          return NextResponse.next();
        }
      } catch {
        // Backend unreachable or timed out — fail OPEN to match the dashboard's
        // client-side gate. Letting the request through avoids stranding a
        // fully-onboarded user on /onboarding during transient errors.
        return NextResponse.next();
      }
    }

    // If user is on /onboarding but has the cookie (already completed), send to dashboard
    if (accessToken && pathname.startsWith("/onboarding")) {
      try {
        const apiUrl = resolveApiUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await fetch(
          `${apiUrl}/api/onboarding/status?auth_token=${accessToken}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.complete) {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
          }
        }
      } catch {
        // Can't verify — let them stay on onboarding (safe default)
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
