"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import { AuthenticatedOnly, getToken } from "@/features/auth";

type Order = { id: number; estado: string; total: string | number; createdAt: string };
type OrderItem = { supplementId: number; supplementNombre: string; cantidad: number; precioUnitario: string | number };
type TimelineStep = { label: string; description: string; state: "completed" | "current" | "terminal" };

const currency = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY === "USD" ? "USD" : "COP";

function formatAmount(amount: string | number | null | undefined) {
  const numericAmount = typeof amount === "string" && amount.trim() === "" ? Number.NaN : Number(amount);
  if (!Number.isFinite(numericAmount)) return "No disponible";
  return `${currency} ${numericAmount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusPresentation(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "pendiente") {
    return {
      label: "Pendiente",
      description: "Pedido recibido y en espera de confirmación.",
      tone: "border-amber-300/25 bg-amber-300/10 text-amber-200",
      marker: "bg-amber-300",
      progress: "1/2",
      steps: [
        { label: "Pedido recibido", description: "La solicitud fue registrada.", state: "completed" as const },
        { label: "Confirmación", description: "Pendiente de confirmación.", state: "current" as const },
      ],
    };
  }
  if (normalized === "confirmado") {
    return {
      label: "Confirmado",
      description: "El pedido fue confirmado correctamente.",
      tone: "border-[#baff2e]/25 bg-[#baff2e]/10 text-[#baff2e]",
      marker: "bg-[#baff2e]",
      progress: "2/2",
      steps: [
        { label: "Pedido recibido", description: "La solicitud fue registrada.", state: "completed" as const },
        { label: "Confirmación", description: "El pedido fue confirmado.", state: "completed" as const },
      ],
    };
  }
  if (normalized === "cancelado") {
    return {
      label: "Cancelado",
      description: "Este pedido terminó en estado cancelado.",
      tone: "border-red-300/25 bg-red-300/10 text-red-200",
      marker: "bg-red-300",
      progress: "Terminal",
      steps: [
        { label: "Pedido recibido", description: "La solicitud fue registrada.", state: "completed" as const },
        { label: "Pedido cancelado", description: "El pedido terminó sin confirmarse.", state: "terminal" as const },
      ],
    };
  }
  return {
    label: status || "Estado no disponible",
    description: "El pedido tiene un estado que aún no reconocemos.",
    tone: "border-white/15 bg-white/5 text-white/60",
    marker: "bg-white/50",
    progress: "—",
    steps: [{ label: "Estado del pedido", description: "No hay una progresión disponible.", state: "current" as const }],
  };
}

function timelineMarkerClass(state: TimelineStep["state"]) {
  if (state === "completed") return "bg-[#baff2e] text-[#101410]";
  if (state === "terminal") return "bg-red-300 text-[#250d0d]";
  if (state === "current") return "border border-amber-300 bg-amber-300/10 text-amber-200";
  return "border border-white/20 bg-white/5 text-white/40";
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedPurchaseId, setDismissedPurchaseId] = useState<string | null>(null);

  const purchaseCompleted = searchParams.get("purchase") === "success";

  useEffect(() => {
    if (!purchaseCompleted) return;
    window.history.replaceState(null, "", `/orders/${id}`);
    const timeoutId = window.setTimeout(() => setDismissedPurchaseId(id), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [id, purchaseCompleted]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(`/login?next=/orders/${id}`);
      return;
    }
    apiFetch<{ order: Order; items: OrderItem[] }>(`/api/orders/${id}`, { token })
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "No se pudo encontrar este pedido.");
        router.replace("/orders");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  return (
    <AuthenticatedOnly>
      {loading ? (
        <main className="flex min-h-[50vh] flex-1 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-white/60"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#baff2e] border-t-transparent" />Cargando detalle...</div>
        </main>
      ) : null}
      {!loading && error ? (
        <main className="relative min-h-[60vh] flex-1 px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <Link href="/orders" className="text-sm text-white/55 transition hover:text-[#baff2e]">← Volver a mis pedidos</Link>
            <div role="alert"><GlassCard className="mt-6 border border-red-400/20 bg-red-400/5 p-7"><h1 className="text-xl font-bold text-red-100">No pudimos abrir este pedido</h1><p className="mt-2 text-sm text-red-200/70">{error}</p><Link href="/orders" className="mt-5 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5">Ir al listado</Link></GlassCard></div>
          </div>
        </main>
      ) : null}
      {!loading && !error && order ? (() => {
        const status = getStatusPresentation(order.estado);
        return (
          <main className="relative min-h-screen flex-1 overflow-hidden px-4 py-10 sm:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_5%,rgba(186,255,46,0.1),transparent_28%)]" />
            <div className="relative z-10 mx-auto max-w-4xl">
              <Link href="/orders" className="text-sm text-white/55 transition hover:text-[#baff2e]">← Volver a mis pedidos</Link>
              {purchaseCompleted && dismissedPurchaseId !== id ? <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-100" role="status" aria-live="polite"><p className="font-bold">Compra confirmada</p><p className="mt-1 text-sm text-emerald-100/75">El pedido #{order.id} fue registrado correctamente.</p></div> : null}
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#baff2e]">Detalle de compra</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Pedido #{order.id}</h1>
                  <p className="mt-2 text-sm text-white/45">Realizado el {new Date(order.createdAt).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}</p>
                </div>
                <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.tone}`}><span className={`h-2 w-2 rounded-full ${status.marker}`} />{status.label}</span>
              </div>

              <GlassCard className="mt-7 border border-white/10 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div><h2 className="font-bold text-white">Estado del pedido</h2><p className="mt-1 text-sm text-white/50">{status.description}</p></div>
                  <span className="text-xs text-white/35">{status.progress}</span>
                </div>
                <ol className="mt-6 space-y-5" aria-label="Progreso del pedido">
                  {status.steps.map((step, index) => (
                    <li key={step.label} className="relative flex gap-3">
                      {index < status.steps.length - 1 ? <span className="absolute left-3.5 top-8 h-[calc(100%+0.25rem)] w-px bg-white/15" aria-hidden /> : null}
                      <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black ${timelineMarkerClass(step.state)}`}>
                        {step.state === "completed" ? "✓" : step.state === "terminal" ? "×" : index + 1}
                      </span>
                      <div className="min-w-0 pb-1"><p className="text-sm font-semibold text-white">{step.label}</p><p className="mt-1 text-xs text-white/45">{step.description}</p></div>
                    </li>
                  ))}
                </ol>
              </GlassCard>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
                <section aria-labelledby="order-items-title"><h2 id="order-items-title" className="mb-3 text-lg font-bold text-white">Productos del pedido</h2><div className="flex flex-col gap-3">{items.map((line) => <GlassCard key={line.supplementId} className="border border-white/10 p-4 sm:p-5"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="truncate font-semibold text-white">{line.supplementNombre}</p><p className="mt-1 text-xs text-white/45">{line.cantidad} {line.cantidad === 1 ? "unidad" : "unidades"} · {formatAmount(line.precioUnitario)} c/u</p></div><p className="shrink-0 font-bold text-white">{formatAmount(Number(line.precioUnitario) * line.cantidad)}</p></div></GlassCard>)}</div></section>
                <aside><GlassCard className="border border-[#baff2e]/20 bg-black/45 p-5 sm:p-6"><p className="text-xs uppercase tracking-wider text-white/40">Total final</p><p className="mt-2 text-3xl font-black text-[#baff2e]">{formatAmount(order.total)}</p><div className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/40">Este total corresponde al pedido registrado y puede consultarse junto con su estado en cualquier momento.</div></GlassCard></aside>
              </div>
            </div>
          </main>
        );
      })() : null}
    </AuthenticatedOnly>
  );
}
