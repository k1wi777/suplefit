import { CustomError } from "../../shared/errors/custom-error";

export type AuthErrorCode =
  | "AUTH_EMAIL_ALREADY_REGISTERED"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_USER_NOT_FOUND"
  | "AUTH_CREATION_FAILED";

export const AuthErrors = {
  emailAlreadyRegistered: () =>
    new CustomError<AuthErrorCode>({
      message: "Correo ya registrado",
      statusCode: 409,
      code: "AUTH_EMAIL_ALREADY_REGISTERED",
    }),

  invalidCredentials: () =>
    new CustomError<AuthErrorCode>({
      message: "Credenciales inválidas",
      statusCode: 401,
      code: "AUTH_INVALID_CREDENTIALS",
    }),

  userNotFound: () =>
    new CustomError<AuthErrorCode>({
      message: "Usuario no encontrado",
      statusCode: 404,
      code: "AUTH_USER_NOT_FOUND",
    }),

  creationFailed: () =>
    new CustomError<AuthErrorCode>({
      message: "No se pudo crear el usuario",
      statusCode: 500,
      code: "AUTH_CREATION_FAILED",
    }),
};
