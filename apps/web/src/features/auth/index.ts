export { default as AdminOnly } from "./components/AdminOnly";
export { default as AuthenticatedOnly } from "./components/AuthenticatedOnly";
export { default as GuestOnly } from "./components/GuestOnly";
export {
  ADMIN_EXCLUDED_ROUTES,
  ADMIN_ROUTES,
  AUTHENTICATED_USER_ROUTES,
  GUEST_ONLY_ROUTES,
  getLoginDestination,
  getSafeDestination,
  isAdminExcludedRoute,
  isAdminRoute,
  isAuthSession,
  isAuthenticatedUserRoute,
  isGuestOnlyRoute,
  isSafeRelativePath,
  startsWithRoute,
  type AuthRole,
  type AuthState,
  type AuthSession,
} from "@/shared/lib/auth-policy";
export { getToken, setToken, clearToken, AUTH_CHANGED_EVENT } from "./utils/token";
