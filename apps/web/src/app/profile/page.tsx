"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import { getToken, clearToken } from "@/features/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthenticatedOnly } from "@/features/auth";
import { WeightUpdateSection } from "@/features/weight-tracker";
import NumericInput from "@/shared/components/NumericInput";

type Profile = {
  id: number;
  nombre: string;
  correo: string;
  edad: number;
  peso: string | number;
  altura: string | number;
  sexo: string;
  nivel_actividad: string;
  objetivo: string;
  created_at: string;
};

type HistoryItem = {
  created_at: string;
  objetivo: string;
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  imagen_url: string | null;
  descripcion: string;
};

const OBJETIVOS = [
  { value: "ganar_masa_muscular", label: "Hipertrofia (Ganar Masa)" },
  { value: "perder_grasa", label: "Reducción de Grasa (Definición)" },
  { value: "recomposicion_corporal", label: "Recomposición Corporal" },
  { value: "resistencia", label: "Resistencia y Estamina" },
  { value: "definicion", label: "Definición Muscular" },
  { value: "rendimiento", label: "Rendimiento Máximo" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const token = getToken();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [errorCalibration, setErrorCalibration] = useState<string | null>(null);
  const [errorSecurity, setErrorSecurity] = useState<string | null>(null);
  const [successCalibration, setSuccessCalibration] = useState(false);
  const [successSecurity, setSuccessSecurity] = useState(false);
  const [formPassword, setFormPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    edad: 25,
    peso: 75,
    altura: 1.75,
    sexo: "M" as "M" | "F" | "Otro",
    nivelActividad: "media",
    objetivo: "ganar_masa_muscular",
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      apiFetch<{ user: Profile }>("/api/users/profile", { token }),
      apiFetch<{ history: HistoryItem[] }>("/api/recommendations/history", { token })
    ])
      .then(([p, h]) => {
        setProfile(p.user);
        setHistory(h.history);
        setForm({
          nombre: p.user.nombre,
          edad: Number(p.user.edad),
          peso: Number(p.user.peso),
          altura: Number(p.user.altura),
          sexo: p.user.sexo as "M" | "F" | "Otro",
          nivelActividad: p.user.nivel_actividad,
          objetivo: p.user.objetivo,
        });
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Error al cargar perfil";
        setErrorCalibration(msg);
        clearToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router, token]);

  const handleCalibrationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorCalibration(null);
    setSuccessCalibration(false);

    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre,
        edad: form.edad,
        altura: form.altura,
        sexo: form.sexo,
        nivelActividad: form.nivelActividad,
        objetivo: form.objetivo,
      };

      const updated = await apiFetch<{ user: Profile }>("/api/users/profile", {
        token,
        method: "PUT",
        body: payload,
      });
      setProfile(updated.user);
      setSuccessCalibration(true);
      setTimeout(() => setSuccessCalibration(false), 3000);
    } catch (e: unknown) {
      setErrorCalibration(e instanceof Error ? e.message : "Error al guardar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPassword.trim()) return;
    setSavingPw(true);
    setErrorSecurity(null);
    setSuccessSecurity(false);

    try {
      const payload = {
        nombre: form.nombre, // needs required fields too since it's a PUT
        edad: form.edad,
        peso: form.peso,
        altura: form.altura,
        sexo: form.sexo,
        nivelActividad: form.nivelActividad,
        objetivo: form.objetivo,
        password: formPassword.trim()
      };

      await apiFetch<{ user: Profile }>("/api/users/profile", {
        token,
        method: "PUT",
        body: payload,
      });
      setSuccessSecurity(true);
      setFormPassword("");
      setTimeout(() => setSuccessSecurity(false), 3000);
    } catch (e: unknown) {
      setErrorSecurity(e instanceof Error ? e.message : "Error al actualizar contraseña");
    } finally {
      setSavingPw(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "SF";
  };

  if (loading) {
    return (
      <main className="flex-1 min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#baff2e] border-t-transparent animate-spin"></div>
      </main>
    );
  }

  return (
    <AuthenticatedOnly>
      <main className="flex-1 min-h-screen bg-[#0a0a0a] relative overflow-hidden flex flex-col">
        
        {/* Decorative Grid & Glow Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[60%] bg-[#baff2e]/5 blur-[200px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 w-full h-screen overflow-y-auto custom-scrollbar relative z-10 px-4 md:px-12 lg:px-16 py-10 md:py-16 scroll-smooth">
           <div className="max-w-5xl mx-auto flex flex-col gap-8 md:gap-12 animate-fade-in-up">
              
              {/* Top Header Card */}
              <GlassCard className="p-8 md:p-10 rounded-[2.5rem] bg-[#111]/80 border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                 {/* Decorative background glow inside header */}
                 <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 w-64 h-64 bg-[#baff2e]/10 blur-[80px] rounded-full pointer-events-none"></div>

                 <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border border-white/10 bg-black relative flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden p-1">
                    <div className="w-full h-full rounded-full border border-[#baff2e]/50 border-dashed animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-white text-3xl">
                       {profile ? getInitials(profile.nombre) : "EX"}
                    </div>
                 </div>

                 <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-white font-black text-4xl md:text-5xl tracking-tight mb-4">{profile?.nombre}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                       <span className="px-3 py-1 rounded bg-[#baff2e]/20 text-[#baff2e] border border-[#baff2e]/30 text-[10px] font-black uppercase tracking-widest">
                         {profile?.objetivo ? profile.objetivo.replace(/_/g, ' ') : 'Atleta Élite'}
                       </span>
                       <span className="px-3 py-1 rounded bg-white/5 text-white/50 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                         Actividad: {profile?.nivel_actividad ? profile.nivel_actividad.replace(/_/g, ' ') : 'N/A'}
                       </span>
                    </div>
                    <Link
                      href="/planes"
                      className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl border border-[#baff2e]/30 bg-[#baff2e]/10 text-[#baff2e] text-[10px] font-black uppercase tracking-widest hover:bg-[#baff2e]/20 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                      </svg>
                      Ver planes
                    </Link>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
                      <strong>Edad:</strong> {profile?.edad ?? '-'} años &nbsp;&middot;&nbsp; 
                      <strong>Peso:</strong> {profile?.peso ?? '-'} kg &nbsp;&middot;&nbsp; 
                      <strong>Altura:</strong> {profile?.altura ?? '-'} m &nbsp;&middot;&nbsp; 
                      <strong>Sexo:</strong> {profile?.sexo === 'M' ? 'Hombre' : profile?.sexo === 'F' ? 'Mujer' : 'Otro'}<br/>
                      Optimizando el rendimiento metabólico máximo a través de protocolos basados en datos y precisión en la suplementación.
                    </p>
                 </div>

                 <div className="hidden lg:flex flex-col gap-4 pl-8 border-l border-white/5">
                    <div>
                      <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Rango Global</div>
                      <div className="text-white font-black text-3xl">#142</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Puntaje Recuperación</div>
                      <div className="text-[#baff2e] font-black text-3xl">94%</div>
                    </div>
                 </div>
              </GlassCard>

              {/* Physical Progression Canvas */}
              <GlassCard className="p-8 md:p-10 rounded-[2.5rem] bg-[#111]/80 border-white/5">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-white font-bold text-xl md:text-2xl mb-1">Panel de Progresión Física</h2>
                      <p className="text-white/50 text-xs">Análisis comparativo de masa muscular vs. índice de grasa corporal.</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 text-[10px] font-bold uppercase tracking-wider">
                      Mes
                    </div>
                 </div>

                 {/* Simulated Graph Area */}
                 <div className="w-full h-48 md:h-64 relative border-b border-white/5 mt-6 mb-6 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                      {/* Grid lines */}
                      <path d="M0,50 L1000,50 M0,100 L1000,100 M0,150 L1000,150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                      {/* Muscle Mass Line (Green) */}
                      <path d="M0,180 Q250,160 500,100 T1000,20" fill="none" stroke="#baff2e" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(186,255,46,0.5)]" />
                      {/* Glow underneath green line */}
                      <path d="M0,180 Q250,160 500,100 T1000,20 L1000,200 L0,200 Z" fill="url(#canvasGlow)" opacity="0.1" />
                      {/* Body Fat Line (Blue/Dashed) */}
                      <path d="M0,40 Q300,70 600,150 T1000,180" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                      
                      <defs>
                        <linearGradient id="canvasGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#baff2e" />
                          <stop offset="100%" stopColor="#baff2e" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                       <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Crecimiento</div>
                       <div className="text-[#baff2e] font-black text-xl mb-1">+4.2kg</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                       <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Grasa Reducida</div>
                       <div className="text-sky-400 font-black text-xl mb-1">-2.1%</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                       <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Potencia Max (W)</div>
                       <div className="text-white font-black text-xl mb-1">1,240</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                       <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Variación Diario</div>
                       <div className="text-white font-black text-xl mb-1">1.8%</div>
                    </div>
                 </div>
              </GlassCard>

              {token && profile ? (
                <WeightUpdateSection
                  token={token}
                  pesoActual={Number(profile.peso)}
                  onUpdated={(peso) => {
                    setProfile((p) => (p ? { ...p, peso } : p));
                    setForm((f) => ({ ...f, peso }));
                  }}
                />
              ) : null}

              {/* Split Cards: Calibration & Security */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 
                 {/* Athlete Calibration (Profile Form) */}
                 <GlassCard className="p-8 rounded-[2.5rem] bg-[#111]/80 border-white/5 flex flex-col">
                    <div className="mb-8">
                      <h2 className="text-white font-bold text-2xl">Datos personales</h2>
                      <p className="text-white/50 text-xs mt-1">
                        Puedes editar o eliminar tu información en cualquier momento.
                      </p>
                    </div>

                    {errorCalibration ? <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl mb-6 text-xs">{errorCalibration}</div> : null}
                    {successCalibration ? <div className="text-[#baff2e] bg-[#baff2e]/10 border border-[#baff2e]/20 p-3 rounded-xl mb-6 text-xs">Perfil actualizado exitosamente.</div> : null}

                    <form onSubmit={handleCalibrationSave} className="flex-1 flex flex-col">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Nombre Completo</span>
                          <input
                            required
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#baff2e]/50 transition-colors"
                            value={form.nombre}
                            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Correo Electrónico</span>
                          <input
                            disabled
                            className="w-full bg-[#151515] border border-white/5 rounded-xl px-4 py-3 text-white/40 text-sm outline-none"
                            value={profile?.correo ?? ""}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Objetivo Físico</span>
                          <div className="relative">
                            <select
                              className="w-full appearance-none bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#baff2e]/50 transition-colors pr-10"
                              value={form.objetivo}
                              onChange={e => setForm(p => ({ ...p, objetivo: e.target.value }))}
                            >
                              {OBJETIVOS.map(obj => (
                                <option key={obj.value} value={obj.value}>{obj.label}</option>
                              ))}
                            </select>
                            <svg className="w-4 h-4 text-white/40 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Nivel de Actividad</span>
                          <div className="relative">
                            <select
                              className="w-full appearance-none bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#baff2e]/50 transition-colors pr-10"
                              value={form.nivelActividad}
                              onChange={e => setForm(p => ({ ...p, nivelActividad: e.target.value }))}
                            >
                              <option value="sedentario">Sedentario</option>
                              <option value="ligera">Ligero</option>
                              <option value="media">Moderado</option>
                              <option value="activa">Activo</option>
                              <option value="muy_activa">Muy Activo</option>
                            </select>
                            <svg className="w-4 h-4 text-white/40 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Sexo Biológico</span>
                          <div className="relative">
                            <select
                              className="w-full appearance-none bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#baff2e]/50 transition-colors pr-10"
                              value={form.sexo}
                              onChange={e => setForm(p => ({ ...p, sexo: e.target.value as "M" | "F" | "Otro" }))}
                            >
                              <option value="M">Hombre</option>
                              <option value="F">Mujer</option>
                              <option value="Otro">Otro</option>
                            </select>
                            <svg className="w-4 h-4 text-white/40 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </label>
                        <div className="flex flex-col gap-2 justify-end">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Peso actual</span>
                          <div className="w-full bg-[#151515] border border-[#baff2e]/20 rounded-xl px-4 py-3 text-[#baff2e] text-sm font-bold">
                            {Number(profile?.peso ?? form.peso).toFixed(1)} kg
                            <span className="text-white/40 font-normal text-xs ml-2">— actualízalo arriba</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                         <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Edad</span>
                          <NumericInput
                            required
                            allowDecimal={false}
                            min={10}
                            max={120}
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#baff2e]/50 transition-colors"
                            value={form.edad}
                            onChange={(edad) => setForm((p) => ({ ...p, edad }))}
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-white/40 text-[9px] font-black uppercase tracking-widest pl-1">Altura (M)</span>
                          <NumericInput
                            required
                            min={0.8}
                            max={2.5}
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#baff2e]/50 transition-colors"
                            value={form.altura}
                            onChange={(altura) => setForm((p) => ({ ...p, altura }))}
                          />
                        </label>
                      </div>

                      <button disabled={saving} className="mt-auto self-start bg-[#baff2e] hover:bg-[#a3e622] disabled:opacity-50 text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(186,255,46,0.15)] flex items-center gap-2">
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </form>
                 </GlassCard>

                 {/* Access & Security */}
                 <GlassCard className="p-8 rounded-[2.5rem] bg-[#111]/80 border-white/5 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-8 w-8 rounded-lg bg-[#baff2e]/20 text-[#baff2e] flex items-center justify-center border border-[#baff2e]/30">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                      <h2 className="text-white font-bold text-2xl">Acceso y Seguridad</h2>
                    </div>

                    <p className="text-white/50 text-xs mb-6">
                      <Link href="/privacidad" className="text-[#baff2e] underline">
                        Política de privacidad
                      </Link>
                      {" · "}
                      <Link href="/orders" className="text-[#baff2e] underline">
                        Mis pedidos
                      </Link>
                    </p>

                    <div className="border-t border-white/5 pt-6 mt-auto">
                      <div className="text-white/60 font-bold text-sm mb-4">Actualizar Contraseña</div>

                      {errorSecurity ? <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl mb-4 text-xs">{errorSecurity}</div> : null}
                      {successSecurity ? <div className="text-[#baff2e] bg-[#baff2e]/10 border border-[#baff2e]/20 p-3 rounded-xl mb-4 text-xs">Contraseña actualizada exitosamente.</div> : null}

                      <form onSubmit={handlePasswordSave} className="flex gap-3">
                         <input
                           type="password"
                           placeholder="Ingresa nueva contraseña..."
                           className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/20 transition-colors"
                           value={formPassword}
                           onChange={(e) => setFormPassword(e.target.value)}
                         />
                         <button disabled={savingPw || !formPassword.trim()} className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                           {savingPw ? "..." : "Actualizar"}
                         </button>
                      </form>
                      <div className="mt-8 pt-6 border-t border-red-400/20">
                        <p className="text-white/60 text-xs mb-3">
                          Eliminar cuenta borra pedidos, recomendaciones y seguimiento asociados.
                        </p>
                        <button
                          type="button"
                          disabled={deleting}
                          className="text-red-400 border border-red-400/30 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-red-400/10 disabled:opacity-50"
                          onClick={async () => {
                            if (!confirm("¿Eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.")) return;
                            setDeleting(true);
                            try {
                              await apiFetch("/api/users/profile", { method: "DELETE", token });
                              clearToken();
                              router.push("/");
                            } catch (e: unknown) {
                              setErrorSecurity(e instanceof Error ? e.message : "Error al eliminar");
                            } finally {
                              setDeleting(false);
                            }
                          }}
                        >
                          {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
                        </button>
                      </div>
                    </div>
                 </GlassCard>

              </div>

              {/* Stack History */}
              <GlassCard className="p-8 md:p-10 rounded-[2.5rem] bg-[#111]/80 border-white/5">
                 <h2 className="text-white font-bold text-2xl mb-8">Historial de Suplementación</h2>

                 {history.length > 0 ? (
                   <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="pb-4 text-white/40 text-[9px] font-black uppercase tracking-widest pl-2">Suplemento Recomendado</th>
                        <th className="pb-4 text-white/40 text-[9px] font-black uppercase tracking-widest hidden md:table-cell">Fecha de Implementación</th>
                        <th className="pb-4 text-white/40 text-[9px] font-black uppercase tracking-widest text-right pr-2">Bio-Efectividad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {history.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="group">
                          <td className="py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 p-2 text-white/30 group-hover:bg-white/10 group-hover:text-[#baff2e] transition-colors">
                                {item.imagen_url ? (
                                  <Image src={item.imagen_url} alt={item.nombre} width={40} height={40} className="h-full w-full object-contain" />
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                )}
                              </div>
                              <div>
                                <Link href={`/supplements/${item.id}`} className="text-white font-bold group-hover:text-[#baff2e] transition-colors text-sm md:text-base">
                                  {item.nombre}
                                </Link>
                                <div className="text-white/40 text-[10px] mt-1 line-clamp-1 max-w-sm">{item.descripcion}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 hidden md:table-cell">
                            <div className="text-white/70 font-semibold text-xs">
                              {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </td>
                          <td className="py-6 text-right">
                             <div className="flex justify-end gap-1 text-[#baff2e] opacity-80">
                               {[1,2,3,4,5].map(star => (
                                 <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                               ))}
                             </div>
                             <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">{item.objetivo.replace(/_/g, ' ')}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                 ) : (
                   <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                     <svg className="w-10 h-10 text-white/20 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                     <div className="text-white/50 text-sm font-semibold">Aún no hay biotelemetría implementada.</div>
                   </div>
                 )}
              </GlassCard>

           </div>
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
