import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../lib/postgres";
import {
  categorias,
  pedidoItems,
  pedidos,
  recomendaciones,
  reglasObjetivoCategoria,
  suplementos,
  usuarios,
} from "../../lib/db/schema";
import type { RecommendationRepository } from "./recommendation.repository";
import type {
  RecommendationHistoryItem,
  RecommendedSupplement,
  RecommendationUserContext,
} from "./recommendation.interfaces";

function mapSupplement(row: typeof suplementos.$inferSelect): RecommendedSupplement {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    beneficios: row.beneficios,
    modo_uso: row.modoUso,
    advertencias: row.advertencias,
    imagen_url: row.imagenUrl,
    categoria_id: row.categoriaId,
    precio: String(row.precio),
    stock: row.stock,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export class PostgresRecommendationRepository implements RecommendationRepository {
  async findUserContext(userId: number): Promise<RecommendationUserContext | null> {
    const [row] = await db
      .select({
        objetivo: usuarios.objetivo,
        nivelActividad: usuarios.nivelActividad,
      })
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    return row ?? null;
  }

  async generateForUser(userId: number): Promise<void> {
    const [user] = await db
      .select({ objetivo: usuarios.objetivo, nivelActividad: usuarios.nivelActividad })
      .from(usuarios)
      .where(eq(usuarios.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const rules = await db
      .select()
      .from(reglasObjetivoCategoria)
      .where(eq(reglasObjetivoCategoria.objetivo, user.objetivo));

    if (rules.length === 0) {
      throw new Error("Objetivo sin reglas configuradas");
    }

    const sedentary = ["sedentario", "baja", "media"].includes(user.nivelActividad.toLowerCase());

    await db.transaction(async (tx) => {
      await tx
        .delete(recomendaciones)
        .where(
          and(
            eq(recomendaciones.userId, userId),
            sql`date(${recomendaciones.createdAt}) = current_date`,
          ),
        );

      const candidates = await tx
        .select({ supplement: suplementos, prioridad: reglasObjetivoCategoria.prioridad })
        .from(suplementos)
        .innerJoin(categorias, eq(categorias.id, suplementos.categoriaId))
        .innerJoin(
          reglasObjetivoCategoria,
          and(
            eq(reglasObjetivoCategoria.categoriaSlug, categorias.slug),
            eq(reglasObjetivoCategoria.objetivo, user.objetivo),
          ),
        )
        .where(
          sedentary
            ? eq(reglasObjetivoCategoria.omitirSiSedentario, false)
            : sql`true`,
        )
        .orderBy(
          reglasObjetivoCategoria.prioridad,
          desc(suplementos.stock),
          suplementos.precio,
        )
        .limit(6);

      if (candidates.length > 0) {
        await tx.insert(recomendaciones).values(
          candidates.map((c) => ({
            userId,
            supplementId: c.supplement.id,
            objetivo: user.objetivo,
          })),
        );
      }
    });
  }

  async findCurrentByObjective(
    userId: number,
    objetivo: string,
  ): Promise<RecommendedSupplement[]> {
    const rows = await db
      .select({ supplement: suplementos })
      .from(suplementos)
      .innerJoin(recomendaciones, eq(recomendaciones.supplementId, suplementos.id))
      .where(
        and(
          eq(recomendaciones.userId, userId),
          eq(recomendaciones.objetivo, objetivo),
          sql`date(${recomendaciones.createdAt}) = current_date`,
        ),
      )
      .orderBy(recomendaciones.id);

    return rows.map((row) => mapSupplement(row.supplement));
  }

  async findHistory(userId: number, limit: number): Promise<RecommendationHistoryItem[]> {
    const rows = await db
      .select({
        created_at: recomendaciones.createdAt,
        objetivo: recomendaciones.objetivo,
        supplement: suplementos,
      })
      .from(recomendaciones)
      .innerJoin(suplementos, eq(suplementos.id, recomendaciones.supplementId))
      .where(eq(recomendaciones.userId, userId))
      .orderBy(desc(recomendaciones.createdAt))
      .limit(limit);

    return rows.map((row) => {
      const supplement = mapSupplement(row.supplement);
      return {
        objetivo: row.objetivo,
        ...supplement,
        created_at: row.created_at.toISOString(),
      };
    });
  }
}
