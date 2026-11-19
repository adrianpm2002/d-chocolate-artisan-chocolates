import { describe, expect, it } from "vitest";
import { getPiece, getVariant } from "./catalog";
import { placeOrder } from "./orders";

describe("pedidos", () => {
  it("un pedido hecho no cambia de precio aunque cambie el catálogo", () => {
    const variant = getVariant(getPiece("bombon-clasico")!, "maracuya")!;
    const original = variant.price;
    const order = placeOrder({
      lines: [{ product: "bombon-clasico", variant: "maracuya", label: "Bombón clásico · Maracuyá", qty: 3, unitPrice: variant.price }],
      payment: "efectivo",
      delivery: "ahora",
    });
    try {
      variant.price = original + 50;
      expect(order.subtotal).toBe(original * 3);
      expect(order.lines[0]!.unitPrice).toBe(original);
      expect(order.total.amount).toBe(Math.round(original * 3 * 0.8 * 100) / 100);
    } finally {
      variant.price = original;
    }
  });
});
