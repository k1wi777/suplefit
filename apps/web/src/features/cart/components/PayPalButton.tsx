"use client";

import { useEffect, useRef, useState } from "react";

type PayPalCurrency = "COP" | "USD";

type PayPalCaptureDetails = {
  id?: string;
  status?: string;
};

type PayPalOrderActions = {
  order: {
    create: (data: {
      purchase_units: Array<{
        amount: { currency_code: PayPalCurrency; value: string };
      }>;
    }) => Promise<string>;
    capture: () => Promise<PayPalCaptureDetails>;
  };
};

type PayPalButtons = {
  isEligible?: () => boolean;
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void> | void;
};

type PayPalNamespace = {
  Buttons: (options: {
    createOrder: (_data: unknown, actions: PayPalOrderActions) => Promise<string>;
    onApprove: (_data: unknown, actions: PayPalOrderActions) => Promise<void>;
    onCancel: () => void;
    onError: (error: unknown) => void;
  }) => PayPalButtons;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

export type PayPalStatus =
  | "idle"
  | "loading"
  | "ready"
  | "approving"
  | "capturing"
  | "registering"
  | "completed"
  | "cancelled"
  | "error";

type PayPalButtonProps = {
  amount: number;
  currency: PayPalCurrency;
  onCapture: (details: PayPalCaptureDetails) => Promise<void> | void;
  onCancel: () => void;
  onError: (error: unknown) => void;
  onStatusChange?: (status: PayPalStatus) => void;
};

const PAYPAL_SCRIPT_ID = "paypal-sdk-script";
let paypalSdkPromise: Promise<PayPalNamespace> | null = null;

function loadPayPalSdk(clientId: string, currency: PayPalCurrency) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal solo está disponible en el navegador."));
  }

  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalSdkPromise) return paypalSdkPromise;

  const scriptUrl = new URL("https://www.paypal.com/sdk/js");
  scriptUrl.searchParams.set("client-id", clientId);
  scriptUrl.searchParams.set("components", "buttons");
  scriptUrl.searchParams.set("currency", currency);
  scriptUrl.searchParams.set("intent", "capture");

  const existingScript = document.getElementById(PAYPAL_SCRIPT_ID);
  if (existingScript) existingScript.remove();

  paypalSdkPromise = new Promise<PayPalNamespace>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    script.src = scriptUrl.toString();
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal);
      } else {
        reject(new Error("El SDK de PayPal no pudo inicializarse."));
      }
    };
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    paypalSdkPromise = null;
    throw error;
  });

  return paypalSdkPromise;
}

function formatPayPalAmount(amount: number) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("El importe del carrito no es válido para PayPal.");
  }
  return amount.toFixed(2);
}

