import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  DB_HOST: requireEnv("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT ?? 5432),
  DB_USER: requireEnv("DB_USER"),
  DB_PASSWORD: requireEnv("DB_PASSWORD"),
  DB_NAME: requireEnv("DB_NAME"),
  DB_SSL: process.env.DB_SSL === "1",

  /** PostgreSQL — URL completa o construida a partir de DB_* */
  DATABASE_URL:
    process.env.DATABASE_URL ??
    `postgresql://${requireEnv("DB_USER")}:${encodeURIComponent(requireEnv("DB_PASSWORD"))}@${requireEnv("DB_HOST")}:${Number(process.env.DB_PORT ?? 5432)}/${requireEnv("DB_NAME")}`,

  SEED_DEMO: process.env.SEED_DEMO === "1",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
};

