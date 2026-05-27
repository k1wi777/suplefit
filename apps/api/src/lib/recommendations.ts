import { query } from "./db";
import { objetivoToCategorySlugs, type Objetivo } from "./recommendationRules";

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

export async function generateAndFetchRecommendationsForUser(userId: number, objetivo: string) {
  const mappedObjetivo = objetivoToCategorySlugs[objetivo] ? (objetivo as Objetivo) : null;
  if (!mappedObjetivo) {
    // Sin mapeo: devolvemos lista vacía para prototipo.
    return { items: [] as Supplement[] };
  }

  const slugs = objetivoToCategorySlugs[mappedObjetivo];
  const { placeholders, params } = buildInClause(slugs);

  // Evita duplicados evidentes: regenerar dentro del mismo día para el mismo objetivo.
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

  return { items: recommendedSupplements };
}

