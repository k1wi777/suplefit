"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/token";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/70">
        Redirigiendo...
      </div>
    );
  }

  return <>{children}</>;
}

