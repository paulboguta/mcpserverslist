import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to everything except /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // For /admin paths, check authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If not authenticated, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is admin (matching the admin email)
  if (session.user.email !== env.NEXT_PUBLIC_ADMIN_EMAIL) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};