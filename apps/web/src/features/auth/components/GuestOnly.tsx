"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../utils/token";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    Promise.resolve().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-[calc(100dvh-3.25rem)] items-center justify-center text-white/70">
        Redirigiendo...
      </div>
    );
  }

  return <div className="flex flex-col flex-1 w-full">{children}</div>;
}

