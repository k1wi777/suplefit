import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { db } from "../../lib/postgres";
import { categorias, suplementos } from "../../lib/db/schema";
import type { SupplementRepository } from "./supplement.repository";
import type { Supplement, SupplementFilters } from "./supplement.interfaces";

function mapSupplement(row: {
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
  created_at: Date;
  updated_at: Date;
  categoriaNombre: string;
  categoriaSlug: string;
}): Supplement {
  return {
    ...row,
    precio: String(row.precio),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export class PostgresSupplementRepository implements SupplementRepository {
  async findMany(filters: SupplementFilters): Promise<Supplement[]> {
    const conditions = [];

    if (filters.categorySlug) {
      conditions.push(eq(categorias.slug, filters.categorySlug));
    }

    if (filters.search) {
      const q = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(suplementos.nombre, q),
          ilike(suplementos.descripcion, q),
          ilike(suplementos.beneficios, q),
        )!,
      );
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(suplementos.precio, filters.minPrice.toFixed(2)));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(suplementos.precio, filters.maxPrice.toFixed(2)));
    }

    const rows = await db
      .select({
        id: suplementos.id,
        nombre: suplementos.nombre,
        descripcion: suplementos.descripcion,
        beneficios: suplementos.beneficios,
        modo_uso: suplementos.modoUso,
        advertencias: suplementos.advertencias,
        imagen_url: suplementos.imagenUrl,
        categoria_id: suplementos.categoriaId,
        precio: suplementos.precio,
        stock: suplementos.stock,
        created_at: suplementos.createdAt,
        updated_at: suplementos.updatedAt,
        categoriaNombre: categorias.nombre,
        categoriaSlug: categorias.slug,
      })
      .from(suplementos)
      .innerJoin(categorias, eq(categorias.id, suplementos.categoriaId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(suplementos.updatedAt));

    return rows.map(mapSupplement);
  }

  async findById(id: number): Promise<Supplement | null> {
    const [row] = await db
      .select({
        id: suplementos.id,
        nombre: suplementos.nombre,
        descripcion: suplementos.descripcion,
        beneficios: suplementos.beneficios,
        modo_uso: suplementos.modoUso,
        advertencias: suplementos.advertencias,
        imagen_url: suplementos.imagenUrl,
        categoria_id: suplementos.categoriaId,
        precio: suplementos.precio,
        stock: suplementos.stock,
        created_at: suplementos.createdAt,
        updated_at: suplementos.updatedAt,
        categoriaNombre: categorias.nombre,
        categoriaSlug: categorias.slug,
      })
      .from(suplementos)
      .innerJoin(categorias, eq(categorias.id, suplementos.categoriaId))
      .where(eq(suplementos.id, id))
      .limit(1);

    return row ? mapSupplement(row) : null;
  }
}
