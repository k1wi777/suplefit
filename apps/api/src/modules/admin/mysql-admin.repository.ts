import { callProcedure, query } from "../../lib/db";
import type {
  AdminCategory,
  AdminOrderListItem,
  AdminStats,
  AdminSupplement,
  AdminSupplementInput,
} from "./admin.interfaces";
import type { AdminRepository } from "./admin.repository";

export class MySqlAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    const out = await callProcedure(
      "sp_estadisticas_admin",
      [],
      [
        "p_total_usuarios",
        "p_total_pedidos",
        "p_total_suplementos",
        "p_pedidos_pendientes",
        "p_pedidos_confirmados",
        "p_stock_total",
      ],
    );

    return {
      totalUsuarios: Number(out.p_total_usuarios ?? 0),
      totalPedidos: Number(out.p_total_pedidos ?? 0),
      totalSuplementos: Number(out.p_total_suplementos ?? 0),
      pedidosPendientes: Number(out.p_pedidos_pendientes ?? 0),
      pedidosConfirmados: Number(out.p_pedidos_confirmados ?? 0),
      stockTotal: Number(out.p_stock_total ?? 0),
    };
  }

  async listOrders(filters: {
    estado: string;
    search: string;
  }): Promise<AdminOrderListItem[]> {
    let sql = `
      SELECT
        p.id,
        p.user_id AS userId,
        p.estado,
        p.total,
        p.created_at AS createdAt,
        u.nombre AS customerNombre,
        u.correo AS customerCorreo
      FROM pedidos p
      INNER JOIN usuarios u ON u.id = p.user_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (filters.estado && filters.estado !== "todos") {
      sql += " AND p.estado = ?";
      params.push(filters.estado);
    }

    if (filters.search) {
      sql +=
        " AND (u.nombre LIKE ? OR u.correo LIKE ? OR CAST(p.id AS CHAR) LIKE ?)";
      const q = `%${filters.search}%`;
      params.push(q, q, q);
    }

    sql += " ORDER BY p.created_at DESC LIMIT 200";

    return query<AdminOrderListItem>(sql, params);
  }

  async confirmOrder(orderId: number): Promise<string | null> {
    const out = await callProcedure(
      "sp_confirmar_pedido",
      [orderId],
      ["p_error"],
    );
    return out.p_error ? String(out.p_error) : null;
  }

  async listCategories(): Promise<AdminCategory[]> {
    return query<AdminCategory>(
      "SELECT id, nombre, slug FROM categorias ORDER BY nombre ASC",
    );
  }

  async listSupplements(search: string): Promise<AdminSupplement[]> {
    let sql = `
      SELECT s.*, c.slug AS categoriaSlug, c.nombre AS categoriaNombre
      FROM suplementos s
      JOIN categorias c ON c.id = s.categoria_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (search) {
      sql += " AND (s.nombre LIKE ? OR s.descripcion LIKE ?)";
      const q = `%${search}%`;
      params.push(q, q);
    }

    sql += " ORDER BY s.updated_at DESC";

    return query<AdminSupplement>(sql, params);
  }

  async createSupplement(
    input: AdminSupplementInput,
  ): Promise<void | { error: string }> {
    const categories = await query<{ id: number }>(
      "SELECT id FROM categorias WHERE slug = ? LIMIT 1",
      [input.categoriaSlug],
    );
    const category = categories[0];
    if (!category) {
      return { error: "INVALID_CATEGORY" };
    }

    await query(
      `
        INSERT INTO suplementos
          (nombre, descripcion, beneficios, modo_uso, advertencias, imagen_url, categoria_id, precio, stock)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.nombre,
        input.descripcion,
        input.beneficios ?? null,
        input.modoUso ?? null,
        input.advertencias ?? null,
        input.imagenUrl ?? null,
        category.id,
        input.precio,
        input.stock,
      ],
    );
  }

  async updateSupplement(
    id: number,
    input: AdminSupplementInput,
  ): Promise<void | { error: string }> {
    const categories = await query<{ id: number }>(
      "SELECT id FROM categorias WHERE slug = ? LIMIT 1",
      [input.categoriaSlug],
    );
    const category = categories[0];
    if (!category) {
      return { error: "INVALID_CATEGORY" };
    }

    await query(
      `
        UPDATE suplementos
        SET
          nombre = ?,
          descripcion = ?,
          beneficios = ?,
          modo_uso = ?,
          advertencias = ?,
          imagen_url = ?,
          categoria_id = ?,
          precio = ?,
          stock = ?
        WHERE id = ?
      `,
      [
        input.nombre,
        input.descripcion,
        input.beneficios ?? null,
        input.modoUso ?? null,
        input.advertencias ?? null,
        input.imagenUrl ?? null,
        category.id,
        input.precio,
        input.stock,
        id,
      ],
    );
  }

  async deleteSupplement(id: number): Promise<void> {
    await query("DELETE FROM suplementos WHERE id = ?", [id]);
  }
}
