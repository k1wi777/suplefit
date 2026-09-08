"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import DisclaimerBanner from "@/shared/components/DisclaimerBanner";
import { apiFetch } from "@/shared/lib/api";
import {
  clearCart,
  getCart,
  getCartSubtotal,
  removeFromCart,
  subscribeCart,
  updateCartQty,
  type CartItem,
  CheckoutModal,
  type PayPalStatus,
} from "@/features/cart";
import { AuthenticatedOnly, getToken } from "@/features/auth";

const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY === "USD" ? "USD" : "COP";

function formatAmount(amount: number) {
  return `${PAYPAL_CURRENCY} ${amount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [checkoutSubtotal, setCheckoutSubtotal] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<PayPalStatus>("idle");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setItems(getCart());
    });
    const unsubscribe = subscribeCart(() => {
      if (active) setItems(getCart());
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const subtotal = getCartSubtotal();
  const checkoutBusy = confirming || ["loading", "approving", "capturing", "registering"].includes(checkoutStatus);

  function handleConfirm() {
    setError(null);
    const token = getToken();
    if (!token) {
      router.push("/login?next=/cart");
      return;
    }
    const currentItems = getCart();
    if (currentItems.length === 0) return;
    setCheckoutItems(currentItems.map((item) => ({ ...item })));
    setCheckoutSubtotal(getCartSubtotal());
    setCheckoutStatus("loading");
    setCheckoutOpen(true);
  }

  async function handleCapture() {
    const token = getToken();
    if (!token) throw new Error("Tu sesión expiró. Inicia sesión de nuevo para registrar el pedido.");
    if (checkoutItems.length === 0) throw new Error("El carrito ya no contiene artículos para registrar.");

    setConfirming(true);
    setError(null);
    try {
      const data = await apiFetch<{ order?: { id?: number } }>("/api/orders", {
        method: "POST",
        token,
        body: { items: checkoutItems.map((item) => ({ supplementId: item.supplementId, cantidad: item.cantidad })) },
      });
      const orderId = data.order?.id;
      if (typeof orderId !== "number" || !Number.isInteger(orderId) || orderId <= 0) {
        throw new Error("El servidor no devolvió un identificador de pedido válido.");
      }
      clearCart();
      setCheckoutOpen(false);
      router.push(`/orders/${orderId}?purchase=success`);
    } catch (captureError: unknown) {
      const details = getErrorMessage(captureError, "Error desconocido del servidor");
      throw new Error(`El pago fue capturado, pero no se pudo registrar el pedido. ${details}`);
    } finally {
      setConfirming(false);
    }
  }

  function handlePaymentCancel() {
    setConfirming(false);
    setCheckoutStatus("cancelled");
    setError("Pago cancelado. Tu carrito se conserva y puedes reintentar cuando quieras.");
  }

  function handlePaymentError(paymentError: unknown) {
    setConfirming(false);
    setError(getErrorMessage(paymentError, "No se pudo completar el pago de prueba."));
  }

  function closeCheckout() {
    if (checkoutBusy) return;
    setCheckoutOpen(false);
    setCheckoutStatus("idle");
    setError(null);
  }

  return (
    <AuthenticatedOnly allowAnonymous>
      <main className="relative min-h-screen flex-1 overflow-hidden px-4 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(186,255,46,0.1),transparent_28%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#baff2e]">Tu selección</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Carrito de compra</h1>
              <p className="mt-2 text-sm text-white/55">Revisa tus productos antes de confirmar tu compra.</p>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-white/60 transition hover:text-[#baff2e]">← Seguir explorando</Link>
          </div>

          <DisclaimerBanner compact />
          {error ? <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200" role="alert">{error}</div> : null}

          {items.length === 0 ? (
            <GlassCard className="mt-6 border border-white/[0.09] bg-[#070a09]/95 p-10 text-center shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#baff2e]/20 bg-[#baff2e]/10 text-3xl text-[#baff2e]">✦</div>
              <h2 className="mt-5 text-xl font-bold text-white">Tu carrito está esperando algo</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">Añade suplementos desde el catálogo para ver aquí el resumen de tu compra.</p>
              <Link href="/catalog" className="neon-btn mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold">Ir al catálogo</Link>
            </GlassCard>
          ) : (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
              <section aria-labelledby="cart-items-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 id="cart-items-title" className="text-lg font-bold text-white">Productos <span className="text-sm font-normal text-white/40">({items.length})</span></h2>
                  <span className="text-xs uppercase tracking-wider text-white/35">Guardado en este dispositivo</span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <GlassCard key={item.supplementId} className="border border-white/[0.09] bg-[#070a09]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.38)] transition hover:border-[#baff2e]/25 sm:p-5">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:h-24 sm:w-24">
                          {item.imagenUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imagenUrl} alt={item.nombre} className="h-full w-full object-cover" />
                          ) : <div className="flex h-full items-center justify-center text-2xl font-black text-[#baff2e]/70">SF</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/supplements/${item.supplementId}`} className="font-bold text-white transition hover:text-[#baff2e]">{item.nombre}</Link>
                          <p className="mt-1 text-xs text-white/45">Precio unitario · {formatAmount(item.precio)}</p>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center rounded-lg border border-white/10 bg-black/20">
                              <button type="button" disabled={checkoutOpen || confirming} aria-label={`Reducir cantidad de ${item.nombre}`} className="h-9 w-9 text-white/60 transition hover:text-[#baff2e] disabled:opacity-40" onClick={() => updateCartQty(item.supplementId, item.cantidad - 1)}>−</button>
                              <span className="w-8 text-center text-sm font-semibold text-white" aria-label={`Cantidad: ${item.cantidad}`}>{item.cantidad}</span>
                              <button type="button" disabled={checkoutOpen || confirming} aria-label={`Aumentar cantidad de ${item.nombre}`} className="h-9 w-9 text-white/60 transition hover:text-[#baff2e] disabled:opacity-40" onClick={() => updateCartQty(item.supplementId, item.cantidad + 1)}>+</button>
                            </div>
                            <button type="button" disabled={checkoutOpen || confirming} className="text-xs text-white/40 underline-offset-4 transition hover:text-red-300 hover:underline disabled:opacity-40" onClick={() => removeFromCart(item.supplementId)}>Quitar producto</button>
                          </div>
                        </div>
                        <div className="hidden text-right sm:block"><p className="text-xs text-white/35">Importe</p><p className="mt-1 font-bold text-white">{formatAmount(item.precio * item.cantidad)}</p></div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 sm:hidden"><span className="text-xs text-white/35">Importe</span><span className="font-bold text-white">{formatAmount(item.precio * item.cantidad)}</span></div>
                    </GlassCard>
                  ))}
                </div>
              </section>

              <aside className="lg:sticky lg:top-6">
                <GlassCard className="border border-[#baff2e]/20 bg-[#070a09]/95 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.5)] sm:p-6">
                  <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Resumen</h2><span className="rounded-full bg-[#baff2e]/10 px-3 py-1 text-xs font-bold text-[#baff2e]">{PAYPAL_CURRENCY}</span></div>
                  <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm"><div className="flex justify-between text-white/55"><span>Productos</span><span>{items.reduce((sum, item) => sum + item.cantidad, 0)} unidades</span></div><div className="flex justify-between text-white/55"><span>Subtotal</span><span className="font-semibold text-white">{formatAmount(subtotal)}</span></div></div>
                  <div className="mt-5 flex items-end justify-between gap-4"><span className="text-sm text-white/55">Total a pagar</span><span className="text-2xl font-black text-[#baff2e]">{formatAmount(subtotal)}</span></div>
                  <p className="mt-2 text-xs leading-5 text-white/40">El subtotal es el importe que se enviará a PayPal Sandbox. No incluye cargos adicionales.</p>
                  <div className="mt-5 flex flex-col gap-3"><button type="button" disabled={checkoutOpen || checkoutBusy} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => clearCart()}>Vaciar carrito</button><button type="button" disabled={checkoutOpen || checkoutBusy} className="neon-btn rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50" onClick={handleConfirm}>{checkoutBusy ? "Procesando..." : "Confirmar compra"}</button></div>

                </GlassCard>
                <p className="mt-4 text-center text-xs leading-5 text-white/35">El pedido se registra únicamente después de capturar el pago Sandbox. Debes iniciar sesión.</p>
              </aside>
            </div>
          )}
        </div>
        <CheckoutModal open={checkoutOpen} items={checkoutItems} subtotal={checkoutSubtotal} currency={PAYPAL_CURRENCY} status={checkoutStatus} busy={checkoutBusy} error={error} onClose={closeCheckout} onCapture={handleCapture} onCancel={handlePaymentCancel} onError={handlePaymentError} onStatusChange={setCheckoutStatus} />
      </main>
    </AuthenticatedOnly>
  );
}
