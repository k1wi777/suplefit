import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "./db/schema";

const client = postgres(env.DATABASE_URL, {
  max: 10,
  ssl: env.DB_SSL ? "require" : undefined,
});

export const db = drizzle(client, { schema });

export type Db = typeof db;
