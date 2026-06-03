import { query } from "./db";
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
  precio: string; // MySQL DECIMAL returns string
  stock: number;
  created_at: string;
  updated_at: string;
};

function buildInClause(values: string[]) {
  const placeholders = values.map(() => "?").join(",");
  return { placeholders, params: values };
}

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

  const { placeholders, params } = buildInClause(slugs);

  await query("DELETE FROM recomendaciones WHERE user_id = ? AND objetivo = ? AND created_at >= (NOW() - INTERVAL 1 DAY)", [
    userId,
    mappedObjetivo,
  ]);

  const recommendedSupplements = await query<Supplement>(
    `
      SELECT s.*
      FROM suplementos s
      JOIN categorias c ON c.id = s.categoria_id
      WHERE c.slug IN (${placeholders})
      ORDER BY s.stock DESC, s.precio ASC
      LIMIT 6
    `,
    params
  );

  for (const s of recommendedSupplements) {
    await query(
      "INSERT INTO recomendaciones (user_id, supplement_id, objetivo) VALUES (?, ?, ?)",
      [userId, s.id, mappedObjetivo]
    );
  }

  const notas = [
    "Sugerencias orientativas basadas en reglas, no diagnóstico médico.",
    "Se priorizan productos con stock disponible y precio accesible.",
    `Objetivo: ${objetivoLabels[mappedObjetivo]}.`,
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

