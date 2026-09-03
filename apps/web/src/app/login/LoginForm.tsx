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
    <GlassCard className="w-full max-w-md relative z-10 border border-lime-300/20">
      <h1 className="text-white font-black text-2xl">Iniciar sesión</h1>
      <p className="text-white/60 mt-2 text-sm">Accede a tu dashboard, pedidos y recomendaciones.</p>

      <form
        className="mt-6 flex flex-col gap-4"
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
          <span className="text-white/70 text-sm">Correo</span>
          <input
            className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            type="email"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-white/70 text-sm">Contraseña</span>
          <div className="relative">
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 pr-12 outline-none focus:border-emerald-400/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
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

        {error ? <div className="text-red-300 text-sm">{error}</div> : null}

        <button disabled={loading} className="mt-2 rounded-xl neon-btn px-4 py-3 transition" type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="text-white/60 text-sm flex justify-between items-center">
          <a className="hover:text-white transition" href="/register">
            Crear cuenta
          </a>
          <a className="hover:text-white transition" href="/catalog">
            Ver catálogo
          </a>
        </div>
      </form>
    </GlassCard>
  );
}
