"use client";

import { Suspense } from "react";
import { GuestOnly } from "@/features/auth";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <GuestOnly>
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <Suspense fallback={<div className="text-white/60 relative z-10">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </GuestOnly>
  );
}
