"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import { getSafeDestination, setToken } from "@/features/auth";

type LoginResponse = {
  token: string;
  user: { isAdmin: boolean };
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <GlassCard className="relative z-10 w-full max-w-md border border-[#baff2e]/20 bg-black/45 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-8">
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#baff2e]"><span className="h-2 w-2 rounded-full bg-[#baff2e] shadow-[0_0_14px_rgba(186,255,46,0.9)]" />Acceso seguro</div>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Iniciar sesión</h1>
      <p className="mt-2 text-sm leading-6 text-white/60">Accede a tu dashboard, pedidos y recomendaciones.</p>

      <form
        className="mt-7 flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          try {
            const data = await apiFetch<LoginResponse>("/api/auth/login", {
              method: "POST",
              body: { correo, password },
            });
            if (!data.token || typeof data.user?.isAdmin !== "boolean") {
              throw new Error("No se pudo validar el rol de la cuenta.");
            }
            setToken(data.token);
            const dest = getSafeDestination(nextPath, data.user.isAdmin ? "admin" : "user");
            router.push(dest);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al iniciar sesión");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/55">Correo</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#baff2e]/60 focus:ring-2 focus:ring-[#baff2e]/10"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/55">Contraseña</span>
          <div className="relative">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-white outline-none transition focus:border-[#baff2e]/60 focus:ring-2 focus:ring-[#baff2e]/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#baff2e]"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M1 1l22 22" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200" role="alert">{error}</div> : null}

        <button disabled={loading} className="mt-1 rounded-xl neon-btn px-4 py-3.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#baff2e] disabled:cursor-not-allowed disabled:opacity-50" type="submit" aria-disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="flex items-center justify-between gap-3 text-sm text-white/60">
          <a className="transition hover:text-[#baff2e]" href="/register">
            Crear cuenta
          </a>
          <a className="transition hover:text-[#baff2e]" href="/catalog">
            Ver catálogo
          </a>
        </div>
      </form>
    </GlassCard>
  );
}
