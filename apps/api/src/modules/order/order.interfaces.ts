//Entidades de dominio

//comprobaciones en tiempo de desarrollo 
export interface OrderItem {
  id: number;
  pedidoId: number;
  supplementId: number;
  supplementNombre: string;
  supplementImagen?: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Order {
  id: number;
  userId: number;
  estado: string;
  total: number;
  createdAt: Date;
}

export interface CreateOrderItemInput {
  supplementId: number;
  cantidad: number;
}

export interface CreateOrderResult {
  order: Order;
  items: OrderItem[];
}