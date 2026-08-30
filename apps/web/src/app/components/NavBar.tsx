"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { AUTH_CHANGED_EVENT, clearToken, getToken } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useCartCount } from "@/features/cart";
import BrandLogo from "@/shared/components/BrandLogo";
import ConfirmModal from "@/shared/components/ConfirmModal";

type MeResponse = {
  user: { id: number; nombre: string; objetivo: string };
  isAdmin: boolean;
};

type NavItem = { href: string; label: string; match?: (path: string) => boolean };

const PUBLIC_LINKS: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Catálogo", match: (p) => p === "/catalog" || p.startsWith("/supplements/") },
  { href: "/planes", label: "Planes" },
  { href: "/cart", label: "Carrito" },
];

const AUTH_LINKS: NavItem[] = [
  { href: "/catalog", label: "Catálogo", match: (p) => p === "/catalog" || p.startsWith("/supplements/") },
  { href: "/planes", label: "Planes" },
  { href: "/cart", label: "Carrito" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Perfil" },
  { href: "/orders", label: "Pedidos", match: (p) => p === "/orders" || p.startsWith("/orders/") },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.match) return item.match(pathname);
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  pathname,
  children,
}: {
  item: NavItem;
  pathname: string;
  children?: React.ReactNode;
}) {
  const active = isActive(pathname, item);
  return (
    <Link
      href={item.href}
      className={`relative px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors rounded-lg hover:bg-white/5 ${
        active ? "text-white" : "text-white/60 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-1.5">
        {item.label}
        {children}
      </span>
      {active ? (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#baff2e] rounded-full" />
      ) : null}
    </Link>
  );
}

function GuestAuthBadges({ pathname, className = "" }: { pathname: string; className?: string }) {
  const loginActive = pathname === "/login" || pathname.startsWith("/login/");
  const registerActive = pathname === "/register" || pathname.startsWith("/register/");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href="/login"
        className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
          loginActive
            ? "border-white/30 bg-white/10 text-white"
            : "border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
        }`}
      >
        Login
      </Link>
      <Link
        href="/register"
        className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
          registerActive ? "neon-btn ring-2 ring-[#baff2e]/40" : "neon-btn"
        }`}
      >
        Registro
      </Link>
    </div>
  );
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [token, setTokenState] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const refreshAuth = useCallback(() => {
    const t = getToken();
    setTokenState(t);
    if (!t) {
      setMe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch<MeResponse>("/api/auth/me", { token: t })
      .then((data) => setMe(data))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) refreshAuth();
    });
    const onAuth = () => {
      if (active) refreshAuth();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [refreshAuth]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMenuOpen(false);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  const isLoggedIn = Boolean(token);
  const links = isLoggedIn ? AUTH_LINKS : PUBLIC_LINKS;

  const handleLogout = () => {
    clearToken();
    setLogoutModalOpen(false);
    router.push("/login");
  };

  const navLinks = (
    <>
      {links.map((item) => (
        <NavLink key={item.href + item.label} item={item} pathname={pathname}>
          {item.href === "/cart" && cartCount > 0 ? (
            <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#baff2e] text-black text-[9px] font-black flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </NavLink>
      ))}

      {isLoggedIn && me?.isAdmin ? (
        <NavLink
          item={{
            href: "/admin/orders",
            label: "Admin",
            match: (p) => p.startsWith("/admin"),
          }}
          pathname={pathname}
        />
      ) : null}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-3">
          <div className="shrink-0">
            <BrandLogo />
          </div>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5">{navLinks}</nav>

          <div className="hidden md:flex shrink-0 items-center">
            {isLoggedIn ? (
              <button
                type="button"
                className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300 transition hover:border-red-400/50 hover:bg-red-400/20 hover:text-red-200 disabled:opacity-50"
                disabled={loading}
                onClick={() => setLogoutModalOpen(true)}
              >
                Cerrar sesión
              </button>
            ) : (
              <GuestAuthBadges pathname={pathname} />
            )}
          </div>

          <button
            type="button"
            className="md:hidden ml-auto text-white/80 p-2 rounded-lg hover:bg-white/10"
            aria-label="Menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:hidden flex-col items-stretch gap-0 p-3 bg-black/95 border-b border-white/10`}
        >
          {navLinks}

          <div className="h-px bg-white/10 my-2" />

          {isLoggedIn ? (
            <button
              type="button"
              className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
              disabled={loading}
              onClick={() => {
                setMenuOpen(false);
                setLogoutModalOpen(true);
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <GuestAuthBadges pathname={pathname} className="px-3 py-2" />
          )}
        </nav>
      </header>

      <ConfirmModal
        open={logoutModalOpen}
        variant="danger"
        title="¿Cerrar sesión?"
        description="Saldrás de tu cuenta en este dispositivo. Tendrás que iniciar sesión de nuevo para acceder a tu dashboard, pedidos y recomendaciones."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
