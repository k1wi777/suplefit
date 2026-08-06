export type AdminStats = {
  totalUsuarios: number;
  totalPedidos: number;
  totalSuplementos: number;
  pedidosPendientes: number;
  pedidosConfirmados: number;
  stockTotal: number;
};

export type AdminOrderListItem = {
  id: number;
  userId: number;
  estado: string;
  total: string;
  createdAt: string;
  customerNombre: string;
  customerCorreo: string;
};

export type AdminCategory = {
  id: number;
  nombre: string;
  slug: string;
};

export type AdminSupplement = {
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
  categoriaSlug: string;
  categoriaNombre: string;
};

export type AdminSupplementInput = {
  nombre: string;
  descripcion: string;
  beneficios?: string | null;
  modoUso?: string | null;
  advertencias?: string | null;
  imagenUrl?: string | null;
  categoriaSlug: string;
  precio: number;
  stock: number;
};
