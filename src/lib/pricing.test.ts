import { describe, expect, it } from "vitest";
import { formatMoney, formatPrice, priceFor } from "./pricing";

describe("precios", () => {
  it("el precio del catálogo es el de transferencia, en CUP", () => {
    expect(priceFor(514, "transferencia")).toEqual({ amount: 514, currency: "CUP" });
    expect(formatPrice(514)).toBe("514 CUP");
  });

  it("en efectivo se descuenta un 20%", () => {
    expect(priceFor(18, "efectivo")).toEqual({ amount: 14.4, currency: "CUP" });
    expect(priceFor(514, "efectivo").amount).toBe(411.2);
    expect(formatMoney(priceFor(18, "efectivo"))).toBe("14,40 CUP");
  });
});
