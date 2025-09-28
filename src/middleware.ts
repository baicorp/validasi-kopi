import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  // fix me : tambahkan validasi session untuk setiap route yang diproteksi
  const { pathname } = request.nextUrl;
  if (!sessionCookie && pathname !== "/sign-in") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (sessionCookie && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/dashboard/produk", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in"], // Specify the routes the middleware applies to
};
