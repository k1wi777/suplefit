import { asc, desc, eq } from "drizzle-orm";
import type { Db } from "../../lib/postgres";
import { seguimientoPeso, usuarios } from "../../lib/db/schema";

export async function getDeltaPesoReciente(db: Db, userId: number): Promise<number | null> {
  const rows = await db
    .select({ peso: seguimientoPeso.peso })
    .from(seguimientoPeso)
    .where(eq(seguimientoPeso.userId, userId))
    .orderBy(desc(seguimientoPeso.createdAt))
    .limit(2);

  if (rows.length < 2) return null;

  const actual = Number(rows[0]!.peso);
  const anterior = Number(rows[1]!.peso);
  return Math.round((actual - anterior) * 10) / 10;
}

export async function getPesoInicialUsuario(db: Db, userId: number): Promise<number | null> {
  const [row] = await db
    .select({ peso: seguimientoPeso.peso })
    .from(seguimientoPeso)
    .where(eq(seguimientoPeso.userId, userId))
    .orderBy(asc(seguimientoPeso.createdAt))
    .limit(1);

  return row ? Number(row.peso) : null;
}

export async function getResumenPeso(db: Db, userId: number) {
  const [user] = await db
    .select({ peso: usuarios.peso })
    .from(usuarios)
    .where(eq(usuarios.id, userId))
    .limit(1);

  const pesoInicial = await getPesoInicialUsuario(db, userId);
  const deltaReciente = await getDeltaPesoReciente(db, userId);

  return {
    pesoActual: user ? Number(user.peso) : null,
    pesoInicial,
    deltaReciente,
  };
}

export async function syncUserWeight(db: Db, userId: number, peso: number): Promise<void> {
  await db.update(usuarios).set({ peso: peso.toFixed(2) }).where(eq(usuarios.id, userId));
}
