// shared/utils/async-handler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function asyncHandler(fn: AsyncFn): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // cualquier rejection va directo al error handler
  };
}