"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/token";

type MeResponse = { isAdmin: boolean };

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
      return;
    }
    apiFetch<MeResponse>("/api/auth/me", { token })
      .then((data) => {
        if (!data.isAdmin) {
          router.replace("/dashboard");
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/70 min-h-[50vh]">
        Verificando permisos de administrador...
      </div>
    );
  }

  return <>{children}</>;
}
