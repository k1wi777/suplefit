  import request from "supertest";
import { app } from "../../app";
import type { Supplement } from "./supplement.interfaces";
import { PostgresSupplementRepository } from "./postgres-supplement.repository";

const supplement: Supplement = {
  id: 1,
  nombre: "Proteína whey",
  descripcion: "Proteína de suero de leche",
  beneficios: "Apoya la recuperación muscular",
  modo_uso: "Mezclar una porción con agua",
  advertencias: null,
  imagen_url: null,
  categoria_id: 1,
  precio: "99.90",
  stock: 10,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  categoriaNombre: "Proteínas",
  categoriaSlug: "proteinas",
};

describe("Supplement HTTP integration", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lista suplementos y aplica los filtros de query", async () => {
    const findMany = jest
      .spyOn(PostgresSupplementRepository.prototype, "findMany")
      .mockResolvedValue([supplement]);

    const response = await request(app)
      .get("/api/supplements")
      .query({
        categorySlug: "proteinas",
        search: "whey",
        minPrice: "50",
        maxPrice: "150",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [supplement] });
    expect(findMany).toHaveBeenCalledWith({
      categorySlug: "proteinas",
      search: "whey",
      minPrice: 50,
      maxPrice: 150,
    });
  });

  it("obtiene un suplemento por ID", async () => {
    const findById = jest
      .spyOn(PostgresSupplementRepository.prototype, "findById")
      .mockResolvedValue(supplement);

    const response = await request(app).get("/api/supplements/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ item: supplement });
    expect(findById).toHaveBeenCalledWith(1);
  });

  it("devuelve 404 cuando el suplemento no existe", async () => {
    jest
      .spyOn(PostgresSupplementRepository.prototype, "findById")
      .mockResolvedValue(null);

    const response = await request(app).get("/api/supplements/999");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: "Suplemento no encontrado",
      code: "SUPPLEMENT_NOT_FOUND",
    });
  });

  it("devuelve 422 cuando el ID no cumple el esquema", async () => {
    const response = await request(app).get("/api/supplements/no-es-un-id");

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: "Datos inválidos",
      code: "VALIDATION_ERROR",
    });
  });
});
