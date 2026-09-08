"use client";

import { Suspense } from "react";
import { GuestOnly } from "@/features/auth";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <GuestOnly>
      <main className="relative flex min-h-[calc(100dvh-3.25rem)] flex-1 items-center overflow-hidden px-4 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(186,255,46,0.14),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(92,255,188,0.08),transparent_30%)]" />
        <div className="relative z-10 mx-auto grid w-full max-w-4xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <section className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#baff2e]">Bienvenido de vuelta</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white">Tu progreso también se construye al volver.</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">Retoma tus objetivos, revisa tus pedidos y encuentra recomendaciones pensadas para tu camino.</p>
            <div className="mt-8 space-y-3 text-sm text-white/65">
              {["Dashboard y seguimiento personal", "Pedidos y compras en un solo lugar", "Recomendaciones orientativas para tu objetivo"].map((item) => (
                <div key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#baff2e]/10 text-[#baff2e]">✓</span>{item}</div>
              ))}
            </div>
          </section>
        <Suspense fallback={<div className="text-white/60 relative z-10">Cargando...</div>}>
          <LoginForm />
        </Suspense>
        </div>
      </main>
    </GuestOnly>
  );
}
