"use client";

import type { ReactNode } from "react";
import DisclaimerBanner from "@/shared/components/DisclaimerBanner";
import type { ParsedLine } from "../utils/parseSupplementText";

type Props = {
  benefits: ParsedLine[];
  protocol: ParsedLine[];
  warnings: ParsedLine[];
};

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-11 w-11 rounded-full border border-[#baff2e]/40 bg-[#baff2e]/10 flex items-center justify-center text-[#baff2e] shrink-0 shadow-[0_0_20px_rgba(186,255,46,0.12)]">
      {children}
    </div>
  );
}

function isCriticalWarning(title: string): boolean {
  const t = title.toLowerCase();
  return /dosis|límite|limite|exceder|no sustituye|medicación|medicacion|embaraz|lactan|menor/.test(t);
}

/** Panel con gradiente spotlight (referencia) — sin clase .glass para no tapar el fondo */
function PanelCard({
  children,
  className = "",
  gradientClass,
}: {
  children: ReactNode;
  className?: string;
  gradientClass: string;
}) {
  return (
    <div
      className={`rounded-[1.75rem] md:rounded-[2rem] p-7 md:p-9 border backdrop-blur-xl relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] ${gradientClass} ${className}`}
    >
      {children}
    </div>
  );
}

const WARNING_ICONS = [
  // médico / general
  <svg key="med" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 6v12M6 12h12" />
  </svg>,
  // alerta
  <svg key="warn" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>,
  // prohibido / límite
  <svg key="limit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93l14.14 14.14" />
  </svg>,
  // info
  <svg key="info" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>,
];

export default function SupplementDetailPanels({ benefits, protocol, warnings }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-20 relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Beneficios — grid plano estilo referencia */}
        <PanelCard
          className="lg:col-span-8 border-[#baff2e]/12"
          gradientClass="panel-gradient-benefits"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#baff2e]/15 blur-[100px] rounded-full pointer-events-none" />
          <header className="flex items-center gap-3 mb-8 relative z-10">
            <SectionIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </SectionIcon>
            <h2 className="text-white font-black text-xl md:text-2xl tracking-tight uppercase">
              Beneficios
            </h2>
          </header>

          {benefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
              {benefits.map((b, i) => (
                <article key={i} className="min-w-0">
                  <h3 className="text-[#baff2e] text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] mb-2.5 leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">{b.desc}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-white/45 text-sm relative z-10">Información en actualización.</p>
          )}
        </PanelCard>

        {/* Protocolo — timeline vertical con línea punteada */}
        <PanelCard className="lg:col-span-4 border-white/[0.08]" gradientClass="panel-gradient-protocol">
          <div className="absolute left-0 top-0 w-full h-24 bg-gradient-to-b from-[#baff2e]/[0.07] to-transparent pointer-events-none" />
          <header className="flex items-center gap-3 mb-8 relative z-10">
            <SectionIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </SectionIcon>
            <h2 className="text-white font-black text-xl tracking-tight uppercase">Protocolo</h2>
          </header>

          {protocol.length > 0 ? (
            <ol className="relative z-10 flex flex-col gap-0 pl-1">
              <div
                className="absolute left-[19px] top-5 bottom-5 w-px border-l border-dashed border-[#baff2e]/25"
                aria-hidden
              />
              {protocol.map((p, i) => (
                <li key={i} className="flex gap-4 pb-7 last:pb-0 relative">
                  <div className="relative z-10 shrink-0 h-10 w-10 rounded-full border-2 border-[#baff2e]/50 bg-[#0a0a0a] flex items-center justify-center text-[#baff2e] text-[11px] font-black tracking-wider shadow-[0_0_12px_rgba(186,255,46,0.15)]">
                    {p.step ?? String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="pt-0.5 min-w-0">
                    <h3 className="text-white font-black text-[11px] uppercase tracking-widest mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-white/45 text-xs leading-relaxed">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-white/45 text-sm relative z-10">Consulta la etiqueta del fabricante.</p>
          )}
        </PanelCard>
      </div>

      {/* Seguridad — sub-cards horizontales anidadas */}
      <PanelCard
        className="mt-5 lg:mt-6 border-white/[0.08]"
        gradientClass="panel-gradient-safety"
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 w-48 h-48 bg-red-500/10 blur-[90px] rounded-full pointer-events-none" />
        <header className="flex items-center gap-3 mb-7 relative z-10">
          <div className="h-11 w-11 rounded-full border border-red-400/30 bg-red-500/10 flex items-center justify-center text-red-300 shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-white font-black text-xl md:text-2xl tracking-tight uppercase">
            Seguridad y restricciones
          </h2>
        </header>

        {warnings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
            {warnings.map((w, i) => {
              const critical = isCriticalWarning(w.title);
              const icon = WARNING_ICONS[i % WARNING_ICONS.length];
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-5 border transition-colors flex flex-col items-center text-center min-h-[140px] relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
                    critical
                      ? "border-red-400/20 panel-subcard-alert"
                      : "border-white/[0.06] panel-subcard-lime hover:border-[#baff2e]/25"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center mb-4 border ${
                      critical
                        ? "border-red-400/40 bg-red-500/15 text-red-300"
                        : "border-white/15 bg-white/5 text-white/50"
                    }`}
                  >
                    {icon}
                  </div>
                  <h3
                    className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 leading-snug ${
                      critical ? "text-red-400" : "text-white/90"
                    }`}
                  >
                    {w.title}
                  </h3>
                  <p className="text-white/45 text-xs leading-relaxed">{w.desc}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white/45 text-sm relative z-10">
            Sigue las indicaciones del envase y consulta a un profesional si tienes condiciones de salud.
          </p>
        )}
      </PanelCard>

      <div className="mt-6">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}
