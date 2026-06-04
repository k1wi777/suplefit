"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { useParams, useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { parseMultilineField } from "@/lib/parseSupplementText";
import SupplementDetailPanels from "@/components/SupplementDetailPanels";

type Supplement = {
  id: number;
  nombre: string;
  descripcion: string;
  beneficios: string | null;
  modo_uso: string | null;
  advertencias: string | null;
  imagen_url: string | null;
  categoriaNombre?: string;
  categoriaSlug?: string;
  precio: string;
  stock: number;
};

export default function SupplementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idValue = params.id as string;
  const [added, setAdded] = useState(false);
  const [item, setItem] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!idValue) return;
      setLoading(true);
      setError(null);
      try {
        const detail = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/supplements/${idValue}`);
        if (!detail.ok) throw new Error(`HTTP ${detail.status}`);
        const data = (await detail.json()) as { item: Supplement };
        if (!alive) return;
        setItem(data.item);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Error al cargar detalle");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [idValue]);

  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "instant",
  });
}, []);

  if (loading) {
    return (
      <main className="flex-1 min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#baff2e] border-t-transparent animate-spin"></div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="flex-1 min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-6 rounded-2xl max-w-md text-center">
          <svg className="w-8 h-8 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error ?? "Suplemento no encontrado."}
        </div>
      </main>
    );
  }

  // Parsear texto del backend si está disponible, sino usar mocks
  const titleParts = item.nombre.split(" ");
  const mainTitle = titleParts[0] || "AERO";
  const subTitle = titleParts.slice(1).join(" ") || "PERFORMANCE";

  const dbBenefits = parseMultilineField(item.beneficios, "Beneficio");
  const dbProtocol = parseMultilineField(item.modo_uso, "Paso");
  const dbWarnings = parseMultilineField(item.advertencias, "Aviso");

  return (
    <main className="flex-1 w-full min-h-screen bg-[#111] relative overflow-hidden">
      
      {/* HERO SECTION */}
      <div className="relative min-h-[85vh] flex items-center pt-24 pb-16">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-black/50 z-10 w-full h-full"></div>
          {item.imagen_url ? (
            <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover object-right opacity-40 blur-sm mix-blend-screen" />
          ) : (
            <div className="w-full h-full bg-[#151515] opacity-80"></div>
          )}
        </div>

        {/* Large Decorative Text (Background) */}
        <div className="absolute top-1/2 left-[40%] transform -translate-y-1/2 -translate-x-1/2 opacity-[0.03] select-none pointer-events-none z-0">
          <span className="text-[250px] font-black tracking-tighter text-white whitespace-nowrap">{mainTitle}</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-20 flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <div className="flex-1 md:pr-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-6">
               <span className={`h-2 w-2 rounded-full ${item.stock > 0 ? "bg-[#baff2e] shadow-[0_0_8px_rgba(186,255,46,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`}></span>
               <span className="text-[10px] text-white font-bold uppercase tracking-widest leading-none">
                 {item.categoriaNombre ?? item.categoriaSlug ?? "Premium Protocol"}
               </span>
            </div>

            <h1 className="text-white font-black text-6xl md:text-8xl tracking-tight leading-[0.9] mb-6">
              {mainTitle} <br/>
              <span className="text-[#baff2e]">{subTitle}</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              {item.descripcion}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
               <button
                 type="button"
                 disabled={item.stock <= 0}
                 className="bg-[#baff2e] hover:bg-[#a3e622] disabled:opacity-50 text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(186,255,46,0.3)]"
                 onClick={() => {
                   addToCart({
                     supplementId: item.id,
                     nombre: item.nombre,
                     precio: Number(item.precio),
                     imagenUrl: item.imagen_url,
                   });
                   setAdded(true);
                   setTimeout(() => setAdded(false), 2000);
                 }}
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                 {added ? "Agregado ✓" : `Agregar al carrito — $${Number(item.precio).toFixed(2)}`}
               </button>
               <button
                 type="button"
                 className="bg-transparent border border-white/20 hover:border-white/50 text-white hover:bg-white/5 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                 onClick={() => router.push("/cart")}
               >
                 Ver carrito
               </button>
            </div>
          </div>

          {/* Product Image Focus & Info Pills */}
          <div className="hidden md:flex flex-1 relative items-center justify-center translate-y-10">
              {item.imagen_url && (
                <img src={item.imagen_url} alt={item.nombre} className="max-h-[600px] w-auto drop-shadow-2xl z-20 relative animate-fade-in-up animation-delay-200 object-contain mix-blend-normal" />
              )}
              
              {/* Floating Info Pills */}
              <div className="absolute right-0 bottom-10 z-30 flex flex-col gap-3">
                 <GlassCard className="p-4 px-6 backdrop-blur-xl bg-black/40 border-white/10 min-w-[200px] transform translate-x-10 animate-fade-in-up animation-delay-300">
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-widest">Inventory Status</div>
                    <div className="text-white font-bold text-lg mt-1">{item.stock > 0 ? `${item.stock} Units Available` : 'Out of Stock'}</div>
                 </GlassCard>
                 <GlassCard className="p-4 px-6 backdrop-blur-xl bg-black/40 border-white/10 min-w-[200px] animate-fade-in-up animation-delay-400">
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-widest">Price</div>
                    <div className="text-[#baff2e] font-bold text-lg mt-1">${Number(item.precio).toFixed(2)} USD</div>
                 </GlassCard>
              </div>
          </div>
        </div>
      </div>

      <SupplementDetailPanels
        benefits={dbBenefits}
        protocol={dbProtocol}
        warnings={dbWarnings}
      />
    </main>
  );
}
