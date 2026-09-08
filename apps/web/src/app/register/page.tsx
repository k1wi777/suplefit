"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/shared/components/GlassCard";
import DisclaimerBanner from "@/shared/components/DisclaimerBanner";
import NumericInput from "@/shared/components/NumericInput";
import { GuestOnly } from "@/features/auth";
import { apiFetch } from "@/shared/lib/api";

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

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#baff2e]/60 focus:ring-2 focus:ring-[#baff2e]/10";
const selectClass = `${fieldClass} [&>option]:bg-[#111]`;

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
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(186,255,46,0.12),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(92,255,188,0.08),transparent_28%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <GlassCard className="overflow-hidden border border-[#baff2e]/20 bg-black/45 p-0 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
            <div className="border-b border-white/10 px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#baff2e]">
                <span className="h-2 w-2 rounded-full bg-[#baff2e] shadow-[0_0_14px_rgba(186,255,46,0.9)]" />
                Tu punto de partida
              </div>
              <div className="mt-4 max-w-2xl">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Crea tu cuenta SupleFit</h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                  Personaliza tu experiencia de bienestar y recibe recomendaciones orientativas según tus objetivos.
                </p>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
                {[
                  ["01", "Conoce tu perfil", "Datos básicos para comenzar."],
                  ["02", "Define tu meta", "Elige el objetivo que te mueve."],
                  ["03", "Avanza a tu ritmo", "Consulta tu progreso en un mismo lugar."],
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <span className="text-xs font-black text-[#baff2e]">{number}</span>
                    <p className="mt-2 font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[0.7fr_1.3fr]">
              <aside className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-sm font-bold text-white">¿Para qué usamos tus datos?</p>
                  <ul className="mt-4 space-y-3 text-xs leading-5 text-white/60">
                    <li className="flex gap-3"><span className="text-[#baff2e]">✦</span>Recomendaciones según objetivo y actividad, nunca prescripción médica.</li>
                    <li className="flex gap-3"><span className="text-[#baff2e]">✦</span>IMC y seguimiento personal dentro de tu dashboard.</li>
                    <li className="flex gap-3"><span className="text-[#baff2e]">✦</span>Gestión segura de tus pedidos en la tienda.</li>
                    <li className="flex gap-3"><span className="text-[#baff2e]">✦</span>No vendemos tu información a terceros.</li>
                  </ul>
                </div>
                <DisclaimerBanner compact />
                <p className="mt-auto text-sm text-white/45">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="font-semibold text-[#baff2e] underline decoration-[#baff2e]/40 underline-offset-4 hover:text-white">Inicia sesión</Link>
                </p>
              </aside>

              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
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
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Nombre</span><input className={fieldClass} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} autoComplete="name" required /></label>
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Correo</span><input className={fieldClass} value={form.correo} onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))} type="email" autoComplete="email" required /></label>
                <label className="flex flex-col gap-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Contraseña</span><input className={fieldClass} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} type="password" autoComplete="new-password" required /></label>
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Sexo</span><select className={selectClass} value={form.sexo} onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value as "M" | "F" | "Otro" }))}><option value="M">M</option><option value="F">F</option><option value="Otro">Otro</option></select></label>
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Edad</span><NumericInput className={fieldClass} value={form.edad} onChange={(edad) => setForm((p) => ({ ...p, edad }))} min={10} max={120} allowDecimal={false} required /></label>
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Peso <span className="normal-case text-white/35">(kg)</span></span><NumericInput className={fieldClass} value={form.peso} onChange={(peso) => setForm((p) => ({ ...p, peso }))} min={20} max={300} required /></label>
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Altura <span className="normal-case text-white/35">(m)</span></span><NumericInput className={fieldClass} value={form.altura} onChange={(altura) => setForm((p) => ({ ...p, altura }))} min={0.8} max={2.5} required /></label>
                <label className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Nivel de actividad</span><select className={selectClass} value={form.nivelActividad} onChange={(e) => setForm((p) => ({ ...p, nivelActividad: e.target.value }))} required>{NIVELES.map((nivel) => <option key={nivel.value} value={nivel.value}>{nivel.label}</option>)}</select></label>
                <label className="flex flex-col gap-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-wider text-white/55">Objetivo físico</span><select className={selectClass} value={form.objetivo} onChange={(e) => setForm((p) => ({ ...p, objetivo: e.target.value }))}>{OBJETIVOS.map((objetivo) => <option key={objetivo.value} value={objetivo.value}>{objetivo.label}</option>)}</select></label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:col-span-2">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[#baff2e]" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} required />
                  <span className="text-xs leading-5 text-white/60">Acepto el tratamiento de mis datos según la <Link href="/privacidad" className="text-[#baff2e] underline" target="_blank">política de privacidad</Link> y los <Link href="/terminos" className="text-[#baff2e] underline" target="_blank">términos de uso</Link>.</span>
                </label>
                {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200 sm:col-span-2" role="alert">{error}</div> : null}
                <button disabled={loading || !consentimiento} className={`mt-1 rounded-xl px-4 py-3.5 font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#baff2e] sm:col-span-2 ${consentimiento && !loading ? "neon-btn cursor-pointer" : "cursor-not-allowed border border-white/10 bg-white/10 text-white/35"}`} type="submit" aria-disabled={!consentimiento || loading}>{loading ? "Creando cuenta..." : "Crear mi cuenta"}</button>
              </form>
            </div>
          </GlassCard>
        </div>
      </main>
    </GuestOnly>
  );
}
