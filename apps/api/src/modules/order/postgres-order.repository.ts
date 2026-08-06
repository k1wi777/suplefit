import { and, desc, eq } from "drizzle-orm";
import { db } from "../../lib/postgres";
import { pedidoItems, pedidos, suplementos } from "../../lib/db/schema";
import type { OrderRepository } from "./order.repository";
import type { CreateOrderItemInput, Order, OrderItem } from "./order.interfaces";

function toOrder(row: {
  id: number;
  userId?: number;
  user_id?: number;
  estado: string;
  total: string;
  createdAt?: Date;
  created_at?: Date;
}): Order {
  return {
    id: row.id,
    userId: row.userId ?? row.user_id!,
    estado: row.estado,
    total: Number(row.total),
    createdAt: row.createdAt ?? row.created_at!,
  };
}

function toOrderItem(row: {
  id: number;
  pedidoId: number;
  supplementId: number;
  cantidad: number;
  precioUnitario: string;
  supplementNombre: string;
  supplementImagen: string | null;
}): OrderItem {
  return {
    id: row.id,
    pedidoId: row.pedidoId,
    supplementId: row.supplementId,
    supplementNombre: row.supplementNombre,
    supplementImagen: row.supplementImagen ?? undefined,
    cantidad: row.cantidad,
    precioUnitario: Number(row.precioUnitario),
  };
}

export class PostgresOrderRepository implements OrderRepository {
  async create(
    userId: number,
    items: CreateOrderItemInput[],
  ): Promise<{ orderId: number } | { error: string }> {
    if (!items.length) {
      return { error: "El pedido debe incluir al menos un producto" };
    }

    try {
      const orderId = await db.transaction(async (tx) => {
        let total = 0;
        const lineItems: Array<{
          supplementId: number;
          cantidad: number;
          precioUnitario: string;
        }> = [];

        for (const item of items) {
          if (!item.supplementId || !item.cantidad || item.cantidad < 1) {
            throw new Error("Línea de pedido inválida");
          }

          const [product] = await tx
            .select({ id: suplementos.id, nombre: suplementos.nombre, precio: suplementos.precio, stock: suplementos.stock })
            .from(suplementos)
            .where(eq(suplementos.id, item.supplementId))
            .limit(1);

          if (!product) {
            throw new Error(`Stock insuficiente para "producto"`);
          }

          if (product.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para "${product.nombre}"`);
          }

          const precio = Number(product.precio);
          total += precio * item.cantidad;
          lineItems.push({
            supplementId: item.supplementId,
            cantidad: item.cantidad,
            precioUnitario: product.precio,
          });
        }

        const [order] = await tx
          .insert(pedidos)
          .values({
            userId,
            estado: "pendiente",
            total: total.toFixed(2),
          })
          .returning({ id: pedidos.id });

        if (!order) {
          throw new Error("No se pudo crear el pedido");
        }

        await tx.insert(pedidoItems).values(
          lineItems.map((line) => ({
            pedidoId: order.id,
            supplementId: line.supplementId,
            cantidad: line.cantidad,
            precioUnitario: line.precioUnitario,
          })),
        );

        return order.id;
      });

      return { orderId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error interno al crear el pedido";
      if (message.includes("Stock insuficiente") || message.includes("Línea de pedido")) {
        return { error: message };
      }
      return { error: "Error interno al crear el pedido" };
    }
  }

  async findById(orderId: number): Promise<Order | null> {
    const [row] = await db
      .select({
        id: pedidos.id,
        userId: pedidos.userId,
        estado: pedidos.estado,
        total: pedidos.total,
        createdAt: pedidos.createdAt,
      })
      .from(pedidos)
      .where(eq(pedidos.id, orderId))
      .limit(1);

    return row ? toOrder(row) : null;
  }

  async findByIdAndUser(orderId: number, userId: number): Promise<Order | null> {
    const [row] = await db
      .select({
        id: pedidos.id,
        userId: pedidos.userId,
        estado: pedidos.estado,
        total: pedidos.total,
        createdAt: pedidos.createdAt,
      })
      .from(pedidos)
      .where(and(eq(pedidos.id, orderId), eq(pedidos.userId, userId)))
      .limit(1);

    return row ? toOrder(row) : null;
  }

  async findByUser(userId: number): Promise<Order[]> {
    const rows = await db
      .select({
        id: pedidos.id,
        userId: pedidos.userId,
        estado: pedidos.estado,
        total: pedidos.total,
        createdAt: pedidos.createdAt,
      })
      .from(pedidos)
      .where(eq(pedidos.userId, userId))
      .orderBy(desc(pedidos.createdAt));

    return rows.map(toOrder);
  }

  async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    const rows = await db
      .select({
        id: pedidoItems.id,
        pedidoId: pedidoItems.pedidoId,
        supplementId: pedidoItems.supplementId,
        cantidad: pedidoItems.cantidad,
        precioUnitario: pedidoItems.precioUnitario,
        supplementNombre: suplementos.nombre,
        supplementImagen: suplementos.imagenUrl,
      })
      .from(pedidoItems)
      .innerJoin(suplementos, eq(suplementos.id, pedidoItems.supplementId))
      .where(eq(pedidoItems.pedidoId, orderId));

    return rows.map(toOrderItem);
  }
}
