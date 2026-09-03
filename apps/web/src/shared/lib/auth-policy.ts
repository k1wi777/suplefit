export type AuthRole = "admin" | "user";

export type AuthState = "loading" | "anonymous" | "user" | "admin" | "invalid";

export type AuthSession = {
  isAdmin: boolean;
  user?: {
    id?: number;
    nombre?: string;
    correo?: string;
    objetivo?: string;
  };
};

export const ADMIN_ROUTES = ["/admin"] as const;
export const AUTHENTICATED_USER_ROUTES = [
  "/dashboard",
  "/profile",
  "/orders",
  "/performance",
  "/recovery",
] as const;
export const ADMIN_EXCLUDED_ROUTES = ["/planes", "/cart"] as const;
export const GUEST_ONLY_ROUTES = ["/login", "/register"] as const;

export function startsWithRoute(pathname: string, routes: readonly string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAdminRoute(pathname: string) {
  return startsWithRoute(pathname, ADMIN_ROUTES);
}

export function isAuthenticatedUserRoute(pathname: string) {
  return startsWithRoute(pathname, AUTHENTICATED_USER_ROUTES);
}

export function isAdminExcludedRoute(pathname: string) {
  return startsWithRoute(pathname, ADMIN_EXCLUDED_ROUTES);
}

export function isGuestOnlyRoute(pathname: string) {
  return startsWithRoute(pathname, GUEST_ONLY_ROUTES);
}

export function isAuthSession(value: unknown): value is AuthSession {
  return (
    typeof value === "object" &&
    value !== null &&
    "isAdmin" in value &&
    typeof value.isAdmin === "boolean"
  );
}

export function getPathWithSearch(pathname: string, search = "") {
  return `${pathname}${search}`;
}

export function isSafeRelativePath(value: string | null | undefined): value is string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return false;
  }

  if (/[\u0000-\u001f\u007f]/.test(value)) return false;

  try {
    const parsed = new URL(value, "https://suplefit.invalid");
    return parsed.origin === "https://suplefit.invalid" && parsed.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export function getSafeDestination(requestedPath: string | null | undefined, role: AuthRole) {
  const requested = isSafeRelativePath(requestedPath) ? requestedPath : null;
  const requestedPathname = requested
    ? new URL(requested, "https://suplefit.invalid").pathname
    : null;
  if (role === "admin") {
    return requested && requestedPathname && isAdminRoute(requestedPathname) ? requested : "/admin";
  }
  return requested &&
    requestedPathname &&
    !isAdminRoute(requestedPathname) &&
    !isGuestOnlyRoute(requestedPathname)
    ? requested
    : "/dashboard";
}

export function getLoginDestination(pathname: string, search = "") {
  const requested = getPathWithSearch(pathname, search);
  const safeDestination = isSafeRelativePath(requested) ? requested : "/dashboard";
  return `/login?next=${encodeURIComponent(safeDestination)}`;
}
