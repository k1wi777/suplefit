import { eq } from "drizzle-orm";
import { db } from "../../lib/postgres";
import { usuarios } from "../../lib/db/schema";
import type { UserRepository } from "./user.repository";
import type { User, UpdateUserData } from "./user.interfaces";
import {
  administradores,
  habitosDiarios,
  pedidoItems,
  pedidos,
  recomendaciones,
  seguimientoPeso,
} from "../../lib/db/schema";

function toUser(row: typeof usuarios.$inferSelect): User {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    edad: row.edad,
    peso: Number(row.peso),
    altura: Number(row.altura),
    sexo: row.sexo,
    nivelActividad: row.nivelActividad,
    objetivo: row.objetivo,
    createdAt: row.createdAt,
  };
}

const columnMap: Record<keyof UpdateUserData, keyof typeof usuarios.$inferInsert> = {
  nombre: "nombre",
  edad: "edad",
  peso: "peso",
  altura: "altura",
  sexo: "sexo",
  nivelActividad: "nivelActividad",
  objetivo: "objetivo",
  passwordHash: "passwordHash",
};

export class PostgresUserRepository implements UserRepository {
  async findById(id: number): Promise<User | null> {
    const [row] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);

    return row ? toUser(row) : null;
  }

  async update(id: number, data: UpdateUserData): Promise<User | { error: string }> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) {
      return { error: "NOTHING_TO_UPDATE" };
    }

    const setValues: Partial<typeof usuarios.$inferInsert> = {};
    for (const [key, value] of entries) {
      const col = columnMap[key as keyof UpdateUserData];
      if (col === "peso" || col === "altura") {
        setValues[col] = String(value);
      } else {
        (setValues as Record<string, unknown>)[col] = value;
      }
    }

    await db.update(usuarios).set(setValues).where(eq(usuarios.id, id));

    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const userOrders = await tx.select({ id: pedidos.id }).from(pedidos).where(eq(pedidos.userId, id));
      for (const order of userOrders) {
        await tx.delete(pedidoItems).where(eq(pedidoItems.pedidoId, order.id));
      }
      await tx.delete(pedidos).where(eq(pedidos.userId, id));
      await tx.delete(recomendaciones).where(eq(recomendaciones.userId, id));
      await tx.delete(seguimientoPeso).where(eq(seguimientoPeso.userId, id));
      await tx.delete(habitosDiarios).where(eq(habitosDiarios.userId, id));
      await tx.delete(administradores).where(eq(administradores.userId, id));
      await tx.delete(usuarios).where(eq(usuarios.id, id));
    });
  }
}
