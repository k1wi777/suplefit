import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getPathWithSearch,
  getSafeDestination,
  isAdminExcludedRoute,
  isAdminRoute,
  isAuthSession,
  isAuthenticatedUserRoute,
  isGuestOnlyRoute,
  isSafeRelativePath,
} from "@/shared/lib/auth-policy";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function resolveIsAdmin(req: NextRequest, token: string): Promise<boolean | null> {
  const meUrl = API_BASE_URL
    ? new URL("/api/auth/me", API_BASE_URL)
    : new URL("/api/auth/me", req.url);

  try {
    const response = await fetch(meUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return isAuthSession(data) ? data.isAdmin : null;
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  const requested = getPathWithSearch(req.nextUrl.pathname, req.nextUrl.search);
  loginUrl.searchParams.set("next", isSafeRelativePath(requested) ? requested : "/dashboard");
  return NextResponse.redirect(loginUrl);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("suplefit_token")?.value;
  const isAdminPage = isAdminRoute(pathname);
  const isUserPage = isAuthenticatedUserRoute(pathname);
  const isAdminExcludedPage = isAdminExcludedRoute(pathname);
  const isAuthPage = isGuestOnlyRoute(pathname);

  if (!token) {
    if (isAdminPage || isUserPage) return redirectToLogin(req);
    return NextResponse.next();
  }

  if (!isAdminPage && !isUserPage && !isAdminExcludedPage && !isAuthPage) {
    return NextResponse.next();
  }

  const isAdmin = await resolveIsAdmin(req, token);
  if (isAdmin === null) {
    if (isAdminPage || isUserPage || isAdminExcludedPage) return redirectToLogin(req);
    return NextResponse.next();
  }

  if (isAdminPage) {
    return isAdmin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isUserPage || isAdminExcludedPage) {
    return isAdmin
      ? NextResponse.redirect(new URL("/admin", req.url))
      : NextResponse.next();
  }

  if (isAuthPage) {
    return NextResponse.redirect(
      new URL(getSafeDestination(req.nextUrl.searchParams.get("next"), isAdmin ? "admin" : "user"), req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
