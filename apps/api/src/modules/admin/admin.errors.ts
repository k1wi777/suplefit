import { CustomError } from "../../shared/errors/custom-error";

export type AdminErrorCode =
  | "ADMIN_CONFIRM_ORDER_FAILED"
  | "ADMIN_INVALID_CATEGORY"
  | "ADMIN_INVALID_ID";

export const AdminErrors = {
  confirmOrderFailed: (reason: string) =>
    new CustomError<AdminErrorCode>({
      message: reason,
      statusCode: 400,
      code: "ADMIN_CONFIRM_ORDER_FAILED",
    }),

  invalidCategory: () =>
    new CustomError<AdminErrorCode>({
      message: "Categoría inválida",
      statusCode: 400,
      code: "ADMIN_INVALID_CATEGORY",
    }),

  invalidId: () =>
    new CustomError<AdminErrorCode>({
      message: "ID inválido",
      statusCode: 422,
      code: "ADMIN_INVALID_ID",
    }),
};
