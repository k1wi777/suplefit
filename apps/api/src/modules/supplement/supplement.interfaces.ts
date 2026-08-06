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
  categoriaNombre: string;
  categoriaSlug: string;
};

export type SupplementFilters = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type SupplementListResult = {
  items: Supplement[];
};
