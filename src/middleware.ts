import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Admin route protection — redirect non-admins
  if (pathname.startsWith("/admin")) {
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // All protected routes require authentication
  const protectedPaths = [
    "/dashboard", "/meals", "/coach", "/fitness", "/progress",
    "/chat", "/recipes", "/grocery", "/wellness", "/profile", "/admin",
  ];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth?.user?.id) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meals/:path*",
    "/coach/:path*",
    "/fitness/:path*",
    "/progress/:path*",
    "/chat/:path*",
    "/recipes/:path*",
    "/grocery/:path*",
    "/wellness/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
