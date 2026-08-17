"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GlassCard from "@/shared/components/GlassCard";
import DisclaimerBanner from "@/shared/components/DisclaimerBanner";
import { apiFetch } from "@/shared/lib/api";
import { getToken, clearToken, AuthenticatedOnly } from "@/features/auth";
import { useRouter } from "next/navigation";
import { WeightHistoryPanel, WeightDeltaBadge, enrichPesoHistorial } from "@/features/weight-tracker";
import { RecommendedProductCard } from "@/features/catalog";
import NumericInput from "@/shared/components/NumericInput";

type Me = {
  user: {
    id: number;
    nombre: string;
    edad: number;
    peso: string | number;
    altura: string | number;
    objetivo: string;
    nivel_actividad: string;
  };
};

type Supplement = {
  id: number;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  precio: string;
  categoriaNombre?: string;
  categoriaSlug?: string;
};

type Criterios = {
  objetivoLabel: string | null;
  categorias: string[];
  notas: string[];
};

type Resumen = {
  entrenosSemana: number;
  hidratacionPromedio: number | null;
  deltaPesoSemanal: number | null;
};

type PesoRow = { peso: string; registradoEn: string; createdAt?: string };

const OBJETIVO_ES: Record<string, string> = {
  ganar_masa_muscular: "Ganar masa muscular",
  perder_grasa: "Bienestar y composición",
  recomposicion_corporal: "Recomposición corporal",
  resistencia: "Resistencia",
  definicion: "Definición y tono",
  rendimiento: "Rendimiento deportivo",
};

function imcLabel(imc: number): string {
  if (imc < 18.5) return "Bajo peso (referencia OMS)";
  if (imc < 25) return "Rango habitual";
  if (imc < 30) return "Sobrepeso (referencia OMS)";
  return "Consultar profesional";
}

