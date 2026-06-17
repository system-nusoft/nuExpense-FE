import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/verify-email"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/expenses",
  "/categories",
  "/settings",
  "/scan",
  "/onboarding",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (set by the client after login)
  const token = request.cookies.get("nuexpense_access_token")?.value;

  // If authenticated user visits /login or /signup → redirect to /dashboard
  if (token && isPublicAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If unauthenticated user visits a protected route → redirect to /login
  if (!token && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
