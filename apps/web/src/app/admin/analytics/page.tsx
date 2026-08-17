"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/features/admin";
import { apiFetch } from "@/shared/lib/api";
import { clearToken, getToken } from "@/features/auth";

type AdminStats = {
  totalUsuarios: number;
  totalPedidos: number;
  totalSuplementos: number;
  pedidosPendientes: number;
  pedidosConfirmados: number;
  stockTotal: number;
};

function MetricCard({
  title,
  value,
  description,
  accent,
  href,
}: {
  title: string;
  value: string | number;
  description: string;
  accent?: "lime" | "violet" | "amber";
  href?: string;
}) {
  const ring =
    accent === "violet"
      ? "from-violet-500/20"
      : accent === "amber"
        ? "from-amber-500/20"
        : "from-[#baff2e]/20";

  const inner = (
    <div
      className={`panel-gradient-admin-catalog rounded-2xl border border-white/[0.08] p-6 md:p-7 h-full bg-gradient-to-br ${ring} to-transparent transition hover:border-[#baff2e]/25`}
    >
      <p className="text-white/45 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <p className="text-white font-black text-4xl md:text-5xl tracking-tight mt-3">{value}</p>
      <p className="text-white/40 text-sm mt-3 leading-relaxed">{description}</p>
      {href ? (
        <span className="inline-block mt-4 text-[#baff2e] text-xs font-bold uppercase tracking-wide">
          Ver detalle →
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const token = getToken();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<AdminStats>("/api/admin/stats", { token })
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error al cargar estadísticas"))
      .finally(() => setLoading(false));
  }, [token]);

  const confirmRate =
    stats && stats.totalPedidos > 0
      ? Math.round((stats.pedidosConfirmados / stats.totalPedidos) * 100)
      : 0;

  return (
    <AdminShell
      active="analytics"
      title="Estadísticas"
      subtitle="Métricas globales generadas por sp_estadisticas_admin en MySQL."
      onLogout={() => {
        clearToken();
        router.push("/login");
      }}
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#baff2e]/25 bg-[#baff2e]/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#baff2e] shadow-[0_0_8px_#baff2e]" />
            <span className="text-[#d9ff84] text-[10px] font-black tracking-[0.2em] uppercase">
              Datos en tiempo real
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            <MetricCard
              title="Usuarios registrados"
              value={stats.totalUsuarios}
              description="Cuentas activas en la plataforma."
            />
            <MetricCard
              title="Pedidos totales"
              value={stats.totalPedidos}
              description={`${stats.pedidosPendientes} pendientes · ${stats.pedidosConfirmados} confirmados`}
              href="/admin/orders"
            />
            <MetricCard
              title="Tasa de confirmación"
              value={`${confirmRate}%`}
              description="Porcentaje de pedidos confirmados sobre el total."
              accent="violet"
            />
            <MetricCard
              title="Pendientes"
              value={stats.pedidosPendientes}
              description="Requieren revisión y confirmación manual."
              accent="amber"
              href="/admin/orders"
            />
            <MetricCard
              title="Confirmados"
              value={stats.pedidosConfirmados}
              description="Stock ya descontado vía sp_confirmar_pedido."
              href="/admin/orders"
            />
            <MetricCard
              title="Suplementos en catálogo"
              value={stats.totalSuplementos}
              description={`${stats.stockTotal} unidades de stock acumulado en inventario.`}
              href="/admin"
            />
          </div>

          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black/30 p-6 text-white/45 text-sm leading-relaxed">
            <p className="text-white/70 font-semibold mb-2">Origen de los datos</p>
            <p>
              Estas cifras provienen del procedimiento almacenado{" "}
              <code className="text-[#baff2e]/90">sp_estadisticas_admin</code> y se consultan en{" "}
              <code className="text-[#baff2e]/90">GET /api/admin/stats</code>. Para gestionar la cola de
              pedidos, usa la sección{" "}
              <Link href="/admin/orders" className="text-[#baff2e] hover:underline">
                Pedidos
              </Link>
              .
            </p>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
