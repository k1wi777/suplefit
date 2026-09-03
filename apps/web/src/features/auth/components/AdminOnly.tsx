"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { getLoginDestination, isAuthSession, type AuthState } from "@/shared/lib/auth-policy";
import { getToken } from "../utils/token";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace(getLoginDestination(pathname || "/admin"));
      return;
    }
    apiFetch<unknown>("/api/auth/me", { token })
      .then((data) => {
        if (!isAuthSession(data)) {
          if (active) setAuthState("invalid");
          router.replace(getLoginDestination(pathname || "/admin"));
          return;
        }
        if (!data.isAdmin) {
          router.replace("/dashboard");
          return;
        }
        if (active) setAuthState("admin");
      })
      .catch(() => {
        if (active) setAuthState("invalid");
        router.replace(getLoginDestination(pathname || "/admin"));
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (authState !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center text-white/70 min-h-[50vh]">
        Verificando permisos de administrador...
      </div>
    );
  }

  return <>{children}</>;
}
