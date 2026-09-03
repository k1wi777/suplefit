"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { getSafeDestination, isAuthSession } from "@/shared/lib/auth-policy";
import { clearToken, getToken } from "../utils/token";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      Promise.resolve().then(() => {
        if (active) setReady(true);
      });
      return;
    }

    apiFetch<unknown>("/api/auth/me", { token })
      .then((data) => {
        if (!isAuthSession(data)) {
          clearToken();
          if (active) setReady(true);
          return;
        }
        router.replace(getSafeDestination(searchParams.get("next"), data.isAdmin ? "admin" : "user"));
      })
      .catch(() => {
        clearToken();
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [router, searchParams]);

  if (!ready) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-[calc(100dvh-3.25rem)] items-center justify-center text-white/70">
        Redirigiendo...
      </div>
    );
  }

  return <div className="flex flex-col flex-1 w-full">{children}</div>;
}
