import { CustomError } from "../../shared/errors/custom-error";

export type UserErrorCode = "USER_NOT_FOUND" | "USER_UPDATE_FAILED";

export const UserErrors = {
  notFound: () =>
    new CustomError<UserErrorCode>({
      message: "Usuario no encontrado",
      statusCode: 404,
      code: "USER_NOT_FOUND",
    }),

  updateFailed: (reason: string) =>
    new CustomError<UserErrorCode>({
      message: reason,
      statusCode: 400,
      code: "USER_UPDATE_FAILED",
    }),
};
