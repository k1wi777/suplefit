import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const sexoEnum = pgEnum("sexo", ["M", "F", "Otro"]);
export const pedidoEstadoEnum = pgEnum("pedido_estado", ["pendiente", "confirmado", "cancelado"]);

export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  correo: text("correo").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  edad: integer("edad").notNull(),
  peso: numeric("peso", { precision: 6, scale: 2 }).notNull(),
  altura: numeric("altura", { precision: 6, scale: 2 }).notNull(),
  sexo: sexoEnum("sexo").notNull(),
  nivelActividad: text("nivel_actividad").notNull(),
  objetivo: text("objetivo").notNull(),
  consentimientoDatos: boolean("consentimiento_datos").notNull().default(false),
  consentimientoFecha: timestamp("consentimiento_fecha", { withTimezone: true }),
  politicaVersion: text("politica_version").default("1.0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const administradores = pgTable(
  "administradores",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_admin_user").on(table.userId)],
);

export const categorias = pgTable(
  "categorias",
  {
    id: serial("id").primaryKey(),
    nombre: text("nombre").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uq_categorias_slug").on(table.slug)],
);

export const suplementos = pgTable(
  "suplementos",
  {
    id: serial("id").primaryKey(),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion").notNull(),
    beneficios: text("beneficios"),
    modoUso: text("modo_uso"),
    advertencias: text("advertencias"),
    imagenUrl: text("imagen_url"),
    categoriaId: integer("categoria_id")
      .notNull()
      .references(() => categorias.id, { onDelete: "restrict" }),
    precio: numeric("precio", { precision: 10, scale: 2 }).notNull().default("0"),
    stock: integer("stock").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_suplementos_categoria").on(table.categoriaId)],
);

export const recomendaciones = pgTable(
  "recomendaciones",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    supplementId: integer("supplement_id")
      .notNull()
      .references(() => suplementos.id, { onDelete: "cascade" }),
    objetivo: text("objetivo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_recs_user_created").on(table.userId, table.createdAt)],
);

export const pedidos = pgTable(
  "pedidos",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    estado: pedidoEstadoEnum("estado").notNull().default("pendiente"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_pedidos_user").on(table.userId, table.createdAt)],
);

export const pedidoItems = pgTable(
  "pedido_items",
  {
    id: serial("id").primaryKey(),
    pedidoId: integer("pedido_id")
      .notNull()
      .references(() => pedidos.id, { onDelete: "cascade" }),
    supplementId: integer("supplement_id")
      .notNull()
      .references(() => suplementos.id, { onDelete: "restrict" }),
    cantidad: integer("cantidad").notNull(),
    precioUnitario: numeric("precio_unitario", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [index("idx_pedido_items_pedido").on(table.pedidoId)],
);

export const seguimientoPeso = pgTable(
  "seguimiento_peso",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    peso: numeric("peso", { precision: 6, scale: 2 }).notNull(),
    registradoEn: date("registrado_en").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_peso_user_fecha").on(table.userId, table.registradoEn, table.createdAt)],
);

export const habitosDiarios = pgTable(
  "habitos_diarios",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    fecha: date("fecha").notNull(),
    entrenamiento: boolean("entrenamiento").default(false),
    descansoHoras: numeric("descanso_horas", { precision: 3, scale: 1 }),
    hidratacionLitros: numeric("hidratacion_litros", { precision: 4, scale: 2 }),
    notas: text("notas"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uq_habito_user_fecha").on(table.userId, table.fecha)],
);

export const reglasObjetivoCategoria = pgTable(
  "reglas_objetivo_categoria",
  {
    id: serial("id").primaryKey(),
    objetivo: text("objetivo").notNull(),
    categoriaSlug: text("categoria_slug").notNull(),
    prioridad: integer("prioridad").notNull().default(1),
    omitirSiSedentario: boolean("omitir_si_sedentario").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_regla_objetivo_slug").on(table.objetivo, table.categoriaSlug),
    index("idx_regla_objetivo").on(table.objetivo, table.prioridad),
  ],
);

export const usuariosRelations = relations(usuarios, ({ many, one }) => ({
  administrador: one(administradores),
  recomendaciones: many(recomendaciones),
  pedidos: many(pedidos),
  seguimientoPeso: many(seguimientoPeso),
  habitosDiarios: many(habitosDiarios),
}));

export const categoriasRelations = relations(categorias, ({ many }) => ({
  suplementos: many(suplementos),
}));

export const suplementosRelations = relations(suplementos, ({ one }) => ({
  categoria: one(categorias, {
    fields: [suplementos.categoriaId],
    references: [categorias.id],
  }),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [pedidos.userId], references: [usuarios.id] }),
  items: many(pedidoItems),
}));

export const pedidoItemsRelations = relations(pedidoItems, ({ one }) => ({
  pedido: one(pedidos, { fields: [pedidoItems.pedidoId], references: [pedidos.id] }),
  suplemento: one(suplementos, {
    fields: [pedidoItems.supplementId],
    references: [suplementos.id],
  }),
}));
