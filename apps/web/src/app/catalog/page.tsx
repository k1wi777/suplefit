"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";
import { addToCart } from "@/features/cart";

type Supplement = {
  id: number;
  nombre: string;
  descripcion: string;
  beneficios: string | null;
  imagen_url: string | null;
  precio: string;
  stock: number;
  categoriaNombre?: string;
  categoriaSlug?: string;
};

const CATEGORY_FILTERS: Array<{ label: string; slug: string }> = [
  { label: "Todas", slug: "" },
  { label: "Creatinas", slug: "creatina" },
  { label: "Proteínas", slug: "whey-protein" },
  { label: "Gainer", slug: "mass-gainer" },
  { label: "Soporte nutricional", slug: "soporte-nutricional" },
  { label: "Recovery", slug: "electrolitos" },
  { label: "Pre-entrenos", slug: "pre-entrenos" },
];

export default function CatalogPage() {
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [search, setSearch] = useState("");

  const [items, setItems] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (categorySlug) params.set("categorySlug", categorySlug);
    if (search.trim()) params.set("search", search.trim());
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [categorySlug, search]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError(null);
      }
    });
    apiFetch<{ items: Supplement[] }>(`/api/supplements${qs}`)
      .then((data) => {
        if (active) setItems(data.items);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Error al cargar catálogo");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [qs]);

  return (
    <main className="flex-1 px-4 py-10 w-full min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Glow effects de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#baff2e]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10 flex flex-col gap-10">
        
        {/* Header y Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-fade-in-up">
          <div className="max-w-xl">
            <h1 className="text-white font-black text-4xl md:text-5xl tracking-tight leading-none mb-3">
              Ecosistema de <br/> <span className="neon-text">Suplementos</span>
            </h1>
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              Complementos deportivos por función: recuperación, proteína, energía y soporte nutricional. Lenguaje responsable y sin promesas médicas.
            </p>
          </div>

          <div className="flex w-full lg:w-auto items-center gap-3">
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-full text-white pl-12 pr-4 py-3.5 outline-none focus:bg-white/10 focus:border-[#baff2e]/40 transition-all text-sm"
                placeholder="Buscar ingrediente, producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="h-12 px-6 rounded-full neon-btn text-sm font-bold uppercase tracking-wide shrink-0">
              Go
            </button>
          </div>
        </div>

        {/* Featured Stack (Mock Visual) */}
        {!categorySlug && !search && (
          <div className="w-full rounded-[2rem] border border-white/10 relative overflow-hidden bg-black card-hover animate-fade-in-up animation-delay-100 flex flex-col md:flex-row items-center">
            <div className="absolute inset-0 z-0">
               <div className="absolute top-1/2 left-1/2 -transform-x-1/2 -transform-y-1/2 w-[80%] h-[80%] bg-[#baff2e]/10 blur-[100px] rounded-full pointer-events-none"></div>
            </div>
            <div className="p-8 md:p-12 z-10 md:w-1/2 flex flex-col items-start justify-center">
               <div className="px-3 py-1 rounded-sm bg-[#baff2e] text-black text-[10px] font-black uppercase tracking-widest mb-4">
                 Featured Stack
               </div>
               <h2 className="text-white text-3xl md:text-5xl font-black mb-4">Elite Stack 2024</h2>
               <p className="text-white/70 text-sm mb-8 leading-relaxed max-w-md">
                 El protocolo definitivo para la hipertrofia muscular y la recuperación neuronal. Presenta Neo-Form Whey, Creatina micronizada y Nitro-Pump.
               </p>
               <button className="glass rounded-full px-6 py-3 text-white text-sm font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all">
                 Ver Detalles
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
               </button>
            </div>
            <div className="md:w-1/2 h-64 md:h-full min-h-[300px] relative z-10 w-full flex items-center justify-center px-4 overflow-hidden">
               {/* Gráfico representativo o imagen conceptual (Mock) */}
               <div className="absolute w-[120%] h-[200%] border-[0.5px] border-[#baff2e]/20 rotate-[35deg] pointer-events-none"></div>
               <div className="absolute w-[120%] h-[200%] border-[0.5px] border-[#baff2e]/20 -rotate-[35deg] pointer-events-none"></div>
               
               <div className="relative text-[#baff2e]/40 font-black text-6xl rotate-[-10deg] select-none">
                 PRO <br/> PROTEIN
               </div>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="animate-fade-in-up animation-delay-200">
          <h3 className="text-white font-bold text-xl mb-4">Selección de Categoría</h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {CATEGORY_FILTERS.map((c) => {
              const isActive = (categorySlug === c.slug) || (!categorySlug && c.slug === "");
              return (
                <button
                  key={c.label}
                  type="button"
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-[#baff2e] text-black shadow-[0_0_15px_rgba(186,255,46,0.3)]"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => setCategorySlug(c.slug)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <div className="text-red-400 font-semibold bg-red-400/10 border border-red-400/20 rounded-xl p-4 animate-fade-in-up">{error}</div> : null}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up animation-delay-300">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-[2rem] p-5 h-80 animate-pulse bg-white/5"></div>
            ))
          ) : null}

          {!loading && items.length === 0 ? (
            <div className="text-white/60 col-span-full text-center py-10 bg-white/5 border border-white/10 rounded-2xl">
              No se encontraron productos para los criterios actuales.
            </div>
          ) : null}

          {!loading && items.map((s) => (
            <div
              key={s.id}
              className="glass rounded-3xl p-5 border border-white/10 hover:border-white/30 transition-all duration-500 group flex flex-col relative"
            >
              <Link href={`/supplements/${s.id}`} className="flex flex-col flex-1">
                <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-black/80 to-white/5 border border-white/5 overflow-hidden flex items-center justify-center relative">
                  {s.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imagen_url} alt={s.nombre} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="text-white/20 text-xs font-bold uppercase tracking-widest">Sin Imagen</div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-black/60 text-[#baff2e] backdrop-blur-md border border-[#baff2e]/30">
                    {s.categoriaNombre ?? s.categoriaSlug ?? "Complemento"}
                  </div>
                </div>
                <div className="mt-5 flex-1">
                  <h3 className="text-white font-black text-lg leading-tight mb-2 group-hover:text-[#baff2e] transition-colors">{s.nombre}</h3>
                  <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">{s.descripcion}</p>
                </div>
              </Link>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-white font-medium text-lg">${Number(s.precio).toFixed(2)}</div>
                <button
                  type="button"
                  disabled={s.stock <= 0}
                  className="h-9 w-9 rounded-full neon-btn flex items-center justify-center text-xl font-light hover:scale-110 transition-transform cursor-pointer shadow-lg pb-0.5 disabled:opacity-40"
                  onClick={() =>
                    addToCart({
                      supplementId: s.id,
                      nombre: s.nombre,
                      precio: Number(s.precio),
                      imagenUrl: s.imagen_url,
                    })
                  }
                  aria-label={`Agregar ${s.nombre} al carrito`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Science Footer Card */}
        <div className="mt-10 mb-10 w-full glass rounded-[2rem] p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center gap-8 md:gap-16 animate-fade-in-up animation-delay-400">
          <div className="md:w-1/2">
            <h2 className="text-white text-2xl md:text-3xl font-black mb-4">
              La Ciencia de <span className="text-[#baff2e]">SupleFit</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Cada miligramo se contabiliza. No creemos en &apos;mezclas patentadas&apos; confusas. Creemos en la transparencia radical y en dosis clínicas con base científica verificada.
            </p>
            <div className="flex flex-col gap-4">
               <div className="flex items-start gap-4">
                 <div className="text-[#baff2e] mt-1">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                 </div>
                 <div>
                   <div className="text-white font-bold text-sm">Testado y Certificado por Laboratorio</div>
                   <div className="text-white/50 text-xs mt-0.5">Verificado por terceros en pureza y ausencia de sustancias prohibidas.</div>
                 </div>
               </div>
            </div>
          </div>
          <div className="md:w-1/2 w-full glass-strong rounded-2xl p-6 border-white/5">
             <div className="text-[#baff2e] text-[10px] font-black uppercase tracking-widest mb-6">Métricas Reales de Rendimiento</div>
             
             <div className="mb-4">
               <div className="flex justify-between text-white text-sm font-semibold mb-2">
                 <span>Ganancia de Fuerza Promedio</span>
                 <span className="text-[#baff2e]">+24%</span>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#baff2e] w-[24%]"></div>
               </div>
             </div>

             <div className="mb-4">
               <div className="flex justify-between text-white text-sm font-semibold mb-2">
                 <span>Reducción Ventana de Recuperación</span>
                 <span className="text-[#baff2e]">-40%</span>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#baff2e] w-[60%]"></div>
               </div>
             </div>

             <div>
               <div className="flex justify-between text-white text-sm font-semibold mb-2">
                 <span>Intensidad de Enfoque Cognitivo</span>
                 <span className="text-[#baff2e]">+18%</span>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-[#baff2e] w-[18%]"></div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}
