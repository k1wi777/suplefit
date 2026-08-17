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
} from "@/features/cart";
import { getToken } from "@/features/auth";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
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

  async function handleConfirm() {
    setError(null);
    setSuccess(null);
    const token = getToken();
    if (!token) {
      router.push("/login?next=/cart");
      return;
    }
    if (items.length === 0) return;

    setConfirming(true);
    try {
      const data = await apiFetch<{ order: { id: number } }>("/api/orders", {
        method: "POST",
        token,
        body: {
          items: items.map((i) => ({
            supplementId: i.supplementId,
            cantidad: i.cantidad,
          })),
        },
      });
      clearCart();
      setSuccess(`Pedido #${data.order.id} registrado como pendiente.`);
      router.push(`/orders/${data.order.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al confirmar compra");
    } finally {
      setConfirming(false);
    }
  }

  return (
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
          <div className="text-red-300 text-sm bg-red-400/10 border border-red-400/20 rounded-xl p-4">
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
                      ${item.precio.toFixed(2)} c/u
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-lg bg-white/10 text-white"
                      onClick={() => updateCartQty(item.supplementId, item.cantidad - 1)}
                    >
                      −
                    </button>
                    <span className="text-white w-6 text-center">{item.cantidad}</span>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-lg bg-white/10 text-white"
                      onClick={() => updateCartQty(item.supplementId, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-white font-semibold w-20 text-right">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    className="text-white/40 hover:text-red-400 text-sm"
                    onClick={() => removeFromCart(item.supplementId)}
                  >
                    Quitar
                  </button>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-white/50 text-xs uppercase tracking-widest">Subtotal</div>
                <div className="text-white font-black text-2xl">${subtotal.toFixed(2)}</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="rounded-full px-6 py-3 border border-white/20 text-white/80 text-sm hover:bg-white/5"
                  onClick={() => {
                    clearCart();
                  }}
                >
                  Vaciar carrito
                </button>
                <button
                  type="button"
                  disabled={confirming}
                  className="rounded-full neon-btn px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
                  onClick={handleConfirm}
                >
                  {confirming ? "Confirmando..." : "Confirmar compra"}
                </button>
              </div>
            </GlassCard>
            <p className="text-white/40 text-xs">
              Al confirmar se crea un pedido en estado pendiente. Debes iniciar sesión. No se procesa pago en línea en esta versión.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
