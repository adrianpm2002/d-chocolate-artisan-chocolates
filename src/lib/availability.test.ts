import { describe, expect, it } from "vitest";
import { getProduct, type PackProduct } from "./catalog";
import { availableStock, maxQuantity, packsAvailable, producedStock, shortages, stockStatus } from "./availability";

describe("disponibilidad", () => {
  it("los pedidos por encargo no restan de lo producido hoy", () => {
    const produced = producedStock("bombon-clasico", "ganache-oscuro");
    const left = availableStock("bombon-clasico", "ganache-oscuro", [
      { product: "bombon-clasico", variant: "ganache-oscuro", qty: 3, delivery: "ahora" },
      { product: "bombon-clasico", variant: "ganache-oscuro", qty: 10, delivery: "encargo" },
    ]);
    expect(left).toBe(produced - 3);
  });

  it("lo agotado hoy no alcanza para ya, pero sí se puede encargar", () => {
    const line = { product: "fresas-cubiertas", variant: "unica", qty: 2 };
    expect(stockStatus(availableStock("fresas-cubiertas", "unica"))).toBe("agotado");
    expect(shortages([line], "ahora")).toEqual([{ ...line, available: 0 }]);
    expect(shortages([line], "encargo")).toEqual([]);
  });

  it("la cantidad para entrega inmediata no pasa de lo producido", () => {
    expect(maxQuantity(3, "ahora")).toBe(3);
    expect(maxQuantity(0, "encargo")).toBeGreaterThan(0);
  });

  it("un pack está disponible según las piezas producidas", () => {
    const lata = getProduct("san-valentin-20") as PackProduct;
    // 6 frambuesas por lata y hoy hay 8 → solo 1 lata
    expect(packsAvailable(lata.contents)).toBe(1);
  });
});
