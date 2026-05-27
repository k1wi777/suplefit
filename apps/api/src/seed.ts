import bcrypt from "bcryptjs";
import { env } from "./lib/env";
import { query } from "./lib/db";

const categories = [
  { nombre: "Creatina", slug: "creatina" },
  { nombre: "Whey Protein", slug: "whey-protein" },
  { nombre: "Mass Gainer", slug: "mass-gainer" },
  { nombre: "L-Carnitina", slug: "l-carnitina" },
  { nombre: "Quemadores", slug: "quemadores" },
  { nombre: "Proteína Aislada", slug: "proteina-aislada" },
  { nombre: "Electrolitos", slug: "electrolitos" },
  { nombre: "BCAA", slug: "bcaa" },
  { nombre: "Pre-entrenos", slug: "pre-entrenos" },
];

const supplements = [
  {
    nombre: "Creatina Monohidratada",
    categoriaSlug: "creatina",
    descripcion: "Aumenta fuerza y rendimiento, ideal para ganancia de masa muscular.",
    beneficios: "Fuerza, potencia y volumen.",
    modoUso: "3-5 g al día, todos los días.",
    advertencias: "Beber agua suficiente. Consultar si tienes condiciones médicas.",
    imagenUrl: "https://placehold.co/800x600?text=Creatina",
    precio: 24.99,
    stock: 40,
  },
  {
    nombre: "Whey Protein",
    categoriaSlug: "whey-protein",
    descripcion: "Proteína de rápida absorción para apoyar tu recuperación y crecimiento.",
    beneficios: "Recuperación y aporte proteico.",
    modoUso: "1 scoop en agua o leche según preferencia.",
    advertencias: "No exceder dosis recomendadas.",
    imagenUrl: "https://placehold.co/800x600?text=Whey+Protein",
    precio: 34.5,
    stock: 35,
  },
  {
    nombre: "Mass Gainer",
    categoriaSlug: "mass-gainer",
    descripcion: "Calorías y proteína para ayudar a subir de peso de forma controlada.",
    beneficios: "Aumento de masa, apoyo energético.",
    modoUso: "1 porción al día o según tu meta calórica.",
    advertencias: "Ajusta si tienes intolerancias.",
    imagenUrl: "https://placehold.co/800x600?text=Mass+Gainer",
    precio: 52.0,
    stock: 20,
  },
  {
    nombre: "L-Carnitina",
    categoriaSlug: "l-carnitina",
    descripcion: "Soporte metabólico para periodos de definición.",
    beneficios: "Ayuda en la pérdida de grasa.",
    modoUso: "500-2000 mg al día (según tolerancia).",
    advertencias: "Evitar si existe contraindicación médica.",
    imagenUrl: "https://placehold.co/800x600?text=L-Carnitina",
    precio: 19.9,
    stock: 25,
  },
  {
    nombre: "Quemador de Grasa",
    categoriaSlug: "quemadores",
    descripcion: "Complemento para reforzar rutinas de definición.",
    beneficios: "Mayor enfoque y soporte de energía.",
    modoUso: "Según indicación del producto.",
    advertencias: "No combinar con exceso de estimulantes.",
    imagenUrl: "https://placehold.co/800x600?text=Quemadores",
    precio: 29.99,
    stock: 18,
  },
  {
    nombre: "Proteína Aislada",
    categoriaSlug: "proteina-aislada",
    descripcion: "Proteína con buena tolerancia para mantener masa magra.",
    beneficios: "Aporte proteico con menor grasa y lactosa.",
    modoUso: "1 scoop tras entrenamiento o cuando lo necesites.",
    advertencias: "Revisar ingredientes si eres sensible a lácteos.",
    imagenUrl: "https://placehold.co/800x600?text=Prote%C3%ADna+Aislada",
    precio: 37.5,
    stock: 22,
  },
  {
    nombre: "Electrolitos",
    categoriaSlug: "electrolitos",
    descripcion: "Reemplaza sales minerales para mejorar hidratación y rendimiento.",
    beneficios: "Hidratación y recuperación.",
    modoUso: "Una porción en agua, especialmente antes/durante entrenos.",
    advertencias: "Ajustar si tienes restricciones médicas.",
    imagenUrl: "https://placehold.co/800x600?text=Electrolitos",
    precio: 15.75,
    stock: 55,
  },
  {
    nombre: "BCAA",
    categoriaSlug: "bcaa",
    descripcion: "Aminos para apoyar la recuperación muscular.",
    beneficios: "Recuperación y resistencia.",
    modoUso: "Seguir etiqueta del producto.",
    advertencias: "No sustituye una dieta equilibrada.",
    imagenUrl: "https://placehold.co/800x600?text=BCAA",
    precio: 21.25,
    stock: 33,
  },
  {
    nombre: "Pre-entrenos",
    categoriaSlug: "pre-entrenos",
    descripcion: "Mejora energía y enfoque para tus sesiones.",
    beneficios: "Rendimiento y bombeo.",
    modoUso: "30-45 min antes del entrenamiento.",
    advertencias: "Evitar en caso de sensibilidad a estimulantes.",
    imagenUrl: "https://placehold.co/800x600?text=Pre-entrenos",
    precio: 28.0,
    stock: 26,
  },
];

export async function seedDemoIfNeeded() {
  // Categorías
  const catCount = await query<any>("SELECT COUNT(*) as count FROM categorias");
  const hasCats = Number(catCount[0]?.count ?? 0) > 0;
  if (!hasCats) {
    for (const c of categories) {
      await query<any>(
        "INSERT INTO categorias (nombre, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)",
        [c.nombre, c.slug]
      );
    }
  }

  // Suplementos
  const supCount = await query<any>("SELECT COUNT(*) as count FROM suplementos");
  const hasSupps = Number(supCount[0]?.count ?? 0) > 0;
  if (!hasSupps) {
    for (const s of supplements) {
      const cat = await query<any>("SELECT id FROM categorias WHERE slug = ? LIMIT 1", [s.categoriaSlug]);
      const catId = cat[0]?.id;
      if (!catId) continue;

      await query<any>(
        `
          INSERT INTO suplementos
            (nombre, descripcion, beneficios, modo_uso, advertencias, imagen_url, categoria_id, precio, stock)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          s.nombre,
          s.descripcion,
          s.beneficios,
          s.modoUso,
          s.advertencias,
          s.imagenUrl,
          catId,
          s.precio,
          s.stock,
        ]
      );
    }
  }

  // Admin (usuario + tabla administradores)
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const existingUser = await query<any>("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [env.ADMIN_EMAIL]);
    let userId = existingUser[0]?.id as number | undefined;

    if (!userId) {
      const password_hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await query<any>(
        `
          INSERT INTO usuarios (nombre, correo, password_hash, edad, peso, altura, sexo, nivel_actividad, objetivo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        ["Admin SupleFit", env.ADMIN_EMAIL, password_hash, 30, 75, 1.75, "M", "alta", "definicion"]
      );
      const created = await query<any>("SELECT id FROM usuarios WHERE correo = ? LIMIT 1", [env.ADMIN_EMAIL]);
      userId = created[0]?.id;
    }

    if (userId) {
      await query<any>(
        "INSERT INTO administradores (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)",
        [userId]
      );
    }
  }
}

