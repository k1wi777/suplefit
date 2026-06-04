"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearToken, getToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import NumericInput from "@/components/NumericInput";

type Category = {
  id: number;
  nombre: string;
  slug: string;
};

type Supplement = {
  id: number;
  nombre: string;
  descripcion: string;
  beneficios: string | null;
  modo_uso: string | null;
  advertencias: string | null;
  imagen_url: string | null;
  categoria_id?: number;
  categoriaSlug?: string;
  categoriaNombre?: string;
  precio: string;
  stock: number;
};

function ProductPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-white/25">
      <svg width="40" height="48" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="7" y="2" width="10" height="4" rx="1" />
        <path d="M9 6h6v18a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6z" />
        <path d="M9 12h6M9 16h6" strokeLinecap="round" />
      </svg>
      <span className="text-[9px] font-black uppercase tracking-widest">Suplemento</span>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const token = getToken();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Supplement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [form, setForm] = useState({
    id: undefined as number | undefined,
    nombre: "",
    descripcion: "",
    beneficios: "",
    modoUso: "",
    advertencias: "",
    imagenUrl: "",
    categoriaSlug: "creatina",
    precio: 0,
    stock: 0,
  });

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [search]);

  async function load() {
    if (!token) return;
    const [cats, supps] = await Promise.all([
      apiFetch<{ categories: Category[] }>("/api/admin/categories", { token }),
      apiFetch<{ items: Supplement[] }>(`/api/admin/supplements${qs}`, { token }),
    ]);
    setCategories(cats.categories);
    setItems(supps.items);
  }

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    load()
      .catch((e: { message?: string }) => {
        setError(e?.message ?? "Error cargando admin");
        clearToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  function resetForm() {
    setMode("create");
    setForm({
      id: undefined,
      nombre: "",
      descripcion: "",
      beneficios: "",
      modoUso: "",
      advertencias: "",
      imagenUrl: "",
      categoriaSlug: categories[0]?.slug ?? "creatina",
      precio: 0,
      stock: 0,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        beneficios: form.beneficios,
        modoUso: form.modoUso,
        advertencias: form.advertencias,
        imagenUrl: form.imagenUrl,
        categoriaSlug: form.categoriaSlug,
        precio: Number(form.precio),
        stock: Number(form.stock),
      };
      if (mode === "create") {
        await apiFetch("/api/admin/supplements", { token, method: "POST", body });
      } else {
        if (!form.id) throw new Error("ID no definido para editar");
        await apiFetch(`/api/admin/supplements/${form.id}`, { token, method: "PUT", body });
      }
      resetForm();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar suplemento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      active="inventory"
      title="Inventario y catálogo"
      subtitle="Gestiona suplementos, stock y fichas de producto."
      actions={
        <>
          <div className="relative">
            <input
              className="admin-input w-full sm:w-64 pl-10 text-sm"
              placeholder="Buscar suplementos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl bg-[#baff2e] hover:bg-[#d4ff63] text-black font-black px-5 py-3 text-xs uppercase tracking-wide transition whitespace-nowrap"
          >
            + Nuevo producto
          </button>
        </>
      }
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(300px,380px)_1fr] gap-6 lg:gap-8">
            {/* Formulario */}
            <aside
              className="panel-gradient-admin-form rounded-2xl border border-white/[0.08] backdrop-blur-xl p-6 md:p-7 shadow-[0_12px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] xl:sticky xl:top-[5.5rem] xl:self-start"
            >
              <h2 className="text-white font-black text-xl uppercase tracking-tight">
                {mode === "create" ? "Nuevo suplemento" : "Editar suplemento"}
              </h2>
              <p className="text-white/40 text-xs mt-1 mb-6">
                {mode === "edit" ? `ID #${form.id}` : "Completa los campos y guarda"}
              </p>

              <form className="flex flex-col gap-5" onSubmit={submit}>
                <fieldset className="space-y-4">
                  <legend className="text-[#baff2e] text-[10px] font-black uppercase tracking-[0.2em] mb-3 block w-full border-b border-white/10 pb-2">
                    Datos del producto
                  </legend>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Nombre</span>
                    <input
                      className="admin-input"
                      value={form.nombre}
                      onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Categoría</span>
                    <select
                      className="admin-input"
                      value={form.categoriaSlug}
                      onChange={(e) => setForm((p) => ({ ...p, categoriaSlug: e.target.value }))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug} className="bg-[#111]">
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Precio</span>
                      <NumericInput
                        allowDecimal
                        min={0}
                        className="admin-input"
                        value={form.precio}
                        onChange={(precio) => setForm((p) => ({ ...p, precio }))}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Stock</span>
                      <NumericInput
                        allowDecimal={false}
                        min={0}
                        className="admin-input"
                        value={form.stock}
                        onChange={(stock) => setForm((p) => ({ ...p, stock }))}
                        required
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Descripción</span>
                    <textarea
                      rows={3}
                      className="admin-input resize-none"
                      value={form.descripcion}
                      onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Imagen URL</span>
                    <input
                      className="admin-input text-sm"
                      value={form.imagenUrl}
                      onChange={(e) => setForm((p) => ({ ...p, imagenUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </label>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="text-[#baff2e] text-[10px] font-black uppercase tracking-[0.2em] mb-3 block w-full border-b border-white/10 pb-2">
                    Contenido de ficha
                  </legend>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Beneficios</span>
                    <textarea
                      rows={2}
                      className="admin-input resize-none text-sm"
                      value={form.beneficios}
                      onChange={(e) => setForm((p) => ({ ...p, beneficios: e.target.value }))}
                      placeholder="Título: descripción (una línea por ítem)"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Modo de uso</span>
                    <textarea
                      rows={2}
                      className="admin-input resize-none text-sm"
                      value={form.modoUso}
                      onChange={(e) => setForm((p) => ({ ...p, modoUso: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Advertencias</span>
                    <textarea
                      rows={2}
                      className="admin-input resize-none text-sm"
                      value={form.advertencias}
                      onChange={(e) => setForm((p) => ({ ...p, advertencias: e.target.value }))}
                    />
                  </label>
                </fieldset>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-[#baff2e] hover:bg-[#d4ff63] disabled:opacity-50 text-black font-black py-4 text-sm uppercase tracking-wide shadow-[0_0_28px_rgba(186,255,46,0.35)] transition"
                  >
                    {saving
                      ? "Guardando..."
                      : mode === "create"
                        ? "Guardar suplemento"
                        : "Actualizar suplemento"}
                  </button>
                  {mode === "edit" ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full rounded-xl border border-white/15 text-white/60 hover:text-white py-2.5 text-xs font-bold uppercase tracking-wide transition"
                    >
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </form>
            </aside>

            {/* Catálogo */}
            <section className="panel-gradient-admin-catalog rounded-2xl border border-white/[0.08] backdrop-blur-xl p-6 md:p-7 shadow-[0_12px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] min-h-[400px]">
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-white font-black text-2xl md:text-3xl tracking-tight">Catálogo</h2>
                  <p className="text-white/40 text-sm mt-1">
                    {loading ? "Cargando..." : `${items.length} suplementos registrados`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 aspect-[3/4] animate-pulse"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-white/45 text-sm">
                  No hay suplementos. Crea el primero con el formulario.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {items.map((s) => (
                    <article
                      key={s.id}
                      className={`admin-product-card group rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:border-[#baff2e]/30 hover:shadow-[0_8px_32px_rgba(186,255,46,0.12)] ${
                        mode === "edit" && form.id === s.id
                          ? "border-[#baff2e]/50 ring-1 ring-[#baff2e]/30"
                          : "border-white/10"
                      }`}
                    >
                      <div className="aspect-square bg-black/50 border-b border-white/10 relative overflow-hidden">
                        {s.imagen_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.imagen_url}
                            alt={s.nombre}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-white/[0.04] to-black/60">
                            <ProductPlaceholder />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 border border-[#baff2e]/25 text-[#baff2e] text-[8px] font-black uppercase tracking-widest backdrop-blur-sm">
                          {s.categoriaNombre ?? s.categoriaSlug ?? "—"}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-white font-black text-sm leading-snug line-clamp-2 group-hover:text-[#baff2e] transition-colors">
                          {s.nombre}
                        </h3>
                        <p className="text-[#baff2e] font-black text-lg mt-2 tracking-tight">
                          ${Number(s.precio).toFixed(2)}
                        </p>
                        <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mt-1">
                          {s.categoriaNombre ?? s.categoriaSlug}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.stock > 0 ? "bg-[#baff2e]" : "bg-red-400"}`}
                          />
                          <span className="text-white/50 text-xs">Stock: {s.stock}</span>
                        </div>

                        <div className="mt-auto flex gap-2 pt-4">
                          <button
                            type="button"
                            className="flex-1 rounded-xl bg-[#baff2e] hover:bg-[#d4ff63] text-black text-xs font-black py-2.5 uppercase tracking-wide transition"
                            onClick={() => {
                              setMode("edit");
                              setForm({
                                id: s.id,
                                beneficios: s.beneficios ?? "",
                                modoUso: s.modo_uso ?? "",
                                advertencias: s.advertencias ?? "",
                                imagenUrl: s.imagen_url ?? "",
                                categoriaSlug:
                                  s.categoriaSlug ??
                                  categories.find((c) => c.id === s.categoria_id)?.slug ??
                                  "creatina",
                                nombre: s.nombre,
                                descripcion: s.descripcion,
                                precio: Number(s.precio),
                                stock: s.stock,
                              });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-white/15 bg-black/30 hover:bg-red-500/15 hover:border-red-400/30 text-white/80 hover:text-red-300 text-xs font-bold px-3 py-2.5 transition"
                            onClick={async () => {
                              if (!token) return;
                              if (!confirm(`¿Eliminar "${s.nombre}"?`)) return;
                              try {
                                await apiFetch(`/api/admin/supplements/${s.id}`, {
                                  token,
                                  method: "DELETE",
                                });
                                await load();
                              } catch (e: unknown) {
                                setError(e instanceof Error ? e.message : "Error al eliminar");
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
      </div>
    </AdminShell>
  );
}
