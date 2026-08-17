"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "../utils/token";

export default function AuthenticatedOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }
    Promise.resolve().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/70">
        Validando sesión...
      </div>
    );
  }

  return <>{children}</>;
}