export default function PayPalButton({
  amount,
  currency,
  onCapture,
  onCancel,
  onError,
  onStatusChange,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<PayPalButtons | null>(null);
  const operationInProgressRef = useRef(false);
  const captureInProgressRef = useRef(false);
  const amountRef = useRef(amount);
  const onCaptureRef = useRef(onCapture);
  const onCancelRef = useRef(onCancel);
  const onErrorRef = useRef(onError);
  const onStatusChangeRef = useRef(onStatusChange);
  const [status, setStatus] = useState<PayPalStatus>("idle");

  useEffect(() => {
    amountRef.current = amount;
    onCaptureRef.current = onCapture;
    onCancelRef.current = onCancel;
    onErrorRef.current = onError;
    onStatusChangeRef.current = onStatusChange;
  }, [amount, onCapture, onCancel, onError, onStatusChange]);

  function updateStatus(nextStatus: PayPalStatus) {
    setStatus(nextStatus);
    onStatusChangeRef.current?.(nextStatus);
  }

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
    const container = containerRef.current;
    let disposed = false;

    if (!container) return;
    container.replaceChildren();

    if (!clientId) {
      void Promise.resolve().then(() => {
        if (!disposed) updateStatus("error");
      });
      return;
    }

    void Promise.resolve().then(() => {
      if (!disposed) updateStatus("loading");
    });

    loadPayPalSdk(clientId, currency)
      .then((paypal) => {
        if (disposed || !container) return;

        const buttons = paypal.Buttons({
          createOrder: async (_data, actions) => {
            if (operationInProgressRef.current) {
              throw new Error("Ya hay una operación de PayPal en curso.");
            }
            operationInProgressRef.current = true;
            captureInProgressRef.current = false;
            updateStatus("approving");
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: currency,
                    value: formatPayPalAmount(amountRef.current),
                  },
                },
              ],
            });
          },
          onApprove: async (_data, actions) => {
            if (!operationInProgressRef.current || captureInProgressRef.current) {
              if (captureInProgressRef.current) return;
              const error = new Error("La operación de PayPal no está activa.");
              updateStatus("error");
              onErrorRef.current(error);
              return;
            }
            captureInProgressRef.current = true;
            updateStatus("capturing");
            let captureCompleted = false;
            try {
              const details = await actions.order.capture();
              if (details.status && details.status !== "COMPLETED") {
                throw new Error(`PayPal devolvió el estado de captura ${details.status}.`);
              }
              captureCompleted = true;
              updateStatus("registering");
              await onCaptureRef.current(details);
              updateStatus("completed");
            } catch (error: unknown) {
              updateStatus("error");
              const message = error instanceof Error && error.message.trim()
                ? error.message
                : captureCompleted
                  ? "No se pudo registrar el pedido después del pago."
                  : "Error desconocido de PayPal.";
              onErrorRef.current(
                captureCompleted
                  ? new Error(message)
                  : new Error(`No se pudo capturar el pago en PayPal. ${message}`),
              );
            } finally {
              captureInProgressRef.current = false;
              operationInProgressRef.current = false;
            }
          },
          onCancel: () => {
            captureInProgressRef.current = false;
            operationInProgressRef.current = false;
            updateStatus("cancelled");
            onCancelRef.current();
          },
          onError: (error: unknown) => {
            captureInProgressRef.current = false;
            operationInProgressRef.current = false;
            updateStatus("error");
            onErrorRef.current(error);
          },
        });

        if (buttons.isEligible && !buttons.isEligible()) {
          throw new Error("Los botones de PayPal no están disponibles para esta cuenta.");
        }

        buttonRef.current = buttons;
        return buttons.render(container);
      })
      .then(() => {
        if (!disposed) updateStatus("ready");
      })
      .catch((error: unknown) => {
        if (disposed) return;
        operationInProgressRef.current = false;
        updateStatus("error");
        onErrorRef.current(error);
      });

    return () => {
      disposed = true;
      captureInProgressRef.current = false;
      operationInProgressRef.current = false;
      const button = buttonRef.current;
      buttonRef.current = null;
      void button?.close?.();
      container.replaceChildren();
    };
  }, [currency]);

  const clientIdMissing = !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();

  return (
    <div className="flex flex-col gap-3">
      <div ref={containerRef} className="min-h-12" aria-live="polite" />
      {clientIdMissing ? (
        <p className="text-amber-200 text-sm" role="alert">
          Falta configurar NEXT_PUBLIC_PAYPAL_CLIENT_ID para usar PayPal Sandbox.
        </p>
      ) : null}
      {status === "loading" ? (
        <p className="text-white/60 text-sm">Cargando PayPal Sandbox...</p>
      ) : null}
      {status === "approving" ? (
        <p className="text-white/60 text-sm">Esperando la aprobación de PayPal...</p>
      ) : null}
      {status === "capturing" || status === "registering" ? (
        <p className="text-white/60 text-sm">Procesando el pago de prueba...</p>
      ) : null}
      {status === "cancelled" ? (
        <p className="text-amber-200 text-sm" role="status">
          Pago cancelado. Puedes reintentar con el botón de PayPal.
        </p>
      ) : null}
      {status === "error" && !clientIdMissing ? (
        <p className="text-red-300 text-sm" role="status">
          No se completó el pago de prueba. Revisa el mensaje anterior y vuelve a intentarlo.
        </p>
      ) : null}
    </div>
  );
}
