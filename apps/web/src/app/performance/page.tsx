"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthenticatedOnly, getToken } from "@/features/auth";
import GlassCard from "@/shared/components/GlassCard";
import DisclaimerBanner from "@/shared/components/DisclaimerBanner";
import { apiFetch } from "@/shared/lib/api";
import { useRouter } from "next/navigation";

type Supplement = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen_url: string | null;
};

type Criterios = {
  objetivoLabel: string | null;
  categorias: string[];
  notas: string[];
};

export default function PerformancePage() {
  const router = useRouter();
  const token = getToken();
  const [items, setItems] = useState<Supplement[]>([]);
  const [criterios, setCriterios] = useState<Criterios | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    apiFetch<{ items: Supplement[]; criterios: Criterios }>("/api/recommendations", { token })
      .then((data) => {
        setItems(data.items);
        setCriterios(data.criterios);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [router, token]);

  return (
    <AuthenticatedOnly>
      <main className="flex-1 px-4 py-10 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full">
        <aside className="w-full md:w-64 flex flex-col gap-2">
          <div className="glass p-4 rounded-2xl border border-emerald-500/20">
            <h2 className="text-white font-black text-lg">Rendimiento</h2>
            <p className="text-white/60 text-sm mt-1">Sugerencias según tu perfil.</p>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <Link href="/dashboard" className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 transition">
              Dashboard
            </Link>
            <Link
              href="/performance"
              className="px-4 py-3 rounded-xl bg-emerald-400/20 text-emerald-400 font-semibold border border-emerald-400/30"
            >
              Rendimiento
            </Link>
            <Link href="/recovery" className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 transition">
              Recuperación
            </Link>
            <Link href="/profile" className="px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 transition">
              Perfil
            </Link>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col gap-6">
          <DisclaimerBanner compact />
          <GlassCard>
            <h1 className="text-white font-black text-2xl">Stacks sugeridos</h1>
            <p className="text-white/60 text-sm mt-1">
              Basados en tu objetivo y nivel de actividad — no son prescripción médica.
            </p>
            {criterios ? (
              <div className="mt-4 text-xs text-white/50 space-y-1">
                {criterios.objetivoLabel ? <p>Objetivo: {criterios.objetivoLabel}</p> : null}
                {criterios.categorias.length ? (
                  <p>Categorías: {criterios.categorias.join(", ")}</p>
                ) : null}
              </div>
            ) : null}
          </GlassCard>

          {loading ? (
            <p className="text-white/50">Cargando recomendaciones...</p>
          ) : items.length === 0 ? (
            <GlassCard className="p-6">
              <p className="text-white/60 text-sm">
                Completa tu perfil y objetivo en{" "}
                <Link href="/profile" className="text-[#baff2e] underline">
                  Perfil
                </Link>{" "}
                para ver sugerencias.
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((s) => (
                <Link key={s.id} href={`/supplements/${s.id}`}>
                  <GlassCard className="p-4 border border-white/10 hover:border-[#baff2e]/30 transition h-full">
                    <h3 className="text-white font-bold">{s.nombre}</h3>
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{s.descripcion}</p>
                    <div className="text-[#baff2e] font-bold mt-3">${Number(s.precio).toFixed(2)}</div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
