"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { getLoginDestination, isAuthSession, type AuthState } from "@/shared/lib/auth-policy";
import { getToken } from "../utils/token";

export default function AuthenticatedOnly({
  children,
  allowAnonymous = false,
}: {
  children: React.ReactNode;
  allowAnonymous?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      if (allowAnonymous) {
        Promise.resolve().then(() => {
          if (active) setAuthState("anonymous");
        });
      } else {
        router.replace(getLoginDestination(pathname || "/dashboard"));
      }
      return;
    }
    apiFetch<unknown>("/api/auth/me", { token })
      .then((data) => {
        if (!isAuthSession(data)) {
          if (active) setAuthState("invalid");
          router.replace(getLoginDestination(pathname || "/dashboard"));
          return;
        }
        if (data.isAdmin) {
          router.replace("/admin");
          return;
        }
        if (active) setAuthState("user");
      })
      .catch(() => {
        if (active) setAuthState("invalid");
        router.replace(getLoginDestination(pathname || "/dashboard"));
      });
    return () => {
      active = false;
    };
  }, [allowAnonymous, pathname, router]);

  if (authState !== "user" && !(authState === "anonymous" && allowAnonymous)) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/70">
        Validando sesión...
      </div>
    );
  }

  return <>{children}</>;
}
