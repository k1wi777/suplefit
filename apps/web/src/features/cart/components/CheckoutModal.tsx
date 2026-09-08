"use client";

import { useEffect, useId, useRef } from "react";
import type { CartItem } from "../utils/cart";
import PayPalButton, { type PayPalStatus } from "./PayPalButton";

type PayPalCaptureDetails = { id?: string; status?: string };
type PayPalCurrency = "COP" | "USD";

type CheckoutModalProps = {
  open: boolean;
  items: CartItem[];
  subtotal: number;
  currency: PayPalCurrency;
  status: PayPalStatus;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onCapture: (details: PayPalCaptureDetails) => Promise<void> | void;
  onCancel: () => void;
  onError: (error: unknown) => void;
  onStatusChange: (status: PayPalStatus) => void;
};

const STATUS_LABELS: Record<PayPalStatus, string> = {
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

function formatAmount(amount: number, currency: PayPalCurrency) {
  return `${currency} ${amount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CheckoutModal({
  open,
  items,
  subtotal,
  currency,
  status,
  busy,
  error,
  onClose,
  onCapture,
  onCancel,
  onError,
  onStatusChange,
}: CheckoutModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden
        onMouseDown={() => {
          if (!busy) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[min(90vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111]/[0.98] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-7">
          <div>
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#baff2e]/30 bg-[#baff2e]/10 text-lg text-[#baff2e]">$</span><div><h2 id={titleId} className="text-xl font-black tracking-tight text-white">Confirmar compra</h2><p id={descriptionId} className="mt-1 text-xs text-white/45">Revisa tu selección y paga en un entorno seguro de pruebas.</p></div></div>
          </div>
          <button ref={closeButtonRef} type="button" disabled={busy} aria-label="Cerrar checkout" className="rounded-lg border border-white/10 px-3 py-2 text-xl leading-none text-white/55 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" onClick={onClose}>×</button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-white">Resumen de compra</h3><span className="rounded-full bg-[#baff2e]/10 px-3 py-1 text-xs font-bold text-[#baff2e]">{currency}</span></div>
            <div className="mt-4 divide-y divide-white/10">
              {items.map((item) => (
                <div key={item.supplementId} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{item.nombre}</p><p className="mt-1 text-xs text-white/45">{item.cantidad} × {formatAmount(item.precio, currency)}</p></div>
                  <span className="shrink-0 text-sm font-bold text-white">{formatAmount(item.precio * item.cantidad, currency)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-sm text-white/55">Subtotal · Total a pagar</span><span className="text-xl font-black text-[#baff2e]">{formatAmount(subtotal, currency)}</span></div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-white">PayPal Sandbox</h3><p className="mt-1 text-xs text-white/50">Solo pruebas · no se realiza un cobro real.</p></div><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[10px] font-bold text-amber-200">SANDBOX</span></div>
            <p className="mt-3 text-xs text-white/60" role="status" aria-live="polite">Estado: <span className="font-semibold text-[#baff2e]">{STATUS_LABELS[status]}</span></p>
            {error ? <p className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200" role="alert">{error}</p> : null}
            <div className="mt-4"><PayPalButton amount={subtotal} currency={currency} onCapture={onCapture} onCancel={onCancel} onError={onError} onStatusChange={onStatusChange} /></div>
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-white/35">El pedido se registra únicamente después de capturar el pago Sandbox.</p>
        </div>
      </div>
    </div>
  );
}
