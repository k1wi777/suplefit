import jwt from "jsonwebtoken";
import { env } from "./env";

export type JwtPayload = {
  userId: number;
  isAdmin: boolean;
};

export function signAccessToken(payload: JwtPayload): string {
  // Tipado estricto + jsonwebtoken v9 puede variar según configuración; para prototipo casteamos opciones.
  return jwt.sign(payload as any, env.JWT_SECRET as any, { expiresIn: env.JWT_EXPIRES_IN } as any);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET as any) as any;
  if (typeof decoded === "string" || !decoded) throw new Error("Invalid token payload");
  const obj = decoded as Partial<JwtPayload>;
  if (typeof obj.userId !== "number" || typeof obj.isAdmin !== "boolean") {
    throw new Error("Invalid token shape");
  }
  return obj as JwtPayload;
}

