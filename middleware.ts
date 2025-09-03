import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // allow assets and the login/API paths
  const allowed = pathname.startsWith("/login") || pathname.startsWith("/api/login")
    || pathname.startsWith("/_next") || pathname.startsWith("/favicon")
    || pathname.startsWith("/robots.txt");

  if (allowed) return NextResponse.next();

  const pass = req.cookies.get("pass")?.value;
  if (pass === "ok") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
