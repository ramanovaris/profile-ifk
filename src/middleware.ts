import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "ifk_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  // Normalisasi trailing slash agar konsisten dengan atau tanpa trailingSlash di next.config
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const isLoginPage = cleanPath === "/admin/login";

  // ponytail: cookie existence check at edge (no DB query); full revocation & role checks run in server actions and data layer
  if (!sessionToken && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login/";
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && (isLoginPage || cleanPath === "/admin")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin/dashboard/";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
