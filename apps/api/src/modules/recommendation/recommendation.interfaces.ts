export type RecommendationUserContext = {
  objetivo: string;
  nivelActividad: string | null;
};

export type RecommendationCriteria = {
  objetivo: string;
  objetivoLabel: string | null;
  categorias: string[];
  nivelActividad: string | null;
  notas: string[];
};

export type RecommendedSupplement = {
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

export type RecommendationHistoryItem = {
  created_at: string;
  objetivo: string;
} & RecommendedSupplement;

export type RecommendationResult = {
  items: RecommendedSupplement[];
  criterios: RecommendationCriteria;
};
