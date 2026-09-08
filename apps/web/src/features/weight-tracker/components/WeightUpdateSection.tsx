"use client";

import { useCallback, useEffect, useState } from "react";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import WeightHistoryPanel from "./WeightHistoryPanel";
import NumericInput from "@/shared/components/NumericInput";
import type { PesoRowRaw } from "../utils/weightHistory";

type Props = {
  token: string;
  pesoActual: number;
  onUpdated: (peso: number) => void;
};

export default function WeightUpdateSection({ token, pesoActual, onUpdated }: Props) {
  const [nuevoPeso, setNuevoPeso] = useState(pesoActual);
  const [prevPesoActual, setPrevPesoActual] = useState(pesoActual);
  if (pesoActual !== prevPesoActual) {
    setPrevPesoActual(pesoActual);
    setNuevoPeso(pesoActual);
  }
  const [historial, setHistorial] = useState<PesoRowRaw[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadHistorial = useCallback(async () => {
    setLoadingHist(true);
    try {
      const data = await apiFetch<{ historial: PesoRowRaw[] }>("/api/tracking/peso", { token });
      setHistorial(data.historial);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHist(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadHistorial();
    });
    return () => {
      active = false;
    };
  }, [loadHistorial]);

  async function handleRegistrarPeso(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await apiFetch("/api/tracking/peso", {
        method: "POST",
        token,
        body: { peso: nuevoPeso },
      });
      const data = await apiFetch<{ historial: PesoRowRaw[] }>("/api/tracking/peso", { token });
      setHistorial(data.historial);
      onUpdated(nuevoPeso);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar peso");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="rounded-[2.5rem] border-[#baff2e]/20 bg-[#070a09]/95 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h2 className="text-white font-bold text-2xl">Actualizar peso</h2>
            <p className="text-white/50 text-sm mt-1 max-w-lg">
              Registra tu peso de hoy. Se actualizará tu perfil y aparecerá en el historial del dashboard
              con la variación respecto al registro anterior y al peso inicial.
            </p>
          </div>
          <div className="rounded-2xl bg-[#baff2e]/10 border border-[#baff2e]/30 px-5 py-3 shrink-0">
            <div className="text-[#baff2e] text-[9px] font-black uppercase tracking-widest">Peso en perfil</div>
            <div className="text-white font-black text-3xl mt-1">
              {pesoActual.toFixed(1)} <span className="text-base text-white/40">kg</span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl mb-4 text-xs">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="text-[#baff2e] bg-[#baff2e]/10 border border-[#baff2e]/20 p-3 rounded-xl mb-4 text-xs">
            Peso registrado. Revisa el historial en tu dashboard.
          </div>
        ) : null}

        <form onSubmit={handleRegistrarPeso} className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
          <label className="flex-1 flex flex-col gap-2 w-full">
            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">
              Nuevo peso (kg)
            </span>
            <NumericInput
              value={nuevoPeso}
              onChange={setNuevoPeso}
              min={20}
              max={300}
              allowDecimal
              required
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-[#baff2e]/50 transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#baff2e] hover:bg-[#a3e622] disabled:opacity-50 text-black px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(186,255,46,0.15)]"
          >
            {saving ? "Guardando..." : "Registrar peso de hoy"}
          </button>
        </form>
      </GlassCard>

      {!loadingHist && historial.length > 0 ? (
        <WeightHistoryPanel
          historial={historial}
          pesoActual={pesoActual}
          showChart={false}
          linkToProfile={false}
          compact
        />
      ) : null}
    </div>
  );
}
