// features/orders/order.errors.ts
import { CustomError } from "../../shared/errors/custom-error";

// posible error codes for order operations
export type OrderErrorCode =
  | "ORDER_NOT_FOUND"
  | "ORDER_CREATION_FAILED"
  | "ORDER_INVALID_ID";

  

export const OrderErrors = {
  notFound: () =>
    new CustomError<OrderErrorCode>({
      message: "Pedido no encontrado",
      statusCode: 404,
      code: "ORDER_NOT_FOUND",
    }),

  creationFailed: (reason: string) =>
    new CustomError<OrderErrorCode>({
      message: reason,
      statusCode: 400,
      code: "ORDER_CREATION_FAILED",
    }),

  invalidId: () =>
    new CustomError<OrderErrorCode>({
      message: "ID de pedido inválido",
      statusCode: 422,
      code: "ORDER_INVALID_ID",
    }),
};
