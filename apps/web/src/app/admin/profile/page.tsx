"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminOnly, getToken } from "@/features/auth";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";

type AdminProfile = {
  nombre: string;
  correo: string;
  edad?: number | null;
  peso?: number | string | null;
  altura?: number | string | null;
  sexo?: string | null;
  nivel_actividad?: string | null;
  nivelActividad?: string | null;
  objetivo?: string | null;
  created_at?: string | null;
  createdAt?: string | Date | null;
};

type ProfileResponse = { user: AdminProfile };

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SF";
}

function formatNumber(value: number | string | null | undefined, suffix: string) {
  if (value === null || value === undefined || value === "") return "No disponible";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "No disponible";
  return `${numberValue.toLocaleString("es-CO", { maximumFractionDigits: 2 })} ${suffix}`;
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "No disponible";
  const labels: Record<string, string> = {
    M: "Masculino",
    F: "Femenino",
    Otro: "Otro",
  };
  return labels[value] ?? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

const PASSWORD_RULES = [
  { label: "8 caracteres como mínimo", test: (value: string) => value.length >= 8 },
  { label: "Una letra mayúscula", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Una letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { label: "Un número", test: (value: string) => /\d/.test(value) },
  { label: "Un símbolo", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    apiFetch<ProfileResponse>("/api/users/profile", { token })
      .then((data) => {
        setProfile(data.user);
        setNombre(data.user.nombre);
      })
      .catch((error: unknown) => {
        setNameError(error instanceof Error ? error.message : "No se pudo cargar la cuenta");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = nombre.trim();
    setNameError(null);
    setNameMessage(null);
    if (value.length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?next=/admin/profile");
      return;
    }

    setSavingName(true);
    try {
      const data = await apiFetch<ProfileResponse>("/api/users/profile", {
        token,
        method: "PUT",
        body: { nombre: value },
      });
      setProfile((current) => ({ ...(current ?? data.user), nombre: data.user.nombre }));
      setNombre(data.user.nombre);
      setNameMessage("Nombre actualizado correctamente.");
    } catch (error: unknown) {
      setNameError(error instanceof Error ? error.message : "No se pudo actualizar el nombre.");
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    const passwordRuleResults = PASSWORD_RULES.map(({ label, test }) => ({ label, valid: test(password) }));
    if (!passwordRuleResults.every((rule) => rule.valid)) {
      setPasswordError("La contraseña no cumple todos los requisitos de seguridad.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login?next=/admin/profile");
      return;
    }

    setSavingPassword(true);
    try {
      await apiFetch<ProfileResponse>("/api/users/profile", {
        token,
        method: "PUT",
        body: { password },
      });
      setPassword("");
      setPasswordConfirm("");
      setPasswordMessage("Contraseña actualizada correctamente.");
    } catch (error: unknown) {
      setPasswordError(error instanceof Error ? error.message : "No se pudo actualizar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  }

  const accountStatus = loading
    ? { label: "Cargando cuenta", tone: "text-white/55", dot: "bg-white/40" }
    : nameError || passwordError
      ? { label: "Revisa los cambios", tone: "text-red-300", dot: "bg-red-300" }
      : nameMessage || passwordMessage
        ? { label: "Cambios guardados", tone: "text-[#d9ff84]", dot: "bg-[#baff2e]" }
        : profile
          ? { label: "Cuenta conectada", tone: "text-[#d9ff84]", dot: "bg-[#baff2e]" }
          : { label: "Sin datos de cuenta", tone: "text-white/55", dot: "bg-white/40" };

  const displayName = profile?.nombre ?? nombre;
  const displayEmail = profile?.correo ?? "";
  const activity = profile?.nivel_actividad ?? profile?.nivelActividad;
  const passwordRuleResults = PASSWORD_RULES.map(({ label, test }) => ({ label, valid: test(password) }));
  const passwordScore = passwordRuleResults.filter((rule) => rule.valid).length;
  const passwordStrength =
    password.length === 0 ? "Sin evaluar" : passwordScore === PASSWORD_RULES.length ? "Fuerte" : passwordScore >= 3 ? "Media" : "Débil";
  const passwordStrengthTone =
    password.length === 0
      ? "text-white/45"
      : passwordScore === PASSWORD_RULES.length
        ? "text-[#d9ff84]"
        : passwordScore >= 3
          ? "text-amber-300"
          : "text-red-300";
  const passwordMatches = passwordConfirm.length > 0 && password === passwordConfirm;

  return (
    <AdminOnly>
      <main className="min-h-[calc(100vh-52px)] bg-[#080909] px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 border-b border-white/[0.08] pb-7 md:mb-10 md:pb-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#baff2e]/30 bg-[#baff2e]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#d9ff84]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#baff2e] shadow-[0_0_10px_rgba(186,255,46,0.8)]" aria-hidden="true" />
                  Cuenta administrativa
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Perfil y seguridad</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  Gestiona tu identidad y las credenciales de acceso al panel de SupleFit.
                </p>
              </div>
              <div
                className={`inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${accountStatus.tone}`}
                role="status"
                aria-live="polite"
              >
                <span className={`h-2 w-2 rounded-full ${accountStatus.dot}`} aria-hidden="true" />
                {accountStatus.label}
              </div>
            </div>
          </header>

          {loading ? (
            <div className="glass rounded-2xl border border-white/[0.08] p-6 text-sm text-white/60" role="status" aria-live="polite">
              Cargando cuenta...
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
              <aside className="h-fit">
                <GlassCard className="relative overflow-hidden border border-white/[0.1] bg-[#101111]/80 p-5 md:p-6">
                  <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#baff2e]/10 blur-3xl" aria-hidden="true" />
                  <div className="relative text-center">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#baff2e]/70 bg-[#baff2e]/10 text-3xl font-black text-[#baff2e] shadow-[0_0_28px_rgba(186,255,46,0.2)]">
                      {getInitials(displayName)}
                    </div>
                    <p className="mt-5 break-words text-lg font-black text-white">{displayName || "Administrador"}</p>
                    <p className="mt-1 break-all text-xs text-white/45">{displayEmail || "Correo no disponible"}</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/75">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.4h.9A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.73 5.2V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10c.25.6.84 1 1.5 1h.1v2.4h-.1a1.7 1.7 0 0 0-1.5 1.6Z" />
                      </svg>
                      Administrador
                    </div>
                  </div>

                  <div className="relative mt-6 border-t border-white/[0.08] pt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/45">Estado de cuenta</span>
                      <span className={`flex items-center gap-1.5 font-semibold ${accountStatus.tone}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${accountStatus.dot}`} aria-hidden="true" />
                        {accountStatus.label}
                      </span>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-white/40">
                      Esta cuenta tiene acceso al dashboard administrativo de SupleFit.
                    </p>
                  </div>
                </GlassCard>
              </aside>

              <div className="flex min-w-0 flex-col gap-6">
                <GlassCard className="border border-white/[0.1] bg-[#101111]/80 p-5 md:p-7">
                  <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#baff2e]/30 bg-[#baff2e]/10 text-[#baff2e]" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="8" r="3" />
                          <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white">Datos básicos de la cuenta</h2>
                        <p className="mt-1 text-xs leading-5 text-white/45">Actualiza el nombre que identifica tu cuenta administrativa.</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/45">Identidad</span>
                  </div>

                  {nameError ? (
                    <p className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-300" role="alert">
                      {nameError}
                    </p>
                  ) : null}
                  {nameMessage ? (
                    <p className="mt-5 rounded-xl border border-[#baff2e]/25 bg-[#baff2e]/10 p-3 text-sm text-[#d9ff84]" role="status" aria-live="polite">
                      {nameMessage}
                    </p>
                  ) : null}

                  <form onSubmit={saveName} className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="flex min-w-0 flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/55">Nombre completo</span>
                      <input
                        id="admin-profile-name"
                        required
                        minLength={2}
                        value={nombre}
                        onChange={(event) => setNombre(event.target.value)}
                        className="admin-input px-4 py-3 text-sm"
                        aria-label="Nombre completo"
                      />
                    </label>
                    <label className="flex min-w-0 flex-col gap-2">
                      <span className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-white/55">
                        Correo electrónico
                        <span className="text-[9px] font-bold normal-case tracking-normal text-[#baff2e]/80">Solo lectura</span>
                      </span>
                      <input
                        id="admin-profile-email"
                        readOnly
                        value={displayEmail}
                        className="admin-input cursor-not-allowed bg-white/[0.03] px-4 py-3 text-sm text-white/45"
                        aria-label="Correo electrónico, solo lectura"
                      />
                    </label>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        disabled={savingName}
                        type="submit"
                        className="neon-btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                        {savingName ? "Guardando..." : "Guardar nombre"}
                      </button>
                    </div>
                  </form>
                </GlassCard>

                <GlassCard className="border border-white/[0.1] bg-[#101111]/80 p-5 md:p-7">
                  <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#baff2e]/30 bg-[#baff2e]/10 text-[#baff2e]" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 10v6M12 7h.01" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white">Información personal</h2>
                        <p className="mt-1 text-xs leading-5 text-white/45">Datos registrados en tu perfil, disponibles solo para consulta.</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/45">Solo lectura</span>
                  </div>

                  <dl className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    {[
                      ["Edad", formatNumber(profile?.edad, "años")],
                      ["Peso", formatNumber(profile?.peso, "kg")],
                      ["Altura", formatNumber(profile?.altura, "m")],
                      ["Sexo", formatLabel(profile?.sexo)],
                      ["Nivel de actividad", formatLabel(activity)],
                      ["Objetivo", formatLabel(profile?.objetivo)],
                      ["Cuenta creada", formatDate(profile?.created_at ?? profile?.createdAt)],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">
                        <dt className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-white/85">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </GlassCard>

                <GlassCard className="border border-white/[0.1] bg-[#101111]/80 p-5 md:p-7">
                  <div className="flex gap-3 border-b border-white/[0.08] pb-5">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#baff2e]/30 bg-[#baff2e]/10 text-[#baff2e]" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="7.5" cy="15.5" r="3.5" />
                        <path d="m10 13 8.5-8.5a2.1 2.1 0 0 1 3 3L13 16" />
                        <path d="m16 8 2 2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Cambiar contraseña</h2>
                      <p className="mt-1 text-xs leading-5 text-white/45">Crea una contraseña segura para proteger el acceso al dashboard.</p>
                    </div>
                  </div>

                  {passwordError ? (
                    <p className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-300" role="alert">
                      {passwordError}
                    </p>
                  ) : null}
                  {passwordMessage ? (
                    <p className="mt-5 rounded-xl border border-[#baff2e]/25 bg-[#baff2e]/10 p-3 text-sm text-[#d9ff84]" role="status" aria-live="polite">
                      {passwordMessage}
                    </p>
                  ) : null}

                  <form onSubmit={savePassword} className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="flex min-w-0 flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/55">Nueva contraseña</span>
                      <input
                        id="admin-profile-password"
                        required
                        minLength={8}
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="admin-input px-4 py-3 text-sm"
                        aria-label="Nueva contraseña"
                      />
                    </label>
                    <label className="flex min-w-0 flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/55">Repetir contraseña</span>
                      <input
                        id="admin-profile-password-confirm"
                        required
                        minLength={8}
                        type="password"
                        value={passwordConfirm}
                        onChange={(event) => setPasswordConfirm(event.target.value)}
                        className="admin-input px-4 py-3 text-sm"
                        aria-label="Repetir contraseña"
                      />
                    </label>
                    <div className="sm:col-span-2 rounded-xl border border-white/[0.08] bg-black/20 p-4" aria-live="polite">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/55">Fortaleza de la contraseña</span>
                        <span className={`text-xs font-bold ${passwordStrengthTone}`}>{passwordStrength}</span>
                      </div>
                      <div className="mt-3 flex gap-1.5" aria-hidden="true">
                        {PASSWORD_RULES.map((rule, index) => (
                          <span
                            key={rule.label}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              passwordRuleResults[index].valid
                                ? "bg-[#baff2e]"
                                : password.length === 0
                                  ? "bg-white/10"
                                  : "bg-red-400/40"
                            }`}
                          />
                        ))}
                      </div>
                      <ul className="mt-4 grid gap-2 text-xs text-white/55 sm:grid-cols-2">
                        {passwordRuleResults.map((rule) => (
                          <li key={rule.label} className={`flex items-center gap-2 ${rule.valid ? "text-[#d9ff84]" : "text-white/50"}`}>
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${rule.valid ? "border-[#baff2e]/60 bg-[#baff2e]/10" : "border-white/15"}`} aria-hidden="true">
                              {rule.valid ? "✓" : "·"}
                            </span>
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                      <p className={`mt-4 text-xs ${passwordMatches ? "text-[#d9ff84]" : passwordConfirm.length > 0 ? "text-red-300" : "text-white/45"}`}>
                        {passwordMatches
                          ? "Las contraseñas coinciden."
                          : passwordConfirm.length > 0
                            ? "Las contraseñas no coinciden."
                            : "Repite la contraseña para confirmar que coincide."}
                      </p>
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        disabled={savingPassword || passwordScore !== PASSWORD_RULES.length || !passwordMatches}
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#baff2e]/60 bg-transparent px-5 py-3 text-xs font-black uppercase tracking-wider text-[#d9ff84] transition hover:bg-[#baff2e]/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M12 3a5 5 0 0 0-5 5v3H5v10h14V11h-2V8a5 5 0 0 0-5-5Z" />
                          <path d="M12 15v3" />
                        </svg>
                        {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminOnly>
  );
}
