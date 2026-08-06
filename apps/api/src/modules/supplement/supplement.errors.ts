import { CustomError } from "../../shared/errors/custom-error";

export type SupplementErrorCode =
  | "SUPPLEMENT_NOT_FOUND"
  | "SUPPLEMENT_INVALID_ID";

export const SupplementErrors = {
  notFound: () =>
    new CustomError<SupplementErrorCode>({
      message: "Suplemento no encontrado",
      statusCode: 404,
      code: "SUPPLEMENT_NOT_FOUND",
    }),

  invalidId: () =>
    new CustomError<SupplementErrorCode>({
      message: "ID de suplemento inválido",
      statusCode: 422,
      code: "SUPPLEMENT_INVALID_ID",
    }),
};
