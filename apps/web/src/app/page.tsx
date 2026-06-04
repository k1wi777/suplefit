"use client";

import Link from "next/link";
import GlassCard from "@/components/GlassCard";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-start w-full font-sans">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" 
            alt="Atleta entrenando" 
            className="w-full h-full object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl w-full px-4 pt-20 pb-16">
          <div className="max-w-2xl transform transition-all duration-700 translate-y-0 opacity-100">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong border border-white/10 text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in-up">
              <span className="h-1.5 w-1.5 rounded-full bg-[#baff2e] shadow-[0_0_10px_rgba(186,255,46,0.8)] animate-pulse" />
              Plataforma de acompañamiento fitness
            </div>
            
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-[1.05] animate-fade-in-up animation-delay-100">
              Organiza tu entrenamiento, <br/>
              <span className="neon-text">metas y nutrición.</span>
            </h1>
            
            <p className="mt-6 text-white/70 text-lg md:text-xl max-w-xl leading-relaxed animate-fade-in-up animation-delay-200">
              Más que una tienda: registra objetivos, haz seguimiento de hábitos y recibe sugerencias orientativas de suplementos. Siempre con lenguaje responsable y transparente.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
              <Link
                href="/register"
                className="neon-btn rounded-full px-8 py-4 text-center flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all duration-300"
              >
                Empezar Ahora
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
              <Link
                href="/catalog"
                className="glass rounded-full px-8 py-4 text-center text-white text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Ver catálogo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-[#0a0a0a] relative z-10">
        <div className="mx-auto max-w-6xl px-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-in-up animation-delay-100">
            <div className="max-w-xl">
              <h2 className="text-[#baff2e] text-2xl md:text-3xl font-black uppercase tracking-tight leading-none mb-4">
                Bienestar y rendimiento <br /> progresivo
              </h2>
              <p className="text-white/60 text-sm md:text-base">
                Catálogo de suplementos, dashboard de seguimiento y recomendaciones basadas en tu perfil — sin promesas médicas ni datos inventados.
              </p>
            </div>
            
            <div className="flex gap-8 border-l border-white/10 pl-8">
              <div>
                <div className="text-white text-3xl font-black">3</div>
                <div className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em] mt-1">Pilares</div>
              </div>
              <div>
                <div className="text-white text-3xl font-black text-sm leading-tight max-w-[120px]">Tienda · Seguimiento · Profesionales</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="card-hover flex flex-col justify-between h-full relative overflow-hidden group animate-fade-in-up animation-delay-200">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#baff2e]/10 border border-[#baff2e]/20 flex items-center justify-center text-[#baff2e] mb-6 transition-transform duration-300 group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Seguimiento de hábitos</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Registra entrenamiento, descanso e hidratación. Visualiza tu constancia semanal y el historial de peso en el dashboard.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-[#baff2e] opacity-50 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </GlassCard>

            <GlassCard className="card-hover flex flex-col justify-between h-full relative overflow-hidden group animate-fade-in-up animation-delay-300">
              <div>
                <div className="h-10 w-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mb-6 transition-transform duration-300 group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Recomendaciones claras</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Sugerencias de productos según tu objetivo y nivel de actividad. Explicamos el criterio: sin IA médica ni cajas negras.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-sky-400 opacity-50 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </GlassCard>

            <GlassCard className="card-hover flex flex-col justify-between h-full relative overflow-hidden group animate-fade-in-up animation-delay-400">
              <div>
                <div className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 mb-6 transition-transform duration-300 group-hover:scale-110">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Compra responsable</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Carrito real, pedidos pendientes y categorías con lenguaje prudente. Consulta siempre a un profesional de salud o deporte.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-400 opacity-50 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </GlassCard>

          </div>
        </div>
      </section>
      
      {/* Footer minimalista */}
      <footer className="w-full py-8 bg-[#050505] border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
          <div className="text-white/40 text-xs tracking-widest uppercase font-semibold">
            © 2026 SUPLEFIT. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <Link href="/planes" className="text-white/40 text-xs tracking-widest uppercase font-semibold hover:text-white">
              Ver planes
            </Link>
            <Link href="/privacidad" className="text-white/40 text-xs hover:text-white">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
