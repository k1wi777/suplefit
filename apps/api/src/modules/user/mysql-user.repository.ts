// Implementa el repository concreto (aquí sí vive el SQL)

import { query, callProcedure } from "../../lib/db";
import type { UserRepository } from "./user.repository";
import type { User, UpdateUserData } from "./user.interfaces";

// Mapea una fila cruda de la DB a la entidad de dominio
function toUser(row: any): User {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    edad: row.edad,
    peso: row.peso,
    altura: row.altura,
    sexo: row.sexo,
    nivelActividad: row.nivel_actividad,
    objetivo: row.objetivo,
    createdAt: row.created_at,
  };
}

const SELECT_FIELDS =
  "id, nombre, correo, edad, peso, altura, sexo, nivel_actividad, objetivo, created_at";

export class MySqlUserRepository implements UserRepository {
  async findById(id: number): Promise<User | null> {
    const rows = await query<any>(
      `SELECT ${SELECT_FIELDS} FROM usuarios WHERE id = ?`,
      [id],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async update(id: number, data: UpdateUserData): Promise<User | { error: string }> {
    const columnMap: Record<string, string> = {
      nombre: "nombre",
      edad: "edad",
      peso: "peso",
      altura: "altura",
      sexo: "sexo",
      nivelActividad: "nivel_actividad",
      objetivo: "objetivo",
      passwordHash: "password_hash",
    };

    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) {
      return { error: "NOTHING_TO_UPDATE" };
    }

    const setSql = entries.map(([k]) => `${columnMap[k]} = ?`).join(", ");
    const params = entries.map(([, v]) => v);

    await query(`UPDATE usuarios SET ${setSql} WHERE id = ?`, [...params, id]);

    const updated = await this.findById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    await callProcedure("sp_eliminar_cuenta_usuario", [id]);
    
  }
}
