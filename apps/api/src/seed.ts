import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { env } from "./lib/env";
import { db } from "./lib/postgres";
import {
  administradores,
  categorias,
  seguimientoPeso,
  suplementos,
  usuarios,
} from "./lib/db/schema";
import { categories, supplements, refreshSupplementContentLegacy } from "./seed-data";
import { supplementContentBySlug } from "./seedSupplementContent";

export { categories, supplements } from "./seed-data";

export async function refreshSupplementContent() {
  await refreshSupplementContentLegacy(db);
}

export async function seedDemoIfNeeded() {
  const [catCount] = await db.select({ count: sql<number>`count(*)::int` }).from(categorias);
  const hasCats = (catCount?.count ?? 0) > 0;

  if (!hasCats) {
    for (const c of categories) {
      await db
        .insert(categorias)
        .values({ nombre: c.nombre, slug: c.slug })
        .onConflictDoUpdate({
          target: categorias.slug,
          set: { nombre: c.nombre },
        });
    }
  }

  const [supCount] = await db.select({ count: sql<number>`count(*)::int` }).from(suplementos);
  const hasSupps = (supCount?.count ?? 0) > 0;

  if (!hasSupps) {
    for (const s of supplements) {
      const [cat] = await db
        .select({ id: categorias.id })
        .from(categorias)
        .where(eq(categorias.slug, s.categoriaSlug))
        .limit(1);

      if (!cat) continue;

      const extra = supplementContentBySlug[s.categoriaSlug];
      await db.insert(suplementos).values({
        nombre: s.nombre,
        descripcion: s.descripcion,
        beneficios: extra?.beneficios ?? s.beneficios,
        modoUso: extra?.modoUso ?? s.modoUso,
        advertencias: extra?.advertencias ?? s.advertencias,
        imagenUrl: s.imagenUrl,
        categoriaId: cat.id,
        precio: s.precio.toFixed(2),
        stock: s.stock,
      });
    }
  }

  const [supAfter] = await db.select({ count: sql<number>`count(*)::int` }).from(suplementos);
  if ((supAfter?.count ?? 0) > 0) {
    await refreshSupplementContent();
  }

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const [existingUser] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.correo, env.ADMIN_EMAIL))
      .limit(1);

    let userId = existingUser?.id;

    if (!userId) {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      const [created] = await db
        .insert(usuarios)
        .values({
          nombre: "Admin SupleFit",
          correo: env.ADMIN_EMAIL,
          passwordHash,
          edad: 30,
          peso: "75.00",
          altura: "1.75",
          sexo: "M",
          nivelActividad: "alta",
          objetivo: "definicion",
          consentimientoDatos: true,
          consentimientoFecha: new Date(),
          politicaVersion: "1.0",
        })
        .returning({ id: usuarios.id });

      userId = created?.id;
    }

    if (userId) {
      await db
        .insert(administradores)
        .values({ userId })
        .onConflictDoUpdate({
          target: administradores.userId,
          set: { userId },
        });

      const [pesoHist] = await db
        .select({ id: seguimientoPeso.id })
        .from(seguimientoPeso)
        .where(eq(seguimientoPeso.userId, userId))
        .limit(1);

      if (!pesoHist) {
        await db.insert(seguimientoPeso).values({
          userId,
          peso: "75.00",
          registradoEn: new Date().toISOString().slice(0, 10),
        });
      }
    }
  }
}

async function runSeedCli() {
  await seedDemoIfNeeded();
  // eslint-disable-next-line no-console
  console.log("Seed completado.");
  process.exit(0);
}

if (require.main === module) {
  runSeedCli().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed error:", err);
    process.exit(1);
  });
}
