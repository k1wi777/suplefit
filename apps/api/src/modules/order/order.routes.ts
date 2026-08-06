// modules/order/order.routes.ts
// El router solo declara las rutas y delega a handlers (controllers)
import express from "express";
import orderController from "./order.controller";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate.middleware";
import { CreateOrderSchema, GetOrderParamsSchema } from "./order.dto";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  requireAuth,
  validate(CreateOrderSchema, "body"),
  orderController.createOrder,
);
orderRouter.get("/", requireAuth, orderController.listOrders);
orderRouter.get(
  "/:id",
  requireAuth,
  validate(GetOrderParamsSchema, "params"),
  orderController.getOrder,
);

export default orderRouter;

/* 
Cliente
  ↓
order.routes.ts        → solo enruta
  ↓
order.controller.ts    → valida body (Zod), llama service, traduce errores → status HTTP
  ↓
order.service.ts       → orquesta: crea pedido, busca el pedido creado, busca sus items
  ↓
order.repository.ts    → interfaz (contrato)
  ↓
mysql-order.repository.ts → ejecuta el stored procedure y las queries reales
*/
