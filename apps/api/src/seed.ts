import bcrypt from "bcryptjs";
import { env } from "./lib/env";
import { query } from "./lib/db";

export const categories = [
  { nombre: "Creatina", slug: "creatina" },
  { nombre: "Whey Protein", slug: "whey-protein" },
  { nombre: "Mass Gainer", slug: "mass-gainer" },
  { nombre: "L-Carnitina", slug: "l-carnitina" },
  { nombre: "Quemadores", slug: "quemadores" },
  { nombre: "Proteína Aislada", slug: "proteina-aislada" },
  { nombre: "Electrolitos", slug: "electrolitos" },
  { nombre: "BCAA", slug: "bcaa" },
  { nombre: "Pre-entrenos", slug: "pre-entrenos" },
  { nombre: "Proteína Vegana", slug: "proteina-vegana" },
  { nombre: "Omega 3", slug: "omega-3" },
  { nombre: "ZMA", slug: "zma" },
  { nombre: "Multivitamínico", slug: "multivitaminico" },
  { nombre: "Colágeno", slug: "colageno" },
  { nombre: "Glutamina", slug: "glutamina" },
  { nombre: "Snacks", slug: "snacks" },
  { nombre: "Adaptógenos", slug: "adaptogenos" },
];

export const supplements = [
  {
    nombre: "Creatina Monohidratada",
    categoriaSlug: "creatina",
    descripcion: "Aumenta fuerza y rendimiento, ideal para ganancia de masa muscular.",
    beneficios: "Fuerza, potencia y volumen.",
    modoUso: "3-5 g al día, todos los días.",
    advertencias: "Beber agua suficiente. Consultar si tienes condiciones médicas.",
    imagenUrl: "https://warlabsuplementos.com/cdn/shop/files/creatina-monohidratada-suplementos-warlab-info.webp?v=1775420050",
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
    imagenUrl: "https://http2.mlstatic.com/D_Q_NP_647041-MLA97620166954_112025-O.webp",
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
    imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTGMOvOKaTn-dD0Br8KyJ_D1kxxLCeH4iDGg&s",
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
    imagenUrl: "https://m.media-amazon.com/images/I/81bA0xgn2BL.jpg",
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
    imagenUrl: "https://fitnesspeople.com.co/cdn/shop/products/0005121_fit-9-sascha-fitness-120-cps.jpg?v=1699727703&width=533",
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
    imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvMqUAEAD_bWILGRSgD7Dx32cLoJqLX2k06Q&s",
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
    imagenUrl: "https://m.media-amazon.com/images/I/71ouNKNEk4L._AC_UF1000,1000_QL80_.jpg",
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
    imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsvgujje1CYRTQ6QJoDrRE3xT27x100ZUPwA&s",
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
    imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcVgedAfA0tGrnAHWFpyTAvhgf-58SlHCHug&s",
    precio: 28.0,
    stock: 26,
  },
  {
    nombre: "Proteína Vegana",
    categoriaSlug: "proteina-vegana",
    descripcion: "Proteína de origen vegetal (guisante, arroz, soja) libre de lácteos.",
    beneficios: "Desarrollo muscular sin lactosa, ideal para digestiones sensibles.",
    modoUso: "1 scoop al día en agua o bebida vegetal.",
    advertencias: "Asegúrate de revisar todos los ingredientes si tienes alergias.",
    imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkXZ6nSKGvb6ix17XMBJMxmrEqqnWYiW20zA&s",
    precio: 36.5,
    stock: 25,
  },
  {
    nombre: "Omega 3 (Aceite de Pescado)",
    categoriaSlug: "omega-3",
    descripcion: "Ácidos grasos esenciales EPA y DHA para el cuidado del corazón y articulaciones.",
    beneficios: "Antioxidante natural, mejora cardiovascular y cognitiva.",
    modoUso: "1-2 cápsulas con las comidas.",
    advertencias: "Si tomas anticoagulantes, consulta a tu médico.",
    imagenUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/now/now01652/y/68.jpg",
    precio: 18.0,
    stock: 45,
  },
  {
    nombre: "ZMA (Zinc, Magnesio y B6)",
    categoriaSlug: "zma",
    descripcion: "Complejo mineral diseñado para maximizar la recuperación nocturna.",
    beneficios: "Mejora del sueño y apoyo hormonal natural.",
    modoUso: "2 o 3 cápsulas antes de dormir en ayunas.",
    advertencias: "No combinar con calcio ya que inhibe su absorción.",
    imagenUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/nrb/nrb52215/l/33.jpg",
    precio: 22.5,
    stock: 30,
  },
  {
    nombre: "Multivitamínico",
    categoriaSlug: "multivitaminico",
    descripcion: "Fórmula integral con vitaminas y minerales esenciales para un rendimiento óptimo.",
    beneficios: "Cubre deficiencias nutricionales y mejora de la vitalidad general.",
    modoUso: "1 comprimido diario con el desayuno.",
    advertencias: "No sustituye alimentos naturales.",
    imagenUrl: "https://media.falabella.com/falabellaCO/151818934_01/w=1500,h=1500,fit=cover",
    precio: 15.99,
    stock: 50,
  },
  {
    nombre: "Colágeno Hidrolizado",
    categoriaSlug: "colageno",
    descripcion: "Proteína clave rica en vitamina C para proteger articulaciones y tendones.",
    beneficios: "Promueve la salud articular, piel, y cabello.",
    modoUso: "10g disueltos en tu bebida favorita al día.",
    advertencias: "Las mujeres embarazadas deben consultar a un médico.",
    imagenUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBX-qE5fKzHAW62aX0BV6EwoVQYP32b3VDGg&s",
    precio: 29.5,
    stock: 28,
  },
  {
    nombre: "L-Glutamina",
    categoriaSlug: "glutamina",
    descripcion: "Aminoácido que protege el músculo en entrenamientos intensos y favorece la inmunidad.",
    beneficios: "Evita el catabolismo y protege la salud intestinal.",
    modoUso: "5g después del entrenamiento o antes de dormir.",
    advertencias: "Mantener buena hidratación.",
    imagenUrl: "https://http2.mlstatic.com/D_Q_NP_2X_811891-MCO97232129407_112025-P.webp",
    precio: 24.0,
    stock: 35,
  },
  {
    nombre: "Barra de Proteína",
    categoriaSlug: "snacks",
    descripcion: "Snack alto en proteínas, sin azúcares añadidos. Ideal para llevar.",
    beneficios: "Saciante y aporta proteínas rápidas.",
    modoUso: "1 a 2 barras diarias como merienda.",
    advertencias: "Consumo excesivo puede tener efectos laxantes.",
    imagenUrl: "https://http2.mlstatic.com/D_Q_NP_956058-MLA94157017144_102025-O.webp",
    precio: 3.5,
    stock: 100,
  },
  {
    nombre: "Ashwagandha",
    categoriaSlug: "adaptogenos",
    descripcion: "Hierba adaptógena que ayuda al cuerpo a gestionar el estrés y optimiza el cortisol.",
    beneficios: "Disminuye la fatiga nerviosa y ayuda en la recuperación del sistema nervioso.",
    modoUso: "300-600mg diarios, preferentemente por la tarde/noche.",
    advertencias: "Personas con hipertiroidismo deben usar con precaución.",
    imagenUrl: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/tii/tii71608/y/8.jpg",
    precio: 21.0,
    stock: 40,
  }
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

