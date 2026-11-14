import { describe, expect, it } from "vitest";
import { CONTAINERS, PRODUCTS, getContainer, packPrice, productPrice, type PackProduct } from "./catalog";
import { addPiece, emptySlots, fitToCapacity, setVariantAt, setVariantForPiece, slotLayout } from "./packs";

const packs = PRODUCTS.filter((p): p is PackProduct => p.kind === "pack");

describe("variantes y packs", () => {
  it("el precio de un producto individual cambia según el relleno", () => {
    const bombon = PRODUCTS.find((p) => p.slug === "bombon-clasico");
    expect(bombon?.kind === "individual" && bombon.variants.map((v) => v.price)).toEqual([18, 20, 21, 22, 22]);
    expect(productPrice(bombon!)).toBe(18);
  });

  it("el precio de un pack es el envase más la suma de sus piezas", () => {
    const sanValentin = packs.find((p) => p.slug === "san-valentin-20")!;
    // 60 envase + 24 + 7×22 + 6×22 + 6×24
    expect(productPrice(sanValentin)).toBe(514);
  });

  it("cambiar el relleno de una pieza del pack actualiza el precio", () => {
    const caja = packs.find((p) => p.slug === "bombones-surtidos")!;
    const before = packPrice(caja.container, caja.contents);
    const after = packPrice(caja.container, setVariantAt(caja.contents, 0, "frutos-rojos"));
    expect(after - before).toBe(4);
  });

  it("un pack predefinido solo cambia rellenos, no el tipo de pieza", () => {
    const caja = packs.find((p) => p.slug === "bombones-surtidos")!;
    expect(setVariantAt(caja.contents, 0, "pistache")).toBe(caja.contents);
    const all = setVariantForPiece(caja.contents, "bombon-clasico", "maracuya");
    expect(all.every((s) => s?.variant === "maracuya")).toBe(true);
  });

  it("no se pueden agregar más piezas que la capacidad del envase", () => {
    let slots = emptySlots(6);
    for (let i = 0; i < 6; i++) slots = addPiece(slots, { piece: "trufa-artesanal", variant: "cafe" }).slots;
    expect(addPiece(slots, { piece: "trufa-artesanal", variant: "cafe" }).index).toBe(-1);
  });

  it("al cambiar a un envase más pequeño se quitan las piezas que no caben", () => {
    const slots = Array.from({ length: 16 }, () => ({ piece: "bombon-clasico", variant: "maracuya" }));
    const { slots: next, dropped } = fitToCapacity(slots, 6);
    expect(next).toHaveLength(6);
    expect(dropped).toBe(10);
  });

  it("cada pack predefinido llena exactamente su envase", () => {
    for (const p of packs) expect(p.contents).toHaveLength(getContainer(p.container)!.capacity);
    for (const c of CONTAINERS) expect(slotLayout(c).slots).toHaveLength(c.capacity);
  });
});
