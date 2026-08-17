// shared/errors/custom-error.ts
export class CustomError<C extends string = string> extends Error {
  public readonly statusCode: number;
  public readonly code?: C;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor({
    message,
    statusCode,
    code,
    isOperational = true,// true = error esperado, no un bug
    details,
  }: {
    message: string;
    statusCode: number;
    code?: C;
    isOperational?: boolean;
    details?: unknown;
  }) {
    super(message);//esto se vuelva un error nativo de JS, con stack trace y demás
    this.name = "CustomError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Necesario en TS al extender clases nativas como Error
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