export default function DashboardPage() {
  const router = useRouter();
  const token = getToken();

  const [me, setMe] = useState<Me | null>(null);
  const [items, setItems] = useState<Supplement[]>([]);
  const [criterios, setCriterios] = useState<Criterios | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pesoHist, setPesoHist] = useState<PesoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [habitoForm, setHabitoForm] = useState({
    entrenamiento: false,
    descansoHoras: 7,
    hidratacionLitros: 2,
  });
  const [savingHabito, setSavingHabito] = useState(false);

  const imc = useMemo(() => {
    if (!me?.user?.peso || !me?.user?.altura) return null;
    const peso = Number(me.user.peso);
    const altura = Number(me.user.altura);
    if (!Number.isFinite(peso) || !Number.isFinite(altura) || altura <= 0) return null;
    return peso / (altura * altura);
  }, [me]);

  const progresoSemanal = useMemo(() => {
    if (!resumen) return 0;
    const entrenos = Math.min(resumen.entrenosSemana, 5);
    return Math.round((entrenos / 5) * 100);
  }, [resumen]);

  const pesoActualNum = me?.user?.peso != null ? Number(me.user.peso) : null;
  const ultimoDelta = useMemo(() => {
    const e = enrichPesoHistorial(pesoHist);
    const latest = e[e.length - 1];
    return latest?.deltaPrev ?? resumen?.deltaPesoSemanal ?? null;
  }, [pesoHist, resumen]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      apiFetch<Me>("/api/auth/me", { token }),
      apiFetch<{ items: Supplement[]; criterios: Criterios }>("/api/recommendations", { token }),
      apiFetch<Resumen>("/api/tracking/resumen", { token }),
      apiFetch<{ historial: PesoRow[] }>("/api/tracking/peso", { token }),
    ])
      .then(([meData, rec, res, peso]) => {
        setMe(meData);
        setItems(rec.items);
        setCriterios(rec.criterios);
        setResumen(res);
        setPesoHist(peso.historial);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Error al cargar dashboard");
        clearToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router, token]);

  async function guardarHabito() {
    if (!token) return;
    setSavingHabito(true);
    try {
      await apiFetch("/api/tracking/habitos", {
        method: "POST",
        token,
        body: habitoForm,
      });
      const res = await apiFetch<Resumen>("/api/tracking/resumen", { token });
      setResumen(res);
    } finally {
      setSavingHabito(false);
    }
  }

  return (
    <AuthenticatedOnly>
      <main className="flex-1 px-4 py-10 w-full min-h-screen bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#baff2e]/5 blur-[200px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-white font-black text-4xl tracking-tight">Tu panel de bienestar</h1>
              <p className="text-white/60 text-sm mt-2">
                Hola, <span className="text-[#baff2e] font-semibold">{me?.user?.nombre ?? "..."}</span>.
                Seguimiento progresivo, no solo masa o grasa.
              </p>
            </div>
            <Link href="/profile" className="text-[#baff2e] text-xs font-bold uppercase tracking-widest hover:underline">
              Editar perfil y objetivo
            </Link>
          </div>

          <DisclaimerBanner compact />

          {error ? (
            <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4">{error}</div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <GlassCard className="p-6">
                <div className="text-[#baff2e] text-[10px] font-black uppercase tracking-widest">Objetivo actual</div>
                <div className="text-white font-black text-2xl mt-2">
                  {OBJETIVO_ES[me?.user?.objetivo ?? ""] ?? "—"}
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Constancia (entrenos / semana)</span>
                    <span>{progresoSemanal}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#baff2e]" style={{ width: `${progresoSemanal}%` }} />
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {resumen?.entrenosSemana ?? 0} días registrados con entrenamiento
                  </p>
                </div>
              </GlassCard>

              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-5">
                  <div className="text-sky-400 text-[9px] font-black uppercase tracking-widest">Peso</div>
                  <div className="text-white font-black text-2xl mt-1">
                    {me?.user?.peso ?? "—"} <span className="text-sm text-white/40">kg</span>
                  </div>
                  <div className="mt-2">
                    {ultimoDelta != null ? (
                      <WeightDeltaBadge delta={ultimoDelta} label="vs anterior" variant="prev" />
                    ) : (
                      <Link href="/profile" className="text-[#baff2e] text-[10px] hover:underline">
                        Registrar peso en Perfil
                      </Link>
                    )}
                  </div>
                </GlassCard>
                <GlassCard className="p-5">
                  <div className="text-orange-400 text-[9px] font-black uppercase tracking-widest">IMC</div>
                  <div className="text-white font-black text-2xl mt-1">{imc ? imc.toFixed(1) : "—"}</div>
                  <div className="text-white/50 text-[10px] mt-2">{imc ? imcLabel(imc) : "—"}</div>
                </GlassCard>
              </div>

              <GlassCard className="p-5">
                <div className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">
                  Hábitos de hoy
                </div>
                <label className="flex items-center gap-2 text-white/80 text-sm mb-3">
                  <input
                    type="checkbox"
                    checked={habitoForm.entrenamiento}
                    onChange={(e) => setHabitoForm((p) => ({ ...p, entrenamiento: e.target.checked }))}
                  />
                  Entrené hoy
                </label>
                <label className="text-white/50 text-xs block mb-1">Descanso (h)</label>
                <NumericInput
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-3"
                  value={habitoForm.descansoHoras}
                  onChange={(descansoHoras) => setHabitoForm((p) => ({ ...p, descansoHoras }))}
                  min={0}
                  max={24}
                />
                <label className="text-white/50 text-xs block mb-1">Hidratación (L)</label>
                <NumericInput
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-3"
                  value={habitoForm.hidratacionLitros}
                  onChange={(hidratacionLitros) => setHabitoForm((p) => ({ ...p, hidratacionLitros }))}
                  min={0}
                  max={20}
                />
                <button
                  type="button"
                  disabled={savingHabito}
                  onClick={guardarHabito}
                  className="w-full rounded-full neon-btn py-2 text-xs font-bold uppercase disabled:opacity-50"
                >
                  {savingHabito ? "Guardando..." : "Guardar hábitos"}
                </button>
                {resumen?.hidratacionPromedio != null ? (
                  <p className="text-white/40 text-xs mt-2">
                    Promedio hidratación 7 días: {resumen.hidratacionPromedio.toFixed(1)} L
                  </p>
                ) : null}
              </GlassCard>
            </div>

            <div className="lg:col-span-8">
              <WeightHistoryPanel
                historial={pesoHist}
                pesoActual={pesoActualNum}
                showChart
                linkToProfile
              />
              {imc && (imc < 17 || imc > 30) ? (
                <p className="mt-4 text-amber-200/80 text-xs border border-amber-400/20 rounded-lg p-3">
                  Tu IMC está fuera del rango habitual. Considera consultar a un profesional de salud.
                </p>
              ) : null}
            </div>
          </div>

          <section className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-[#baff2e] text-[10px] font-black uppercase tracking-[0.2em]">
                  Tu stack personalizado
                </span>
                <h2 className="text-white font-black text-3xl tracking-tight mt-1">
                  Productos recomendados
                </h2>
                <p className="text-white/50 text-sm mt-1">Según tu objetivo y nivel de actividad</p>
              </div>
              <Link
                href="/catalog"
                className="text-[#baff2e] text-xs font-black uppercase tracking-widest hover:underline shrink-0"
              >
                Ver catálogo completo
              </Link>
            </div>

            <GlassCard className="p-5 mb-6 border border-white/10 rounded-[2rem]">
              <h3 className="text-white font-bold text-sm mb-2">¿Cómo se generan?</h3>
              {criterios ? (
                <ul className="text-white/60 text-xs space-y-1 list-disc pl-4">
                  {criterios.objetivoLabel ? <li>Objetivo: {criterios.objetivoLabel}</li> : null}
                  {criterios.categorias.length ? (
                    <li>Categorías consideradas: {criterios.categorias.join(", ")}</li>
                  ) : null}
                  <li>Orden por disponibilidad y precio — sin IA médica</li>
                  {criterios.notas.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/50 text-xs">Cargando criterios...</p>
              )}
            </GlassCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[2rem] h-80 animate-pulse bg-white/5 border border-white/10"
                    />
                  ))
                : null}
              {!loading && items.length === 0 ? (
                <p className="text-white/50 text-sm col-span-full text-center py-8">
                  Aún no hay recomendaciones. Completa tu perfil o explora el catálogo.
                </p>
              ) : null}
              {!loading &&
                items.slice(0, 3).map((s) => (
                  <RecommendedProductCard
                    key={s.id}
                    id={s.id}
                    nombre={s.nombre}
                    descripcion={s.descripcion}
                    precio={s.precio}
                    imagenUrl={s.imagen_url}
                    categoriaLabel={s.categoriaNombre ?? s.categoriaSlug ?? "Recomendado"}
                  />
                ))}
            </div>
          </section>
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
