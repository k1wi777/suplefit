import {
  highStimSlugs,
  objetivoLabels,
  objetivoToCategorySlugs,
  type Objetivo,
} from "../../lib/recommendationRules";
import type { RecommendationRepository } from "./recommendation.repository";
import type {
  RecommendationHistoryItem,
  RecommendationResult,
} from "./recommendation.interfaces";
import { RecommendationErrors } from "./recommendation.errors";

export class RecommendationService {
  constructor(private recommendationRepo: RecommendationRepository) {}

  async getCurrentForUser(userId: number): Promise<RecommendationResult> {
    const user = await this.recommendationRepo.findUserContext(userId);
    if (!user) {
      throw RecommendationErrors.userNotFound();
    }

    const mappedObjetivo = objetivoToCategorySlugs[user.objetivo]
      ? (user.objetivo as Objetivo)
      : null;

    if (!mappedObjetivo) {
      return {
        items: [],
        criterios: {
          objetivo: user.objetivo,
          objetivoLabel: null,
          categorias: [],
          nivelActividad: user.nivelActividad,
          notas: ["Objetivo sin mapeo de categorías configurado."],
        },
      };
    }

    let slugs = [...objetivoToCategorySlugs[mappedObjetivo]];
    const sedentary = ["sedentario", "baja", "media"].includes(
      (user.nivelActividad ?? "").toLowerCase(),
    );

    if (sedentary) {
      slugs = slugs.filter((slug) => !highStimSlugs.includes(slug));
    }

    await this.recommendationRepo.generateForUser(userId);

    const items = await this.recommendationRepo.findCurrentByObjective(
      userId,
      mappedObjetivo,
    );

    const notas = [
      "Sugerencias orientativas basadas en reglas, no diagnóstico médico.",
      "Se priorizan productos con stock disponible y precio accesible.",
      `Objetivo: ${objetivoLabels[mappedObjetivo]}.`,
      "Generadas por el procedimiento almacenado sp_generar_recomendaciones.",
    ];

    if (sedentary) {
      notas.push(
        "Nivel de actividad bajo o moderado: se omiten pre-entrenos y estimulantes fuertes.",
      );
    }

    return {
      items,
      criterios: {
        objetivo: mappedObjetivo,
        objetivoLabel: objetivoLabels[mappedObjetivo],
        categorias: slugs,
        nivelActividad: user.nivelActividad,
        notas,
      },
    };
  }

  async getHistoryForUser(
    userId: number,
    limit: number,
  ): Promise<RecommendationHistoryItem[]> {
    return this.recommendationRepo.findHistory(userId, limit);
  }
}
