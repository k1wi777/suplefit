"use client";

import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import WeightDeltaBadge from "@/components/WeightDeltaBadge";
import {
  enrichPesoHistorial,
  formatPesoDate,
  formatPesoTime,
  getChartPointsByDay,
  getPesoInicial,
  getPesoUltimoHistorial,
  groupPesoByDay,
  type PesoRowRaw,
} from "@/lib/weightHistory";

type Props = {
  historial: PesoRowRaw[];
  pesoActual: number | null;
  showChart?: boolean;
  linkToProfile?: boolean;
  compact?: boolean;
};

export default function WeightHistoryPanel({
  historial,
  pesoActual,
  showChart = true,
  linkToProfile = true,
  compact = false,
}: Props) {
  const enriched = enrichPesoHistorial(historial);
  const groups = groupPesoByDay(enriched);
  const pesoInicio = getPesoInicial(enriched);
  const pesoUltimoHist = getPesoUltimoHistorial(enriched);
  const pesoActualMostrado = pesoUltimoHist ?? pesoActual;
  const chartPoints = getChartPointsByDay(groups);
  const deltaTotal =
    pesoActualMostrado != null && pesoInicio != null
      ? Math.round((pesoActualMostrado - pesoInicio) * 10) / 10
      : null;
  const totalEntries = enriched.length;

  return (
    <GlassCard className={compact ? "p-5" : "p-6"}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-white font-bold text-lg">Historial de peso</h2>
          <p className="text-white/50 text-xs mt-1">
            {totalEntries > 0
              ? `${totalEntries} registro${totalEntries !== 1 ? "s" : ""} · agrupados por día`
              : "Comparación desde tu primer registro"}
          </p>
        </div>
        {linkToProfile ? (
          <Link
            href="/profile"
            className="text-[#baff2e] text-[10px] font-black uppercase tracking-widest hover:underline shrink-0"
          >
            Actualizar peso
          </Link>
        ) : null}
      </div>

      {pesoActualMostrado != null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-white/5 border border-[#baff2e]/20 p-4">
            <div className="text-[#baff2e] text-[9px] font-black uppercase tracking-widest">Peso actual</div>
            <div className="text-white font-black text-2xl mt-1">
              {pesoActualMostrado.toFixed(1)} <span className="text-sm text-white/40">kg</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-white/50 text-[9px] font-black uppercase tracking-widest">Peso inicial</div>
            <div className="text-white font-black text-2xl mt-1">
              {pesoInicio != null ? (
                <>
                  {pesoInicio.toFixed(1)} <span className="text-sm text-white/40">kg</span>
                </>
              ) : (
                "—"
              )}
            </div>
            <p className="text-white/40 text-[10px] mt-1">Primer registro guardado</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col justify-center">
            <div className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-2">
              Cambio total
            </div>
            <WeightDeltaBadge delta={deltaTotal} size="md" variant="total" />
          </div>
        </div>
      )}

      {totalEntries === 0 ? (
        <p className="text-white/40 text-sm">
          Sin registros aún.{" "}
          {linkToProfile ? (
            <Link href="/profile" className="text-[#baff2e] underline">
              Registra tu peso en Perfil
            </Link>
          ) : (
            "Usa el formulario de arriba para el primer registro."
          )}
        </p>
      ) : (
        <>
          {totalEntries === 1 ? (
            <p className="text-white/50 text-xs mb-4 border border-white/10 rounded-lg p-3 bg-white/[0.02]">
              Tienes un solo registro. Añade otro peso (hoy u otro día) para ver la evolución con flechas de
              subida o bajada.
            </p>
          ) : null}

          {showChart && chartPoints.length > 1 ? (
            <div className="flex items-end gap-2 h-28 mb-6 px-1">
              {chartPoints.slice(-7).map((point) => {
                const slice = chartPoints.slice(-7);
                const max = Math.max(...slice.map((p) => p.peso));
                const min = Math.min(...slice.map((p) => p.peso));
                const range = max - min || 1;
                const h = ((point.peso - min) / range) * 80 + 20;
                const isLast = point.fecha === slice[slice.length - 1].fecha;
                return (
                  <div key={point.fecha} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-sm ${isLast ? "bg-[#baff2e]" : "bg-[#baff2e]/50"}`}
                      style={{ height: `${h}%` }}
                      title={`${point.peso} kg`}
                    />
                    <span className="text-[8px] text-white/40">{point.fecha.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.fecha} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                  <span className="text-white font-bold text-sm">{formatPesoDate(group.fecha)}</span>
                  <div className="flex items-center gap-2">
                    {group.entries.length > 1 ? (
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#baff2e] bg-[#baff2e]/10 px-2 py-0.5 rounded-full border border-[#baff2e]/30">
                        {group.entries.length} registros
                      </span>
                    ) : null}
                    {group.pesoMin !== group.pesoMax ? (
                      <span className="text-white/40 text-[10px]">
                        {group.pesoMin.toFixed(1)}–{group.pesoMax.toFixed(1)} kg
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col divide-y divide-white/5">
                  {[...group.entries].reverse().map((entry) => (
                    <div
                      key={`${entry.registradoEn}-${entry.createdAt}-${entry.id ?? entry.peso}`}
                      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                        entry.isLatest ? "bg-[#baff2e]/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${
                            entry.isLatest
                              ? "bg-[#baff2e]/20 border-[#baff2e]/40 text-[#baff2e]"
                              : "bg-white/5 border-white/10 text-white/60"
                          }`}
                        >
                          {entry.deltaPrev != null && entry.deltaPrev > 0 ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                          ) : entry.deltaPrev != null && entry.deltaPrev < 0 ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                          ) : (
                            <span className="text-[10px]">=</span>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">
                            {entry.peso.toFixed(1)} kg
                            {entry.isLatest ? (
                              <span className="ml-2 text-[9px] font-black uppercase text-[#baff2e]">
                                Último
                              </span>
                            ) : null}
                            {entry.isStart ? (
                              <span className="ml-2 text-[9px] font-black uppercase text-white/40">Inicio</span>
                            ) : null}
                          </div>
                          <div className="text-white/40 text-xs">
                            {group.entries.length > 1 ? formatPesoTime(entry.createdAt) : "Registro del día"}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!entry.isLatest ? (
                          <WeightDeltaBadge
                            delta={entry.deltaPrev}
                            label="vs anterior"
                            variant="prev"
                          />
                        ) : null}
                        {!entry.isStart ? (
                          <WeightDeltaBadge
                            delta={entry.deltaStart}
                            label="vs inicio"
                            variant="start"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}
