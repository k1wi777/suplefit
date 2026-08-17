"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell, customerInitials, formatMoney, formatOrderDate, formatOrderId } from "@/features/admin";
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

type AdminOrder = {
  id: number;
  userId: number;
  estado: "pendiente" | "confirmado" | "cancelado";
  total: string | number;
  createdAt: string;
  customerNombre: string;
  customerCorreo: string;
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

function StatusBadge({ estado }: { estado: string }) {
  const styles =
    estado === "pendiente"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : estado === "confirmado"
        ? "bg-[#baff2e]/15 text-[#d9ff84] border-[#baff2e]/30"
        : "bg-white/10 text-white/50 border-white/15";
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles}`}
    >
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="panel-gradient-admin-catalog rounded-2xl border border-white/[0.08] p-5 flex gap-4 items-start">
      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#baff2e] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-white/45 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-white font-black text-2xl md:text-3xl tracking-tight mt-1">{value}</p>
        {hint ? <p className="text-[#baff2e]/90 text-xs font-semibold mt-1">{hint}</p> : null}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const token = getToken();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<"pendiente" | "confirmado" | "todos">("pendiente");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const load = useCallback(async () => {
    if (!token) return;
    const estadoQs = estadoFilter === "todos" ? "todos" : estadoFilter;
    const [ordersResult, statsResult] = await Promise.allSettled([
      apiFetch<{ orders: AdminOrder[] }>(`/api/admin/orders?estado=${estadoQs}`, { token }),
      apiFetch<AdminStats>("/api/admin/stats", { token }),
    ]);

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value);
    }

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value.orders);
      setError(null);
    } else {
      setOrders([]);
      const msg =
        ordersResult.reason instanceof Error ? ordersResult.reason.message : "Error al cargar pedidos";
      setError(
        msg === "Not found"
          ? "El listado de pedidos no está disponible. Reinicia la API (pnpm dev:api) para cargar la ruta GET /api/admin/orders."
          : msg
      );
    }
  }, [token, estadoFilter]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        load().finally(() => {
          if (active) setLoading(false);
        });
      }
    });
    return () => {
      active = false;
    };
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.customerNombre.toLowerCase().includes(q) ||
        o.customerCorreo.toLowerCase().includes(q) ||
        formatOrderId(o.id).toLowerCase().includes(q) ||
        String(o.id).includes(q)
    );
  }, [orders, search]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.estado === "pendiente"),
    [orders]
  );

  const revenueQueue = useMemo(
    () => pendingOrders.reduce((sum, o) => sum + Number(o.total), 0),
    [pendingOrders]
  );

  const avgPending = pendingOrders.length > 0 ? revenueQueue / pendingOrders.length : 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageOrders = filtered.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setPage(0);
    });
    return () => {
      active = false;
    };
  }, [search, estadoFilter]);

  async function confirmOrder(id: number) {
    if (!token) return;
    if (!confirm(`¿Confirmar el pedido ${formatOrderId(id)}? Se descontará el stock.`)) return;
    setConfirmingId(id);
    setError(null);
    try {
      await apiFetch(`/api/admin/orders/${id}/confirm`, { token, method: "POST" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar el pedido");
    } finally {
      setConfirmingId(null);
    }
  }

  function exportCsv() {
    const header = "id,cliente,correo,fecha,total,estado\n";
    const rows = filtered
      .map(
        (o) =>
          `${o.id},"${o.customerNombre.replace(/"/g, '""')}",${o.customerCorreo},${o.createdAt},${o.total},${o.estado}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-suplefit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell
      active="orders"
      title="Gestión de pedidos"
      subtitle="Revisa y confirma pedidos de clientes. Al confirmar se descuenta stock (sp_confirmar_pedido)."
      onLogout={() => {
        clearToken();
        router.push("/login");
      }}
      actions={
        <>
          <button
            type="button"
            onClick={() =>
              setEstadoFilter((f) =>
                f === "pendiente" ? "confirmado" : f === "confirmado" ? "todos" : "pendiente"
              )
            }
            className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wide px-4 py-3 transition flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            {estadoFilter === "pendiente"
              ? "Pendientes"
              : estadoFilter === "confirmado"
                ? "Confirmados"
                : "Todos"}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="rounded-xl bg-[#baff2e] hover:bg-[#d4ff63] disabled:opacity-40 text-black font-black text-xs uppercase tracking-wide px-5 py-3 transition flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v12M8 11l4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exportar
          </button>
        </>
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Pendientes"
          value={String(stats?.pedidosPendientes ?? orders.filter((o) => o.estado === "pendiente").length)}
          hint={
            stats && stats.pedidosPendientes > 0
              ? `${stats.pedidosConfirmados} ya confirmados`
              : "Sin pedidos en cola"
          }
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          }
        />
        <StatCard
          title="Ingresos en cola"
          value={formatMoney(revenueQueue)}
          hint="Suma de pedidos pendientes visibles"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M2 10h20" />
            </svg>
          }
        />
        <StatCard
          title="Ticket medio (pend.)"
          value={formatMoney(avgPending)}
          hint={pendingOrders.length ? `Basado en ${pendingOrders.length} pedido(s)` : "—"}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 20V4M4 20h16" strokeLinecap="round" />
              <path d="M8 16v-4M12 16V8M16 16v-6" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      <section className="panel-gradient-admin-catalog rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.45)]">
        <div className="p-5 md:p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-white font-black text-lg md:text-xl">
            {estadoFilter === "pendiente"
              ? "Pedidos pendientes"
              : estadoFilter === "confirmado"
                ? "Pedidos confirmados"
                : "Todos los pedidos"}
          </h2>
          <div className="relative w-full sm:w-72">
            <input
              className="admin-input pl-10 text-sm"
              placeholder="Buscar pedidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="text-white/40 text-[10px] font-black uppercase tracking-widest border-b border-white/[0.06]">
                <th className="px-5 py-4">Pedido</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td colSpan={6} className="px-5 py-6">
                      <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : pageOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-white/45 text-sm">
                    No hay pedidos para mostrar.
                  </td>
                </tr>
              ) : (
                pageOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition"
                  >
                    <td className="px-5 py-4 text-white font-bold text-sm">{formatOrderId(o.id)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#baff2e]/30 to-violet-600/20 border border-white/15 flex items-center justify-center text-[10px] font-black text-white">
                          {customerInitials(o.customerNombre)}
                        </span>
                        <div>
                          <p className="text-white text-sm font-semibold">{o.customerNombre}</p>
                          <p className="text-white/35 text-xs">{o.customerCorreo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60 text-sm">{formatOrderDate(o.createdAt)}</td>
                    <td className="px-5 py-4 text-white font-black">{formatMoney(o.total)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge estado={o.estado} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {o.estado === "pendiente" ? (
                        <button
                          type="button"
                          disabled={confirmingId === o.id}
                          onClick={() => confirmOrder(o.id)}
                          className="rounded-lg bg-[#baff2e] hover:bg-[#d4ff63] disabled:opacity-50 text-black text-[10px] font-black uppercase tracking-wide px-4 py-2 transition"
                        >
                          {confirmingId === o.id ? "..." : "Confirmar"}
                        </button>
                      ) : (
                        <span className="text-white/25 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white/45 text-xs">
          <span>
            Mostrando {filtered.length === 0 ? 0 : page * pageSize + 1} a{" "}
            {Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length} entradas
          </span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="w-9 h-9 rounded-lg border border-white/15 disabled:opacity-30 hover:bg-white/5 transition"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="w-9 h-9 rounded-lg border border-white/15 disabled:opacity-30 hover:bg-white/5 transition"
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
