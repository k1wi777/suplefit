// Interfaz del repository
import type { Order, OrderItem, CreateOrderItemInput } from "./order.interfaces";

export interface OrderRepository {
  create(userId: number, items: CreateOrderItemInput[]): Promise<{ orderId: number } | { error: string }>;
  findById(orderId: number): Promise<Order | null>;
  findByIdAndUser(orderId: number, userId: number): Promise<Order | null>;
  findByUser(userId: number): Promise<Order[]>;
  findItemsByOrderId(orderId: number): Promise<OrderItem[]>;
}