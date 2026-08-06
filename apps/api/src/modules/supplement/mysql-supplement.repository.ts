import { query } from "../../lib/db";
import type { SupplementRepository } from "./supplement.repository";
import type { Supplement, SupplementFilters } from "./supplement.interfaces";

const SELECT_WITH_CATEGORY = `
  SELECT s.*, c.nombre AS categoriaNombre, c.slug AS categoriaSlug
  FROM suplementos s
  JOIN categorias c ON c.id = s.categoria_id
`;

export class MySqlSupplementRepository implements SupplementRepository {
  async findMany(filters: SupplementFilters): Promise<Supplement[]> {
    let sql = `${SELECT_WITH_CATEGORY} WHERE 1=1`;
    const params: Array<string | number> = [];

    if (filters.categorySlug) {
      sql += " AND c.slug = ?";
      params.push(filters.categorySlug);
    }

    if (filters.search) {
      sql += " AND (s.nombre LIKE ? OR s.descripcion LIKE ? OR s.beneficios LIKE ?)";
      const q = `%${filters.search}%`;
      params.push(q, q, q);
    }

    if (filters.minPrice !== undefined) {
      sql += " AND s.precio >= ?";
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      sql += " AND s.precio <= ?";
      params.push(filters.maxPrice);
    }

    sql += " ORDER BY s.updated_at DESC";

    return query<Supplement>(sql, params);
  }

  async findById(id: number): Promise<Supplement | null> {
    const rows = await query<Supplement>(
      `${SELECT_WITH_CATEGORY} WHERE s.id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }
}
