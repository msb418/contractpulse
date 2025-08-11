import { NextResponse, NextRequest } from "next/server";
// If you have SESSION_NAME exported in your auth lib, import it:
import { SESSION_NAME } from "@/lib/auth"; // optional

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const cookieName = SESSION_NAME ?? "cp_session";
  const sessionCookie = req.cookies.get(cookieName);
  const hasSession = sessionCookie && sessionCookie.value && sessionCookie.value.length > 0;

  if (!hasSession) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("next", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/contracts/:path*"], // protect all /contracts routes
};