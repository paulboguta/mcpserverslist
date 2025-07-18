import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to everything except /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // ** Only admin paths below **
  // For /admin paths, check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If not authenticated, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};