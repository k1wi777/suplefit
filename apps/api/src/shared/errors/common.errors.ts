// shared/errors/common.errors.ts
import { CustomError } from "./custom-error";

export type CommonErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND";

export const CommonErrors = {
  validation: (details: unknown) =>
    new CustomError<CommonErrorCode>({
      message: "Datos inválidos",
      statusCode: 422,
      code: "VALIDATION_ERROR",
      details,
    }),

  unauthorized: (message = "No autenticado") =>
    new CustomError<CommonErrorCode>({ message, statusCode: 401, code: "UNAUTHORIZED" }),

  forbidden: (message = "No autorizado") =>
    new CustomError<CommonErrorCode>({ message, statusCode: 403, code: "FORBIDDEN" }),
};