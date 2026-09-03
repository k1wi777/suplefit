"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import NumericInput from "@/shared/components/NumericInput";

export type AdminProductCategory = {
  id: number;
  nombre: string;
  slug: string;
};

export type AdminProductForm = {
  id: number | undefined;
  nombre: string;
  descripcion: string;
  beneficios: string;
  modoUso: string;
  advertencias: string;
  imagenUrl: string;
  categoriaSlug: string;
  precio: number;
  stock: number;
};

export type AdminProductModalProps = {
  open: boolean;
  mode: "create" | "edit";
  form: AdminProductForm;
  categories: AdminProductCategory[];
  saving: boolean;
  error: string | null;
  onChange: (update: (form: AdminProductForm) => AdminProductForm) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRequestClose: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
};

const TABS = [
  { id: "general", label: "Datos generales" },
  { id: "stock", label: "Stock y logística" },
  { id: "nutrition", label: "Protocolo-nutrición" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">{children}</span>;
}

export default function AdminProductModal({
  open,
  mode,
  form,
  categories,
  saving,
  error,
  onChange,
  onSubmit,
  onRequestClose,
  returnFocusRef,
}: AdminProductModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const savingRef = useRef(saving);
  const [activeTab, setActiveTab] = useState<TabId>("general");

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = returnFocusRef?.current;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !savingRef.current) onRequestClose();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open, onRequestClose, returnFocusRef]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setActiveTab(TABS[nextIndex].id);
    document.getElementById(`admin-product-tab-${TABS[nextIndex].id}`)?.focus();
  }

  const title = mode === "create" ? "Nuevo suplemento" : "Editar suplemento";
  const description =
    mode === "create"
      ? "Completa la ficha del producto para incorporarlo al catálogo."
      : `Actualiza la información del suplemento${form.id ? ` · ID #${form.id}` : ""}.`;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label="Cerrar formulario de producto"
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
        onClick={() => {
          if (!saving) onRequestClose();
        }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111]/[.98] shadow-[0_24px_100px_rgba(0,0,0,0.7),0_0_50px_rgba(186,255,46,0.06)] sm:max-h-[calc(100dvh-3rem)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-7">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#baff2e] shadow-[0_0_10px_rgba(186,255,46,0.8)]" />
              <span className="text-[#baff2e] text-[9px] font-black uppercase tracking-[0.2em]">Catálogo admin</span>
            </div>
            <h2 id={titleId} className="text-white text-xl font-black tracking-tight sm:text-2xl">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-white/45">
              {description}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Cerrar formulario de producto"
            disabled={saving}
            onClick={onRequestClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="shrink-0 overflow-x-auto overflow-y-hidden border-b border-white/[0.08] px-5 sm:px-7">
          <div className="flex min-w-max gap-1" role="tablist" aria-label="Secciones del producto">
            {TABS.map((tab, index) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-product-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`admin-product-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`relative shrink-0 px-3 py-4 text-[10px] font-black uppercase tracking-widest transition sm:px-4 ${
                    selected ? "text-[#baff2e]" : "text-white/40 hover:text-white/75"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#baff2e] transition-opacity ${
                      selected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 custom-scrollbar sm:px-7">
            <div
              id="admin-product-panel-general"
              role="tabpanel"
              aria-labelledby="admin-product-tab-general"
              hidden={activeTab !== "general"}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <FieldLabel>Nombre</FieldLabel>
                  <input
                    className="admin-input"
                    value={form.nombre}
                    onChange={(event) => onChange((current) => ({ ...current, nombre: event.target.value }))}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <FieldLabel>Categoría</FieldLabel>
                  <select
                    className="admin-input"
                    value={form.categoriaSlug}
                    onChange={(event) => onChange((current) => ({ ...current, categoriaSlug: event.target.value }))}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug} className="bg-[#111]">
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <FieldLabel>Precio</FieldLabel>
                  <NumericInput
                    allowDecimal
                    min={0}
                    className="admin-input"
                    value={form.precio}
                    onChange={(precio) => onChange((current) => ({ ...current, precio }))}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <FieldLabel>Descripción</FieldLabel>
                  <textarea
                    rows={4}
                    className="admin-input resize-none"
                    value={form.descripcion}
                    onChange={(event) => onChange((current) => ({ ...current, descripcion: event.target.value }))}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <FieldLabel>Imagen URL</FieldLabel>
                  <input
                    className="admin-input text-sm"
                    value={form.imagenUrl}
                    onChange={(event) => onChange((current) => ({ ...current, imagenUrl: event.target.value }))}
                    placeholder="https://..."
                  />
                </label>
              </div>
            </div>

            <div
              id="admin-product-panel-stock"
              role="tabpanel"
              aria-labelledby="admin-product-tab-stock"
              hidden={activeTab !== "stock"}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-[#baff2e]/15 bg-[#baff2e]/[.04] p-4">
                <p className="text-[#baff2e] text-[10px] font-black uppercase tracking-widest">Disponibilidad</p>
                <p className="mt-1 text-sm leading-relaxed text-white/45">
                  Controla las unidades disponibles que se mostrarán en el catálogo.
                </p>
              </div>
              <label className="flex max-w-xs flex-col gap-1.5">
                <FieldLabel>Stock</FieldLabel>
                <NumericInput
                  allowDecimal={false}
                  min={0}
                  className="admin-input"
                  value={form.stock}
                  onChange={(stock) => onChange((current) => ({ ...current, stock }))}
                  required
                />
              </label>
            </div>

            <div
              id="admin-product-panel-nutrition"
              role="tabpanel"
              aria-labelledby="admin-product-tab-nutrition"
              hidden={activeTab !== "nutrition"}
              className="space-y-5"
            >
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Beneficios</FieldLabel>
                <textarea
                  rows={5}
                  className="admin-input resize-none text-sm"
                  value={form.beneficios}
                  onChange={(event) => onChange((current) => ({ ...current, beneficios: event.target.value }))}
                  placeholder="Título: descripción (una línea por ítem)"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Modo de uso</FieldLabel>
                <textarea
                  rows={4}
                  className="admin-input resize-none text-sm"
                  value={form.modoUso}
                  onChange={(event) => onChange((current) => ({ ...current, modoUso: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel>Advertencias</FieldLabel>
                <textarea
                  rows={4}
                  className="admin-input resize-none text-sm"
                  value={form.advertencias}
                  onChange={(event) => onChange((current) => ({ ...current, advertencias: event.target.value }))}
                />
              </label>
            </div>
          </div>

          <footer className="border-t border-white/[0.08] bg-[#111]/[.98] px-5 py-4 sm:px-7">
            {error ? (
              <p role="alert" className="mb-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={onRequestClose}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#baff2e] px-5 py-3 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_28px_rgba(186,255,46,0.25)] transition hover:bg-[#d4ff63] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Guardando..." : mode === "create" ? "Guardar suplemento" : "Actualizar suplemento"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
