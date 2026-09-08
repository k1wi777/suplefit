"use client";

import Link from "next/link";
import { AuthenticatedOnly } from "@/features/auth";
import GlassCard from "@/shared/components/GlassCard";

const PLANES = [
  {
    numero: "01",
    titulo: "Tienda de suplementos",
    desc: "Catálogo con carrito y pedidos pendientes para elegir suplementos con información clara y compra responsable.",
    estado: "Disponible",
    activo: true,
    detalle: "Explora productos y gestiona tus pedidos",
  },
  {
    numero: "02",
    titulo: "Seguimiento premium",
    desc: "Historial ampliado, alertas de hábitos, informes semanales y recomendaciones con más variables.",
    estado: "Próximamente",
    activo: false,
    detalle: "Más contexto para acompañar tu progreso",
  },
  {
    numero: "03",
    titulo: "Alianzas profesionales",
    desc: "Conexión con gimnasios, entrenadores y nutricionistas para planes supervisados.",
    estado: "Próximamente",
    activo: false,
    detalle: "Acompañamiento experto en un solo lugar",
  },
];

export default function PlanesPage() {
  return (
    <AuthenticatedOnly allowAnonymous>
      <main className="flex-1 px-4 py-12 bg-[#050505] min-h-screen">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <section className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#baff2e]">El ecosistema SupleFit</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">Planes para cada etapa de tu bienestar</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              Conoce las tres líneas que estamos construyendo para acompañarte desde la elección de tus suplementos hasta un seguimiento más completo.
            </p>
          </section>

          <section aria-labelledby="planes-title">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="planes-title" className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">Líneas SupleFit</h2>
              <span className="text-xs text-white/35">Disponible hoy y en desarrollo</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {PLANES.map((plan) => (
                <GlassCard
                  key={plan.titulo}
                  className={`relative flex min-h-[285px] flex-col overflow-hidden border p-6 sm:p-7 ${plan.activo ? "border-[#baff2e]/35 bg-[#baff2e]/[0.06]" : "border-white/10"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-3xl font-black text-white/15">{plan.numero}</span>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${plan.activo ? "border-[#baff2e]/30 bg-[#baff2e]/10 text-[#baff2e]" : "border-white/10 bg-white/[0.03] text-white/45"}`}>
                      {plan.estado}
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xl font-bold tracking-tight text-white">{plan.titulo}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/60">{plan.desc}</p>
                  </div>
                  <p className="mt-auto border-t border-white/10 pt-5 text-xs font-semibold text-white/45">{plan.detalle}</p>
                </GlassCard>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="font-semibold text-white">Empieza por lo que ya está disponible</p>
              <p className="mt-1 text-sm text-white/50">Compra suplementos y consulta tus pedidos desde el catálogo.</p>
            </div>
            <Link href="/catalog" className="neon-btn w-fit rounded-full px-7 py-3 text-sm font-bold">
              Explorar catálogo
            </Link>
          </section>
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
