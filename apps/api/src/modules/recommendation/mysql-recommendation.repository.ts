import { callProcedure, query } from "../../lib/db";
import type { RecommendationRepository } from "./recommendation.repository";
import type {
  RecommendationHistoryItem,
  RecommendedSupplement,
  RecommendationUserContext,
} from "./recommendation.interfaces";

export class MySqlRecommendationRepository implements RecommendationRepository {
  async findUserContext(userId: number): Promise<RecommendationUserContext | null> {
    const rows = await query<any>(
      "SELECT objetivo, nivel_actividad FROM usuarios WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!rows[0]) return null;

    return {
      objetivo: rows[0].objetivo,
      nivelActividad: rows[0].nivel_actividad,
    };
  }

  async generateForUser(userId: number): Promise<void> {
    await callProcedure("sp_generar_recomendaciones", [userId]);
  }

  async findCurrentByObjective(
    userId: number,
    objetivo: string,
  ): Promise<RecommendedSupplement[]> {
    return query<RecommendedSupplement>(
      `
        SELECT s.*
        FROM suplementos s
        INNER JOIN recomendaciones r ON r.supplement_id = s.id
        WHERE r.user_id = ? AND r.objetivo = ? AND DATE(r.created_at) = CURDATE()
        ORDER BY r.id ASC
      `,
      [userId, objetivo],
    );
  }

  async findHistory(userId: number, limit: number): Promise<RecommendationHistoryItem[]> {
    return query<RecommendationHistoryItem>(
      `
        SELECT r.created_at, r.objetivo, s.*
        FROM recomendaciones r
        JOIN suplementos s ON s.id = r.supplement_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ?
      `,
      [userId, limit],
    );
  }
}
