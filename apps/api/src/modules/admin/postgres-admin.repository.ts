import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../lib/postgres";
import {
  categorias,
  pedidoItems,
  pedidos,
  suplementos,
  usuarios,
} from "../../lib/db/schema";
import type {
  AdminCategory,
  AdminOrderListItem,
  AdminStats,
  AdminSupplement,
  AdminSupplementInput,
} from "./admin.interfaces";
import type { AdminRepository } from "./admin.repository";

export class PostgresAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    const [[users], [orders], [supplements], [pending], [confirmed], [stock]] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usuarios),
      db.select({ count: sql<number>`count(*)::int` }).from(pedidos),
      db.select({ count: sql<number>`count(*)::int` }).from(suplementos),
      db.select({ count: sql<number>`count(*)::int` }).from(pedidos).where(eq(pedidos.estado, "pendiente")),
      db.select({ count: sql<number>`count(*)::int` }).from(pedidos).where(eq(pedidos.estado, "confirmado")),
      db.select({ total: sql<number>`coalesce(sum(${suplementos.stock}), 0)::int` }).from(suplementos),
    ]);

    return {
      totalUsuarios: users?.count ?? 0,
      totalPedidos: orders?.count ?? 0,
      totalSuplementos: supplements?.count ?? 0,
      pedidosPendientes: pending?.count ?? 0,
      pedidosConfirmados: confirmed?.count ?? 0,
      stockTotal: stock?.total ?? 0,
    };
  }

  async listOrders(filters: {
    estado: string;
    search: string;
  }): Promise<AdminOrderListItem[]> {
    const conditions = [];

    if (filters.estado && filters.estado !== "todos") {
      conditions.push(eq(pedidos.estado, filters.estado as "pendiente" | "confirmado" | "cancelado"));
    }

    if (filters.search) {
      const q = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(usuarios.nombre, q),
          ilike(usuarios.correo, q),
          sql`${pedidos.id}::text LIKE ${q}`,
        )!,
      );
    }

    const rows = await db
      .select({
        id: pedidos.id,
        userId: pedidos.userId,
        estado: pedidos.estado,
        total: pedidos.total,
        createdAt: pedidos.createdAt,
        customerNombre: usuarios.nombre,
        customerCorreo: usuarios.correo,
      })
      .from(pedidos)
      .innerJoin(usuarios, eq(usuarios.id, pedidos.userId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(pedidos.createdAt))
      .limit(200);

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      estado: row.estado,
      total: String(row.total),
      createdAt: row.createdAt.toISOString(),
      customerNombre: row.customerNombre,
      customerCorreo: row.customerCorreo,
    }));
  }

  async confirmOrder(orderId: number): Promise<string | null> {
    try {
      return await db.transaction(async (tx) => {
        const [order] = await tx
          .select({ estado: pedidos.estado })
          .from(pedidos)
          .where(eq(pedidos.id, orderId))
          .for("update");

        if (!order) {
          return "Pedido no encontrado";
        }

        if (order.estado !== "pendiente") {
          return `El pedido no está pendiente (estado: ${order.estado})`;
        }

        const items = await tx
          .select({
            supplementId: pedidoItems.supplementId,
            cantidad: pedidoItems.cantidad,
            stock: suplementos.stock,
          })
          .from(pedidoItems)
          .innerJoin(suplementos, eq(suplementos.id, pedidoItems.supplementId))
          .where(eq(pedidoItems.pedidoId, orderId));

        const sinStock = items.some((item) => item.stock < item.cantidad);
        if (sinStock) {
          return "Stock insuficiente para confirmar el pedido";
        }

        for (const item of items) {
          await tx
            .update(suplementos)
            .set({ stock: sql`${suplementos.stock} - ${item.cantidad}` })
            .where(eq(suplementos.id, item.supplementId));
        }

        await tx.update(pedidos).set({ estado: "confirmado" }).where(eq(pedidos.id, orderId));
        return null;
      });
    } catch {
      return "Error al confirmar el pedido";
    }
  }

  async listCategories(): Promise<AdminCategory[]> {
    return db
      .select({ id: categorias.id, nombre: categorias.nombre, slug: categorias.slug })
      .from(categorias)
      .orderBy(categorias.nombre);
  }

  async listSupplements(search: string): Promise<AdminSupplement[]> {
    const conditions = search
      ? or(ilike(suplementos.nombre, `%${search}%`), ilike(suplementos.descripcion, `%${search}%`))
      : undefined;

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
        categoriaSlug: categorias.slug,
        categoriaNombre: categorias.nombre,
      })
      .from(suplementos)
      .innerJoin(categorias, eq(categorias.id, suplementos.categoriaId))
      .where(conditions)
      .orderBy(desc(suplementos.updatedAt));

    return rows.map((row) => ({
      ...row,
      precio: String(row.precio),
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    }));
  }

  async createSupplement(
    input: AdminSupplementInput,
  ): Promise<void | { error: string }> {
    const [category] = await db
      .select({ id: categorias.id })
      .from(categorias)
      .where(eq(categorias.slug, input.categoriaSlug))
      .limit(1);

    if (!category) {
      return { error: "INVALID_CATEGORY" };
    }

    await db.insert(suplementos).values({
      nombre: input.nombre,
      descripcion: input.descripcion,
      beneficios: input.beneficios ?? null,
      modoUso: input.modoUso ?? null,
      advertencias: input.advertencias ?? null,
      imagenUrl: input.imagenUrl ?? null,
      categoriaId: category.id,
      precio: input.precio.toFixed(2),
      stock: input.stock,
    });
  }

  async updateSupplement(
    id: number,
    input: AdminSupplementInput,
  ): Promise<void | { error: string }> {
    const [category] = await db
      .select({ id: categorias.id })
      .from(categorias)
      .where(eq(categorias.slug, input.categoriaSlug))
      .limit(1);

    if (!category) {
      return { error: "INVALID_CATEGORY" };
    }

    await db
      .update(suplementos)
      .set({
        nombre: input.nombre,
        descripcion: input.descripcion,
        beneficios: input.beneficios ?? null,
        modoUso: input.modoUso ?? null,
        advertencias: input.advertencias ?? null,
        imagenUrl: input.imagenUrl ?? null,
        categoriaId: category.id,
        precio: input.precio.toFixed(2),
        stock: input.stock,
        updatedAt: new Date(),
      })
      .where(eq(suplementos.id, id));
  }

  async deleteSupplement(id: number): Promise<void> {
    await db.delete(suplementos).where(eq(suplementos.id, id));
  }
}
