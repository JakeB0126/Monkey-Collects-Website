import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

const ADMIN_LOGIN_PATH = "/admin/login";

function getLoginUrl(request: NextRequest) {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);

  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isLoggedIn = await isValidAdminSession(sessionValue);

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(getLoginUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
