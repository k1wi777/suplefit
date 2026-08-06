// modules/order/order.service.ts
//Service (lógica de negocio y orquestación)
import type { OrderRepository } from "./order.repository";
import type {
  CreateOrderItemInput,
  CreateOrderResult,
  Order,
  OrderItem,
} from "./order.interfaces";
import {OrderErrors} from "./order.errors";

/* 
 el lanzamiento de errores de dominio debe quedar en el service; el repository solo reporta datos o resultados.
*/

export class OrderService {
  constructor(private orderRepo: OrderRepository) {}

  async createOrder(
    userId: number,
    items: CreateOrderItemInput[],
  ): Promise<CreateOrderResult> {
    const result = await this.orderRepo.create(userId, items);

    if ("error" in result) {
      throw OrderErrors.creationFailed(result.error);
    }

    const order = await this.orderRepo.findById(result.orderId);
    if (!order) {
       throw OrderErrors.creationFailed("No se pudo crear el pedido");
    }

    const orderItems = await this.orderRepo.findItemsByOrderId(result.orderId);
    return { order, items: orderItems };
  }

  async listUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepo.findByUser(userId);
  }

  async getOrderDetail(
    orderId: number,
    userId: number,
  ): Promise<{ order: Order; items: OrderItem[] }> {
    const order = await this.orderRepo.findByIdAndUser(orderId, userId);
    if (!order) {
      throw OrderErrors.notFound()
    }
    const items = await this.orderRepo.findItemsByOrderId(orderId);
    return { order, items };
  }
}
