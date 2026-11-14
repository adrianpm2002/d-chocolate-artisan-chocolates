import { describe, expect, it } from "vitest";
import { PRODUCTS, filterProducts, parseCatalogSearch, productPrice } from "./catalog";

describe("catálogo", () => {
  it("filtra por categoría", () => {
    const result = filterProducts(PRODUCTS, { categoria: "tabletas" });
    expect(result.map((p) => p.slug)).toEqual(["tableta-oscura-70", "tableta-blanca-frambuesa"]);
  });

  it("busca sin importar acentos ni mayúsculas", () => {
    const result = filterProducts(PRODUCTS, { q: "CAFE" });
    expect(result.map((p) => p.slug)).toEqual(["trufa-artesanal"]);
  });

  it("ordena por precio de menor a mayor", () => {
    const prices = filterProducts(PRODUCTS, { orden: "precio-asc" }).map(productPrice);
    expect(prices[0]).toBe(18);
    expect(prices.at(-1)).toBe(514);
  });

  it("ignora categorías u orden desconocidos en la URL", () => {
    expect(parseCatalogSearch({ categoria: "pasteles", orden: "raro" })).toEqual({
      q: undefined,
      categoria: undefined,
      orden: undefined,
    });
  });
});
