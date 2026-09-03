"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import { AuthenticatedOnly, getToken } from "@/features/auth";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  estado: string;
  total: string;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login?next=/orders");
      return;
    }
    apiFetch<{ orders: Order[] }>("/api/orders", { token })
      .then((data) => setOrders(data.orders))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <AuthenticatedOnly>
      <main className="flex-1 px-4 py-10 min-h-screen bg-[#050505]">
        <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <h1 className="text-white font-black text-3xl">Mis pedidos</h1>
        {loading ? <p className="text-white/60">Cargando...</p> : null}
        {error ? <p className="text-red-300">{error}</p> : null}
        {!loading && orders.length === 0 ? (
          <GlassCard className="p-6 text-white/60 border border-white/10">
            Aún no tienes pedidos confirmados.
          </GlassCard>
        ) : null}
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`}>
            <GlassCard className="p-4 border border-white/10 hover:border-[#baff2e]/30 transition flex justify-between items-center">
              <div>
                <div className="text-white font-bold">Pedido #{o.id}</div>
                <div className="text-white/50 text-sm capitalize">{o.estado}</div>
              </div>
              <div className="text-right">
                <div className="text-[#baff2e] font-bold">${Number(o.total).toFixed(2)}</div>
                <div className="text-white/40 text-xs">
                  {new Date(o.created_at).toLocaleDateString("es")}
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
        </div>
      </main>
    </AuthenticatedOnly>
  );
}
