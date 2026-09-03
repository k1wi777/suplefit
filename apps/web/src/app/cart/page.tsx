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
  PayPalButton,
  type PayPalStatus,
} from "@/features/cart";
import { AuthenticatedOnly, getToken } from "@/features/auth";

const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY === "USD" ? "USD" : "COP";

function formatAmount(amount: number) {
  return `${PAYPAL_CURRENCY} ${amount.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

function getCheckoutStatusLabel(status: PayPalStatus) {
  const labels: Record<PayPalStatus, string> = {
    idle: "Listo para iniciar",
    loading: "Cargando PayPal Sandbox",
    ready: "Listo para pagar",
    approving: "Esperando aprobación",
    capturing: "Capturando pago",
    registering: "Registrando pedido",
    completed: "Pago completado",
    cancelled: "Pago cancelado",
    error: "No completado",
  };
  return labels[status];
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
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    const token = getToken();
    if (!token) {
      router.push("/login?next=/cart");
      return;
    }

    const currentItems = getCart();
    if (currentItems.length === 0) return;

    const currentSubtotal = getCartSubtotal();
    setCheckoutItems(currentItems.map((item) => ({ ...item })));
    setCheckoutSubtotal(currentSubtotal);
    setCheckoutStatus("loading");
    setCheckoutOpen(true);
  }

  async function handleCapture() {
    const token = getToken();
    if (!token) {
      throw new Error("Tu sesión expiró. Inicia sesión de nuevo para registrar el pedido.");
    }
    if (checkoutItems.length === 0) {
      throw new Error("El carrito ya no contiene artículos para registrar.");
    }

    setConfirming(true);
    setError(null);
    try {
      const data = await apiFetch<{ order?: { id?: number } }>("/api/orders", {
        method: "POST",
        token,
        body: {
          items: checkoutItems.map((item) => ({
            supplementId: item.supplementId,
            cantidad: item.cantidad,
          })),
        },
      });
      const orderId = data.order?.id;
      if (typeof orderId !== "number" || !Number.isInteger(orderId) || orderId <= 0) {
        throw new Error("El servidor no devolvió un identificador de pedido válido.");
      }
      clearCart();
      setCheckoutOpen(false);
      setSuccess(`Pedido #${orderId} registrado como pendiente.`);
      router.push(`/orders/${orderId}`);
    } catch (error: unknown) {
      const details = getErrorMessage(error, "Error desconocido del servidor");
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

  function handlePaymentError(error: unknown) {
    setConfirming(false);
    const message = getErrorMessage(error, "No se pudo completar el pago de prueba.");
    setError(message);
  }

  function closeCheckout() {
    if (checkoutBusy) return;
    setCheckoutOpen(false);
    setCheckoutStatus("idle");
    setError(null);
  }

  return (
    <AuthenticatedOnly allowAnonymous>
      <main className="flex-1 px-4 py-10 min-h-screen bg-[#050505]">
        <div className="mx-auto max-w-3xl flex flex-col gap-6">
        <div>
          <h1 className="text-white font-black text-3xl">Carrito de compra</h1>
          <p className="text-white/60 text-sm mt-2">
            Tus productos se guardan en este dispositivo hasta que confirmes la compra.
          </p>
        </div>

        <DisclaimerBanner compact />

        {success ? (
          <div className="text-emerald-300 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4">
            {success}
          </div>
        ) : null}
        {error ? (
          <div className="text-red-300 text-sm bg-red-400/10 border border-red-400/20 rounded-xl p-4" role="alert">
            {error}
          </div>
        ) : null}

        {items.length === 0 ? (
          <GlassCard className="p-8 text-center border border-white/10">
            <p className="text-white/60">Tu carrito está vacío.</p>
            <Link href="/catalog" className="inline-block mt-4 neon-btn rounded-full px-6 py-2 text-sm font-bold">
              Ir al catálogo
            </Link>
          </GlassCard>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <GlassCard
                  key={item.supplementId}
                  className="p-4 flex gap-4 items-center border border-white/10"
                >
                  <div className="h-16 w-16 rounded-xl bg-white/5 overflow-hidden shrink-0">
                    {item.imagenUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imagenUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/supplements/${item.supplementId}`}
                      className="text-white font-bold hover:text-[#baff2e] transition"
                    >
                      {item.nombre}
                    </Link>
                    <div className="text-white/50 text-sm mt-1">
                      {formatAmount(item.precio)} c/u
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={checkoutOpen || confirming}
                      className="h-8 w-8 rounded-lg bg-white/10 text-white disabled:opacity-40"
                      onClick={() => updateCartQty(item.supplementId, item.cantidad - 1)}
                    >
                      −
                    </button>
                    <span className="text-white w-6 text-center">{item.cantidad}</span>
                    <button
                      type="button"
                      disabled={checkoutOpen || confirming}
                      className="h-8 w-8 rounded-lg bg-white/10 text-white disabled:opacity-40"
                      onClick={() => updateCartQty(item.supplementId, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-white font-semibold w-24 text-right">
                    {formatAmount(item.precio * item.cantidad)}
                  </div>
                  <button
                    type="button"
                    disabled={checkoutOpen || confirming}
                    className="text-white/40 hover:text-red-400 text-sm disabled:opacity-40"
                    onClick={() => removeFromCart(item.supplementId)}
                  >
                    Quitar
                  </button>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-white/50 text-xs uppercase tracking-widest">Subtotal ({PAYPAL_CURRENCY})</div>
                <div className="text-white font-black text-2xl">{formatAmount(subtotal)}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={checkoutOpen || confirming}
                  className="rounded-full px-6 py-3 border border-white/20 text-white/80 text-sm hover:bg-white/5 disabled:opacity-40"
                  onClick={() => clearCart()}
                >
                  Vaciar carrito
                </button>
                <button
                  type="button"
                  disabled={checkoutOpen || checkoutBusy}
                  className="rounded-full neon-btn px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
                  onClick={handleConfirm}
                >
                  {checkoutBusy ? "Procesando..." : "Confirmar compra"}
                </button>
              </div>
            </GlassCard>

            {checkoutOpen ? (
              <GlassCard className="p-6 border border-[#baff2e]/30 flex flex-col gap-5">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-white font-bold text-xl">Pagar con PayPal Sandbox</h2>
                    <span className="rounded-full bg-amber-300/10 border border-amber-300/30 px-3 py-1 text-amber-200 text-xs font-bold">
                      SOLO PRUEBAS
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    Esta demostración usa PayPal Sandbox y no incluye validación server-side de producción.
                  </p>
                  <p className="text-white font-semibold mt-3">Total a pagar: {formatAmount(checkoutSubtotal)}</p>
                  <p className="text-white/60 text-sm mt-2" role="status" aria-live="polite">
                    Estado: {getCheckoutStatusLabel(checkoutStatus)}
                  </p>
                </div>
                <PayPalButton
                  amount={checkoutSubtotal}
                  currency={PAYPAL_CURRENCY}
                  onCapture={handleCapture}
                  onCancel={handlePaymentCancel}
                  onError={handlePaymentError}
                  onStatusChange={setCheckoutStatus}
                />
                <button
                  type="button"
                  disabled={checkoutBusy}
                  className="self-start rounded-full px-5 py-2 border border-white/20 text-white/70 text-sm hover:bg-white/5 disabled:opacity-40"
                  onClick={closeCheckout}
                >
                  Volver al carrito
                </button>
              </GlassCard>
            ) : null}

            <p className="text-white/40 text-xs">
              El pedido se registra solo después de capturar el pago Sandbox. Debes iniciar sesión.
            </p>
          </>
        )}
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
