import { describe, expect, it } from "vitest";
import { buildItem, cartReducer, cartSummary, individualItem, initialCart, predefinedItem } from "./cart";
import { getProduct } from "./catalog";
import { startBuild } from "./builder";

function bonbon(variant = "ganache-oscuro", qty = 1) {
  const product = getProduct("bombon-clasico");
  if (!product || product.kind !== "individual") throw new Error("Producto faltante");
  return individualItem(product, variant, qty, "ahora");
}

describe("carrito", () => {
  it("suma productos iguales y mantiene separados sus rellenos", () => {
    let cart = cartReducer(initialCart, { type: "add", item: bonbon() });
    cart = cartReducer(cart, { type: "add", item: bonbon("ganache-oscuro", 2) });
    cart = cartReducer(cart, { type: "add", item: bonbon("maracuya") });
    expect(cart.items).toHaveLength(2);
    expect(cart.items[0]?.qty).toBe(3);
    expect(cartSummary(cart).subtotal).toBe(76);
  });
  it("aplica el 20% en efectivo al pedido completo, incluida decoración", () => {
    const build = startBuild({ base: "san-valentin-20" });
    build.ribbon = "rojo";
    const item = buildItem(build, "encargo");
    const cart = cartReducer(initialCart, { type: "add", item, payment: "efectivo" });
    expect(item.unitPrice).toBe(529);
    expect(cartSummary(cart).total.amount).toBe(423.2);
    expect(cartSummary(cart).total.currency).toBe("CUP");
    expect(cartSummary({ ...cart, payment: "transferencia" }).total.amount).toBe(item.unitPrice);
  });
  it("suma todas las cajas y unidades al revisar producción, sin reservar stock", () => {
    const product = getProduct("san-valentin-20");
    if (!product || product.kind !== "pack") throw new Error("Pack faltante");
    const item = predefinedItem(product, "ahora");
    const cart = cartReducer(initialCart, { type: "add", item: { ...item, qty: 2 } });
    expect(cartSummary(cart).lack.some((l) => l.product === "bombon-corazon" && l.variant === "frambuesa")).toBe(true);
    const future = cartReducer(cart, { type: "delivery", id: item.id, delivery: "encargo" });
    expect(cartSummary(future).lack).toHaveLength(0);
    expect(cartSummary(future).approval).toBe(true);
  });
  it("conserva la caja y el mensaje sin que ediciones posteriores los alteren", () => {
    const build = startBuild({ base: "san-valentin-20" });
    build.message = "Para ti";
    const item = buildItem(build, "encargo");
    build.slots[0] = null;
    build.message = "Otro";
    expect(item.build?.slots[0]).toEqual({ piece: "bombon-corazon", variant: "fresa" });
    expect(item.build?.message).toBe("Para ti");
  });
  it("actualiza el total al cambiar cantidades y quitar productos", () => {
    const item = bonbon();
    let cart = cartReducer(initialCart, { type: "add", item });
    cart = cartReducer(cart, { type: "quantity", id: item.id, qty: 3 });
    expect(cartSummary(cart).total.amount).toBe(54);
    cart = cartReducer(cart, { type: "remove", id: item.id });
    expect(cartSummary(cart).total.amount).toBe(0);
  });
  it("no mezcla entregas distintas y agrupa al cambiar a la misma entrega", () => {
    const item = bonbon();
    let cart = cartReducer(initialCart, { type: "add", item });
    cart = cartReducer(cart, { type: "delivery", id: item.id, delivery: "encargo" });
    cart = cartReducer(cart, { type: "add", item });
    expect(cart.items).toHaveLength(2);
    cart = cartReducer(cart, { type: "delivery", id: item.id, delivery: "encargo" });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.qty).toBe(2);
    expect(cart.items[0]?.delivery).toBe("encargo");
  });
});