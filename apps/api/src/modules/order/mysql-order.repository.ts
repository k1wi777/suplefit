// modules/order/mysql-order.repository.ts
//Implementación concreta (MySQL)
import { callProcedure, query } from "../../lib/db";
import type { OrderRepository } from "./order.repository";
import type { Order, OrderItem, CreateOrderItemInput } from "./order.interfaces";

function toOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    estado: row.estado,
    total: row.total,
    createdAt: row.created_at,
  };
}

function toOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    pedidoId: row.pedido_id,
    supplementId: row.supplement_id,
    supplementNombre: row.supplementNombre,
    supplementImagen: row.supplementImagen,
    cantidad: row.cantidad,
    precioUnitario: row.precio_unitario,
  };
}

export class MySqlOrderRepository implements OrderRepository {
  async create(
    userId: number,
    items: CreateOrderItemInput[]
  ): Promise<{ orderId: number } | { error: string }> {
    const itemsJson = JSON.stringify(items);
    const out = await callProcedure("sp_crear_pedido", [userId, itemsJson], ["p_pedido_id", "p_error"]);

    if (out.p_error) {
      return { error: String(out.p_error) };
    }

    const orderId = Number(out.p_pedido_id);
    if (!Number.isFinite(orderId)) {
      return { error: "No se pudo crear el pedido" };
    }

    return { orderId };
  }

  async findById(orderId: number): Promise<Order | null> {
    const rows = await query<any>(
      `SELECT id, user_id, estado, total, created_at FROM pedidos WHERE id = ?`,
      [orderId]
    );
    return rows[0] ? toOrder(rows[0]) : null;
  }

  async findByIdAndUser(orderId: number, userId: number): Promise<Order | null> {
    const rows = await query<any>(
      `SELECT id, user_id, estado, total, created_at FROM pedidos WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );
    return rows[0] ? toOrder(rows[0]) : null;
  }

  async findByUser(userId: number): Promise<Order[]> {
    const rows = await query<any>(
      `SELECT id, estado, total, created_at FROM pedidos WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(toOrder);
  }

  async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    const rows = await query<any>(
      `
        SELECT pi.*, s.nombre AS supplementNombre, s.imagen_url AS supplementImagen
        FROM pedido_items pi
        JOIN suplementos s ON s.id = pi.supplement_id
        WHERE pi.pedido_id = ?
      `,
      [orderId]
    );
    return rows.map(toOrderItem);
  }
}