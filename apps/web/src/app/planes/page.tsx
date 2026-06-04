import Link from "next/link";
import GlassCard from "@/components/GlassCard";

const PLANES = [
  {
    titulo: "Tienda de suplementos",
    desc: "Catálogo con carrito y pedidos pendientes. Compra responsable con información clara de cada producto.",
    estado: "Disponible",
    activo: true,
  },
  {
    titulo: "Seguimiento premium",
    desc: "Historial ampliado, alertas de hábitos, informes semanales y recomendaciones con más variables.",
    estado: "Próximamente",
    activo: false,
  },
  {
    titulo: "Alianzas profesionales",
    desc: "Conexión con gimnasios, entrenadores y nutricionistas para planes supervisados.",
    estado: "Próximamente",
    activo: false,
  },
];

export default function PlanesPage() {
  return (
    <main className="flex-1 px-4 py-12 bg-[#050505] min-h-screen">
      <div className="mx-auto max-w-4xl flex flex-col gap-8">
        <div>
          <h1 className="text-white font-black text-4xl">Planes SupleFit</h1>
          <p className="text-white/60 mt-2 text-sm">
            Tres líneas para hacer sostenible el proyecto: tienda, seguimiento personalizado y red de profesionales.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANES.map((p) => (
            <GlassCard
              key={p.titulo}
              className={`p-6 border ${p.activo ? "border-[#baff2e]/30" : "border-white/10"}`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  p.activo ? "text-[#baff2e]" : "text-white/40"
                }`}
              >
                {p.estado}
              </span>
              <h2 className="text-white font-bold text-lg mt-3">{p.titulo}</h2>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{p.desc}</p>
            </GlassCard>
          ))}
        </div>

        <Link href="/catalog" className="neon-btn rounded-full px-8 py-3 text-sm font-bold w-fit">
          Explorar catálogo
        </Link>
      </div>
    </main>
  );
}
