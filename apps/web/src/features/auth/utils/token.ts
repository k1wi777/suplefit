"use client";

const TOKEN_KEY = "suplefit_token";
const COOKIE_KEY = "suplefit_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const AUTH_CHANGED_EVENT = "suplefit_auth_changed";

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  notifyAuthChanged();
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  notifyAuthChanged();
}

