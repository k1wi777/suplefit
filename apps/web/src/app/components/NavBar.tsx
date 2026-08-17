"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AUTH_CHANGED_EVENT, clearToken, getToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import { useCartCount } from "@/hooks/useCartCount";
import BrandLogo from "@/components/BrandLogo";

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
  { href: "/", label: "Inicio" },
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

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [token, setTokenState] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
    refreshAuth();
    const onAuth = () => refreshAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, [refreshAuth]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isLoggedIn = Boolean(token);
  const links = isLoggedIn ? AUTH_LINKS : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between gap-3">
        <BrandLogo />

        <button
          type="button"
          className="md:hidden text-white/80 p-2 rounded-lg hover:bg-white/10"
          aria-label="Menú"
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

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex absolute md:relative top-full left-0 right-0 md:top-auto flex-col md:flex-row items-stretch md:items-center gap-0 md:gap-0.5 p-3 md:p-0 bg-black/95 md:bg-transparent border-b md:border-0 border-white/10`}
        >
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

          <div className="h-px md:hidden bg-white/10 my-2" />

          {isLoggedIn ? (
            <button
              type="button"
              className="text-left md:text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition"
              disabled={loading}
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <NavLink item={{ href: "/login", label: "Login" }} pathname={pathname} />
              <Link
                href="/register"
                className="mx-3 md:mx-0 md:ml-1 mt-1 md:mt-0 text-center rounded-full neon-btn px-4 py-2 text-[10px] font-black uppercase tracking-widest"
              >
                Registro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
