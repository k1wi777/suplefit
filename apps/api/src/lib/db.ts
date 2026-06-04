import mysql from "mysql2/promise";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { env } from "./env";

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: "utf8mb4_unicode_ci",
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/** Primera columna del primer registro (funciones escalares). */
export async function queryScalar<T>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<RowDataPacket>(sql, params);
  const row = rows[0];
  if (!row) return null;
  const key = Object.keys(row)[0];
  return row[key] as T;
}

/**
 * Ejecuta CALL nombre(?, ..., @out1, @out2) y lee variables de sesión @out*.
 * `outNames` son los nombres sin @ (p. ej. 'p_user_id' → @p_user_id).
 */
export async function callProcedure(
  name: string,
  inParams: unknown[] = [],
  outNames: string[] = []
): Promise<Record<string, unknown>> {
  const conn = await pool.getConnection();
  try {
    const inPlaceholders = inParams.map(() => "?").join(", ");
    const outPlaceholders = outNames.map((n) => `@${n}`).join(", ");
    const argParts = [inPlaceholders, outPlaceholders].filter(Boolean);
    const sql = `CALL ${name}(${argParts.join(", ")})`;
    await conn.query(sql, inParams);

    const out: Record<string, unknown> = {};
    for (const varName of outNames) {
      const [rows] = await conn.query<RowDataPacket[]>(`SELECT @${varName} AS v`);
      out[varName] = rows[0]?.v;
    }
    return out;
  } finally {
    conn.release();
  }
}

/** CALL con transacción explícita en la misma conexión (p. ej. pedidos). */
export async function callProcedureOnConnection(
  conn: PoolConnection,
  name: string,
  inParams: unknown[] = [],
  outNames: string[] = []
): Promise<Record<string, unknown>> {
  const inPlaceholders = inParams.map(() => "?").join(", ");
  const outPlaceholders = outNames.map((n) => `@${n}`).join(", ");
  const argParts = [inPlaceholders, outPlaceholders].filter(Boolean);
  const sql = `CALL ${name}(${argParts.join(", ")})`;
  await conn.query(sql, inParams);

  const out: Record<string, unknown> = {};
  for (const varName of outNames) {
    const [rows] = await conn.query<RowDataPacket[]>(`SELECT @${varName} AS v`);
    out[varName] = rows[0]?.v;
  }
  return out;
}
