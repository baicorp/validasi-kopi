import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);

  if (!session && pathname !== "/sign-in") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (session && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"], // Specify the routes the middleware applies to
};
