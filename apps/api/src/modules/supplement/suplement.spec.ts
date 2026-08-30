import request from "supertest";
import { app } from "../../app";
import { SupplementErrors } from "./supplement.errors";
import {
  GetSupplementParamsSchema,
  ListSupplementsQuerySchema,
} from "./supplement.dto";
import type { Supplement } from "./supplement.interfaces";
import { PostgresSupplementRepository } from "./postgres-supplement.repository";
import type { SupplementRepository } from "./supplement.repository";
import { SupplementService } from "./supplement.service";

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

describe("Supplement unit - SupplementService", () => {
  let repository: jest.Mocked<SupplementRepository>;
  let service: SupplementService;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      findById: jest.fn(),
    };
    service = new SupplementService(repository);
  });

  it("lista suplementos y reenvía los filtros al repositorio", async () => {
    const filters = {
      categorySlug: "proteinas",
      search: "whey",
      minPrice: 50,
      maxPrice: 150,
    };
    repository.findMany.mockResolvedValue([supplement]);

    await expect(service.listSupplements(filters)).resolves.toEqual({
      items: [supplement],
    });
    expect(repository.findMany).toHaveBeenCalledWith(filters);
  });

  it("devuelve un suplemento existente", async () => {
    repository.findById.mockResolvedValue(supplement);

    await expect(service.getSupplementById(1)).resolves.toEqual({
      item: supplement,
    });
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it("lanza SUPPLEMENT_NOT_FOUND cuando el suplemento no existe", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getSupplementById(999)).rejects.toMatchObject({
      message: SupplementErrors.notFound().message,
      statusCode: 404,
      code: "SUPPLEMENT_NOT_FOUND",
    });
  });
});

describe("Supplement unit - DTOs", () => {
  it("acepta filtros válidos y convierte los precios a number", () => {
    expect(
      ListSupplementsQuerySchema.parse({
        categorySlug: "proteinas",
        search: "whey",
        minPrice: "50",
        maxPrice: "150",
      }),
    ).toEqual({
      categorySlug: "proteinas",
      search: "whey",
      minPrice: 50,
      maxPrice: 150,
    });
  });

  it("trata filtros de precio vacíos como ausentes", () => {
    expect(
      ListSupplementsQuerySchema.parse({ minPrice: "", maxPrice: "" }),
    ).toEqual({
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it("rechaza precios negativos y un id inválido", () => {
    expect(
      ListSupplementsQuerySchema.safeParse({ minPrice: "-1" }).success,
    ).toBe(false);
    expect(GetSupplementParamsSchema.safeParse({ id: "0" }).success).toBe(
      false,
    );
    expect(GetSupplementParamsSchema.safeParse({ id: "abc" }).success).toBe(
      false,
    );
  });
});

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
