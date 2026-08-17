"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GlassCard from "@/shared/components/GlassCard";
import { apiFetch } from "@/shared/lib/api";
import { getToken } from "@/features/auth";

type Order = {
  id: number;
  estado: string;
  total: string;
  created_at: string;
};

type OrderItem = {
  supplement_id: number;
  supplementNombre: string;
  cantidad: number;
  precio_unitario: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(`/login?next=/orders/${id}`);
      return;
    }
    apiFetch<{ order: Order; items: OrderItem[] }>(`/api/orders/${id}`, { token })
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
      })
      .catch(() => router.replace("/orders"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 rounded-full border-2 border-[#baff2e] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="flex-1 px-4 py-10 min-h-screen bg-[#050505]">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <Link href="/orders" className="text-white/60 text-sm hover:text-white">
          ← Mis pedidos
        </Link>
        <h1 className="text-white font-black text-3xl">Pedido #{order.id}</h1>
        <p className="text-white/60 text-sm capitalize">
          Estado: <span className="text-[#baff2e]">{order.estado}</span> ·{" "}
          {new Date(order.created_at).toLocaleString("es")}
        </p>
        <div className="flex flex-col gap-3">
          {items.map((line) => (
            <GlassCard key={line.supplement_id} className="p-4 border border-white/10 flex justify-between">
              <div>
                <div className="text-white font-semibold">{line.supplementNombre}</div>
                <div className="text-white/50 text-sm">Cantidad: {line.cantidad}</div>
              </div>
              <div className="text-white">
                ${(Number(line.precio_unitario) * line.cantidad).toFixed(2)}
              </div>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="p-4 border border-white/10 text-right">
          <span className="text-white/50 text-sm mr-2">Total</span>
          <span className="text-white font-black text-xl">${Number(order.total).toFixed(2)}</span>
        </GlassCard>
      </div>
    </main>
  );
}
