"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/token";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
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
            const data = await apiFetch<{ token: string }>("/api/auth/login", {
              method: "POST",
              body: { correo, password },
            });
            setToken(data.token);
            const dest = nextPath.startsWith("/") ? nextPath : "/dashboard";
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
          <input
            className="rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 outline-none focus:border-emerald-400/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
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
