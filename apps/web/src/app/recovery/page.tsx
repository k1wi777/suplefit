"use client";

import Link from "next/link";
import { AuthenticatedOnly } from "@/features/auth";
import GlassCard from "@/shared/components/GlassCard";
import DisclaimerBanner from "@/shared/components/DisclaimerBanner";

export default function RecoveryPage() {
  return (
    <AuthenticatedOnly>
      <main className="flex-1 px-4 py-10 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full">
        <aside className="w-full md:w-64 flex flex-col gap-2">
          <div className="glass p-4 rounded-2xl border border-sky-500/20">
            <h2 className="text-white font-black text-lg">Recuperación</h2>
            <p className="text-white/60 text-sm mt-1">Descanso e hidratación.</p>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <Link href="/dashboard" className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/70">
              Dashboard
            </Link>
            <Link href="/performance" className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/70">
              Rendimiento
            </Link>
            <Link href="/recovery" className="px-4 py-3 rounded-xl bg-sky-400/20 text-sky-400 font-semibold border border-sky-400/30">
              Recuperación
            </Link>
            <Link href="/profile" className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/70">
              Perfil
            </Link>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col gap-6">
          <DisclaimerBanner compact />
          <GlassCard className="p-6">
            <h1 className="text-white font-black text-2xl">Seguimiento de recuperación</h1>
            <p className="text-white/60 text-sm mt-2">
              Registra horas de descanso e hidratación desde el{" "}
              <Link href="/dashboard" className="text-[#baff2e] underline">
                dashboard
              </Link>
              . Los gráficos detallados de sueño y frecuencia cardíaca estarán disponibles próximamente.
            </p>
          </GlassCard>
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
