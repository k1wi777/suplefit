"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import { AuthenticatedOnly, getToken } from "@/features/auth";

type Order = {
  id: number;
  estado: string;
  total: string;
  createdAt?: string | null;
};

const currency = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY === "USD" ? "USD" : "COP";

function formatAmount(amount: string) {
  return `${currency} ${Number(amount).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatOrderDate(value: string | null | undefined) {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function getStatusPresentation(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "pendiente") return { label: "Pendiente", tone: "border-amber-300/25 bg-amber-300/10 text-amber-200", marker: "bg-amber-300" };
  if (normalized === "confirmado") return { label: "Confirmado", tone: "border-[#baff2e]/25 bg-[#baff2e]/10 text-[#baff2e]", marker: "bg-[#baff2e]" };
  if (normalized === "cancelado") return { label: "Cancelado", tone: "border-red-300/25 bg-red-300/10 text-red-200", marker: "bg-red-300" };
  return { label: status || "Estado no disponible", tone: "border-white/15 bg-white/5 text-white/60", marker: "bg-white/50" };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?next=/orders");
      return;
    }
    apiFetch<{ orders: Order[] }>("/api/orders", { token })
      .then((data) => setOrders(data.orders))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar tus pedidos."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <AuthenticatedOnly>
      <main className="relative min-h-screen flex-1 overflow-hidden px-4 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(186,255,46,0.1),transparent_28%)]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#baff2e]">Tu historial</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Mis pedidos</h1><p className="mt-2 text-sm text-white/55">Consulta tus compras, estados y detalles cuando quieras.</p></div>
            {!loading && !error ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/50">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</span> : null}
          </div>

          {loading ? (
            <GlassCard className="flex items-center gap-4 border border-white/10 p-6"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#baff2e] border-t-transparent" /><span className="text-sm text-white/60">Cargando tus pedidos...</span></GlassCard>
          ) : null}
          {error ? <div role="alert"><GlassCard className="border border-red-400/20 bg-red-400/5 p-6"><p className="font-semibold text-red-200">No pudimos cargar tus pedidos</p><p className="mt-2 text-sm text-red-200/70">{error}</p><button type="button" className="mt-4 rounded-full border border-red-300/30 px-4 py-2 text-sm text-red-100 transition hover:bg-red-300/10" onClick={() => window.location.reload()}>Intentar de nuevo</button></GlassCard></div> : null}

          {!loading && !error && orders.length === 0 ? (
            <GlassCard className="border border-white/10 p-8 text-center sm:p-12"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#baff2e]/10 text-2xl text-[#baff2e]">⌁</div><h2 className="mt-5 text-xl font-bold text-white">Aún no tienes pedidos</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">Cuando completes una compra en la tienda, aparecerá aquí con su estado y detalle.</p><Link href="/catalog" className="neon-btn mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold">Explorar catálogo</Link></GlassCard>
          ) : null}

          {!loading && !error && orders.length > 0 ? <div className="grid gap-3">{orders.map((order) => { const status = getStatusPresentation(order.estado); return <Link key={order.id} href={`/orders/${order.id}`} className="group"><GlassCard className="card-hover border border-white/10 p-5 transition group-hover:border-[#baff2e]/35 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="text-lg font-bold text-white">Pedido #{order.id}</span><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}><span className={`h-1.5 w-1.5 rounded-full ${status.marker}`} />{status.label}</span></div><p className="mt-2 text-sm text-white/45">Realizado el {formatOrderDate(order.createdAt)}</p></div><div className="flex items-center justify-between gap-6 sm:justify-end"><div className="text-left sm:text-right"><p className="text-xs uppercase tracking-wider text-white/35">Total</p><p className="mt-1 font-black text-[#baff2e]">{formatAmount(order.total)}</p></div><span className="text-xl text-white/30 transition group-hover:translate-x-1 group-hover:text-[#baff2e]" aria-hidden>→</span></div></div></GlassCard></Link>; })}</div> : null}
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
