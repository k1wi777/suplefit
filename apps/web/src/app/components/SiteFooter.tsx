"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/shared/components/BrandLogo";
import { apiFetch } from "@/shared/lib/api";
import { AUTH_CHANGED_EVENT, getToken, isAuthSession, type AuthState } from "@/features/auth";

type FooterLink = { href: string; label: string };

const PUBLIC_EXPLORE_LINKS: FooterLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Catálogo" },
  { href: "/planes", label: "Planes" },
  { href: "/cart", label: "Carrito" },
];

const AUTH_EXPLORE_LINKS: FooterLink[] = [
  { href: "/catalog", label: "Catálogo" },
  { href: "/planes", label: "Planes" },
  { href: "/cart", label: "Carrito" },
];

const ACCOUNT_LINKS: FooterLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Perfil" },
  { href: "/orders", label: "Mis pedidos" },
  { href: "/performance", label: "Rendimiento" },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: "/terminos", label: "Términos de uso" },
  { href: "/privacidad", label: "Política de privacidad" },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 mb-4">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-slate-400 transition-colors hover:text-slate-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let active = true;
    const refresh = () => {
      const token = getToken();
      if (!token) {
        setAuthState("anonymous");
        return;
      }
      setAuthState("loading");
      apiFetch<unknown>("/api/auth/me", { token })
        .then((data: unknown) => {
          if (!active) return;
          const session = isAuthSession(data) ? data : null;
          setAuthState(session ? (session.isAdmin ? "admin" : "user") : "invalid");
        })
        .catch(() => {
          if (active) setAuthState("invalid");
        });
    };
    refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const exploreLinks = authState === "user" ? AUTH_EXPLORE_LINKS : authState === "anonymous" ? PUBLIC_EXPLORE_LINKS : [];

  return (
    <footer className="mt-auto relative border-t border-slate-700/60 bg-gradient-to-b from-[#0b1018] via-[#080c12] to-[#050709] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-1/3 w-[480px] h-[480px] bg-indigo-500/[0.08] blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-slate-600/[0.12] blur-[110px] rounded-full" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4">
            <BrandLogo />
            <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-sm">
              Plataforma de acompañamiento fitness: catálogo de suplementos, seguimiento de hábitos y
              recomendaciones orientativas según tu perfil. Sin promesas médicas.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-600/50 bg-slate-800/40 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Bienestar responsable
              </span>
            </div>
          </div>

          {exploreLinks.length > 0 ? (
            <div className="lg:col-span-2 lg:col-start-6">
              <FooterColumn title="Explorar" links={exploreLinks} />
            </div>
          ) : null}

          {authState === "user" ? (
            <div className="lg:col-span-2">
              <FooterColumn title="Tu espacio" links={ACCOUNT_LINKS} />
            </div>
          ) : null}

          <div className={`lg:col-span-2 ${authState === "user" ? "" : "lg:col-start-8"}`}>
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
            {authState === "anonymous" ? (
              <ul className="mt-6 space-y-2.5">
                <li>
                  <Link href="/login" className="text-sm text-slate-400 transition-colors hover:text-slate-200">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-slate-400 transition-colors hover:text-slate-200">
                    Crear cuenta
                  </Link>
                </li>
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
            <strong className="text-slate-400">Aviso importante:</strong> Las recomendaciones de SupleFit
            son orientativas y no sustituyen la valoración de un nutricionista, médico o profesional del
            deporte. Consulta a un especialista si tienes condiciones de salud o tomas medicación.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-500">
            <p>© {year} SupleFit. Todos los derechos reservados.</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/terminos" className="hover:text-slate-300 transition-colors">
                Términos
              </Link>
              <span className="hidden sm:inline text-slate-700" aria-hidden>
                ·
              </span>
              <Link href="/privacidad" className="hover:text-slate-300 transition-colors">
                Privacidad
              </Link>
              <span className="hidden sm:inline text-slate-700" aria-hidden>
                ·
              </span>
              <span>Versión 1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
