"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { clearToken } from "@/lib/token";

export type AdminNavKey = "inventory" | "orders" | "analytics";

const NAV: { key: AdminNavKey; href: string; label: string; icon: "box" | "clipboard" | "chart" }[] = [
  { key: "inventory", href: "/admin", label: "Inventario", icon: "box" },
  { key: "orders", href: "/admin/orders", label: "Pedidos", icon: "clipboard" },
  { key: "analytics", href: "/admin/analytics", label: "Estadísticas", icon: "chart" },
];

function NavIcon({ type }: { type: (typeof NAV)[number]["icon"] }) {
  const cls = "w-5 h-5 shrink-0";
  if (type === "clipboard") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h6" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "chart") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20V4M4 20h16" strokeLinecap="round" />
        <path d="M8 16v-4M12 16V8M16 16v-6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  active,
  title,
  subtitle,
  actions,
  children,
}: {
  active: AdminNavKey;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-52px)] bg-[#0a0a0a] relative overflow-x-hidden custom-scrollbar">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-180px] left-[-80px] w-[480px] h-[480px] bg-[#baff2e]/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-120px] right-[-60px] w-[380px] h-[380px] bg-violet-600/8 blur-[110px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-52px)]">
        <aside className="lg:w-[240px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-black/40 backdrop-blur-xl flex flex-col">
          <div className="p-5 border-b border-white/[0.06]">
            <BrandLogo className="scale-95 origin-left" />
            <p className="text-[#baff2e]/80 text-[10px] font-black uppercase tracking-[0.22em] mt-3 pl-0.5">
              Admin Console
            </p>
          </div>

          <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto lg:overflow-visible">
            {NAV.map((item) => {
              const on = item.key === active || isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                    on
                      ? "bg-[#baff2e] text-black shadow-[0_0_20px_rgba(186,255,46,0.25)]"
                      : "text-white/55 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <NavIcon type={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex flex-col gap-2 p-4 mt-auto border-t border-white/[0.06]">
            <Link
              href="/admin"
              className="rounded-xl bg-[#baff2e] hover:bg-[#d4ff63] text-black font-black text-center py-3 text-xs uppercase tracking-wide transition"
            >
              + Nuevo producto
            </Link>
            <Link
              href="/catalog"
              className="text-white/45 hover:text-white text-xs font-semibold px-2 py-1 transition"
            >
              Ver tienda
            </Link>
            <button
              type="button"
              className="text-left text-white/45 hover:text-red-300 text-xs font-semibold px-2 py-1 transition"
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-white font-black text-2xl md:text-3xl tracking-tight">{title}</h1>
              {subtitle ? <p className="text-white/45 text-sm mt-1 max-w-xl">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
          </header>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
