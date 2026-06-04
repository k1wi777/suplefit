import { callProcedure, query } from "./db";
import {
  highStimSlugs,
  objetivoLabels,
  objetivoToCategorySlugs,
  type Objetivo,
} from "./recommendationRules";

export type Supplement = {
  id: number;
  nombre: string;
  descripcion: string;
  beneficios: string | null;
  modo_uso: string | null;
  advertencias: string | null;
  imagen_url: string | null;
  categoria_id: number;
  precio: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

export async function generateAndFetchRecommendationsForUser(
  userId: number,
  objetivo: string,
  nivelActividad?: string
) {
  const mappedObjetivo = objetivoToCategorySlugs[objetivo] ? (objetivo as Objetivo) : null;
  if (!mappedObjetivo) {
    return {
      items: [] as Supplement[],
      criterios: {
        objetivo,
        objetivoLabel: null,
        categorias: [] as string[],
        nivelActividad: nivelActividad ?? null,
        notas: ["Objetivo sin mapeo de categorías configurado."],
      },
    };
  }

  let slugs = [...objetivoToCategorySlugs[mappedObjetivo]];
  const sedentary = ["sedentario", "baja", "media"].includes((nivelActividad ?? "").toLowerCase());
  if (sedentary) {
    slugs = slugs.filter((s) => !highStimSlugs.includes(s));
  }

  await callProcedure("sp_generar_recomendaciones", [userId]);

  const recommendedSupplements = await query<Supplement>(
    `
      SELECT s.*
      FROM suplementos s
      INNER JOIN recomendaciones r ON r.supplement_id = s.id
      WHERE r.user_id = ? AND r.objetivo = ? AND DATE(r.created_at) = CURDATE()
      ORDER BY r.id ASC
    `,
    [userId, mappedObjetivo]
  );

  const notas = [
    "Sugerencias orientativas basadas en reglas, no diagnóstico médico.",
    "Se priorizan productos con stock disponible y precio accesible.",
    `Objetivo: ${objetivoLabels[mappedObjetivo]}.`,
    "Generadas por el procedimiento almacenado sp_generar_recomendaciones.",
  ];
  if (sedentary) {
    notas.push("Nivel de actividad bajo o moderado: se omiten pre-entrenos y estimulantes fuertes.");
  }

  return {
    items: recommendedSupplements,
    criterios: {
      objetivo: mappedObjetivo,
      objetivoLabel: objetivoLabels[mappedObjetivo],
      categorias: slugs,
      nivelActividad: nivelActividad ?? null,
      notas,
    },
  };
}
