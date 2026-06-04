"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";
import GuestOnly from "@/components/GuestOnly";
import Link from "next/link";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import NumericInput from "@/components/NumericInput";

const NIVELES = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligera", label: "Actividad ligera" },
  { value: "media", label: "Moderado" },
  { value: "activa", label: "Activo" },
  { value: "muy_activa", label: "Muy activo" },
] as const;

const OBJETIVOS = [
  { value: "ganar_masa_muscular", label: "Ganar masa muscular" },
  { value: "perder_grasa", label: "Perder grasa" },
  { value: "recomposicion_corporal", label: "Recomposición corporal" },
  { value: "resistencia", label: "Resistencia" },
  { value: "definicion", label: "Definición" },
  { value: "rendimiento", label: "Rendimiento deportivo" },
] as const;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    edad: 25,
    peso: 75,
    altura: 1.75,
    sexo: "M" as "M" | "F" | "Otro",
    nivelActividad: "media",
    objetivo: "ganar_masa_muscular",
  });

  const [consentimiento, setConsentimiento] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <GuestOnly>
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-black/75" />
      <GlassCard className="w-full max-w-2xl relative z-10 border border-lime-300/20">
        <h1 className="text-white font-black text-2xl">Registro de usuario</h1>
        <p className="text-white/60 mt-2 text-sm">
          Tus datos nos ayudan a calcular indicadores y sugerir productos de forma orientativa.
        </p>

        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 space-y-2">
          <p className="font-semibold text-white">¿Para qué usamos tus datos?</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Recomendaciones según objetivo y nivel de actividad (no son prescripción médica).</li>
            <li>IMC y seguimiento en tu dashboard.</li>
            <li>Gestión de pedidos si compras en la tienda.</li>
            <li>No vendemos tu información a terceros.</li>
          </ul>
        </div>

        <DisclaimerBanner compact />

        <form
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!consentimiento) return;
            setError(null);
            setLoading(true);
            try {
              await apiFetch("/api/auth/register", {
                method: "POST",
                body: {
                  nombre: form.nombre,
                  correo: form.correo,
                  password: form.password,
                  edad: form.edad,
                  peso: form.peso,
                  altura: form.altura,
                  sexo: form.sexo,
                  nivelActividad: form.nivelActividad,
                  objetivo: form.objetivo,
                  consentimientoDatos: true,
                  politicaVersion: "1.0",
                },
              });
              router.push("/login");
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Error al registrar");
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Nombre</span>
            <input
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Correo</span>
            <input
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.correo}
              onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
              type="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Contraseña</span>
            <input
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              type="password"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Sexo</span>
            <select
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.sexo}
              onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value as any }))}
            >
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Edad</span>
            <NumericInput
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.edad}
              onChange={(edad) => setForm((p) => ({ ...p, edad }))}
              min={10}
              max={120}
              allowDecimal={false}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Peso (kg)</span>
            <NumericInput
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.peso}
              onChange={(peso) => setForm((p) => ({ ...p, peso }))}
              min={20}
              max={300}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Altura (m)</span>
            <NumericInput
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.altura}
              onChange={(altura) => setForm((p) => ({ ...p, altura }))}
              min={0.8}
              max={2.5}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white/70 text-sm">Nivel de actividad</span>
            <select
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.nivelActividad}
              onChange={(e) => setForm((p) => ({ ...p, nivelActividad: e.target.value }))}
              required
            >
              {NIVELES.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-white/70 text-sm">Objetivo físico</span>
            <select
              className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
              value={form.objetivo}
              onChange={(e) => setForm((p) => ({ ...p, objetivo: e.target.value }))}
            >
              {OBJETIVOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-3 sm:col-span-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              required
            />
            <span className="text-white/70 text-sm">
              Acepto el tratamiento de mis datos según la{" "}
              <Link href="/privacidad" className="text-[#baff2e] underline" target="_blank">
                política de privacidad
              </Link>{" "}
              y los{" "}
              <Link href="/terminos" className="text-[#baff2e] underline" target="_blank">
                términos de uso
              </Link>
              .
            </span>
          </label>

          {error ? <div className="text-red-300 text-sm sm:col-span-2">{error}</div> : null}

          <button
            disabled={loading || !consentimiento}
            className={`sm:col-span-2 mt-2 rounded-xl px-4 py-3 transition font-bold ${
              consentimiento && !loading
                ? "neon-btn cursor-pointer"
                : "bg-white/10 text-white/35 border border-white/10 cursor-not-allowed pointer-events-none"
            }`}
            type="submit"
            aria-disabled={!consentimiento || loading}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </GlassCard>
      </main>
    </GuestOnly>
  );
}

