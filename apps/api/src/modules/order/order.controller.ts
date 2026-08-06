// modules/order/order.controller.ts
// Controller (HTTP + validación)
import type { Request, Response } from "express";
import { OrderService } from "./order.service";
import { MySqlOrderRepository } from "./mysql-order.repository";
import { asyncHandler } from "../../shared/utils/async-handler";
import { getValidated } from "../../shared/utils/get-validated";
import type { CreateOrderDto, GetOrderParamsDto } from "./order.dto";

const orderService = new OrderService(new MySqlOrderRepository());

class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const dto = getValidated<CreateOrderDto>(req, "body");
    const result = await orderService.createOrder(req.user!.userId, dto.items);
    return res.status(201).json(result);
  });

  listOrders = asyncHandler(async (req: Request, res: Response) => {
    const orders = await orderService.listUserOrders(req.user!.userId);
    return res.json({ orders });
  });

  getOrder = asyncHandler(async (req: Request, res: Response) => {
    const params = getValidated<GetOrderParamsDto>(req, "params");
    const result = await orderService.getOrderDetail(params.id, req.user!.userId);
    return res.json(result);
  });
}

export default new OrderController();
