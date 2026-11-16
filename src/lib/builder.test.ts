import { describe, expect, it } from "vitest";
import { getProduct, productPrice } from "./catalog";
import { buildPrice, buildReducer, parseBuildSearch, startBuild, type BuildAction } from "./builder";
import { filledCount } from "./packs";

const run = (actions: BuildAction[], start = startBuild({ envase: "cajita-6" })) => actions.reduce(buildReducer, start);
const trufaCafe = { piece: "trufa-artesanal", variant: "cafe" };

describe("armador de packs", () => {
  it("el total suma envase, rellenos, listón, detalle y extras", () => {
    const build = run([{ type: "fill", slot: trufaCafe }]);
    expect(buildPrice(build)).toBe(25 + 6 * 19);
    const decorated = run([{ type: "ribbon", id: "rosa" }, { type: "topper", id: "sello" }, { type: "extra", id: "tarjeta" }], build);
    expect(buildPrice(decorated)).toBe(139 + 15 + 10 + 10);
  });

  it("un pack predefinido arranca con su precio y solo deja cambiar rellenos", () => {
    const start = startBuild({ base: "bombones-surtidos" });
    expect(buildPrice(start)).toBe(productPrice(getProduct("bombones-surtidos")!));
    const tried = run(
      [{ type: "removeAt", index: 0 }, { type: "container", id: "cajita-6" }, { type: "clear" }, { type: "add", slot: trufaCafe }],
      start,
    );
    expect(tried.slots).toEqual(start.slots);
    expect(tried.container).toBe("caja-16");
    const changed = run([{ type: "variantAt", index: 0, variant: "frutos-rojos" }], start);
    expect(buildPrice(changed) - buildPrice(start)).toBe(4);
  });

  it("al desbloquear un pack predefinido se pueden quitar piezas", () => {
    const build = run([{ type: "unlock" }, { type: "removeAt", index: 0 }], startBuild({ base: "bombones-surtidos" }));
    expect(filledCount(build.slots)).toBe(15);
  });

  it("completar llena solo los espacios vacíos", () => {
    const build = run([{ type: "add", slot: { piece: "bombon-corazon", variant: "fresa" } }, { type: "fill", slot: trufaCafe }]);
    expect(build.slots[0]).toEqual({ piece: "bombon-corazon", variant: "fresa" });
    expect(filledCount(build.slots)).toBe(6);
  });

  it("los extras se activan y desactivan, y la dedicatoria tiene máximo 120 caracteres", () => {
    const on = run([{ type: "extra", id: "bolsa" }]);
    expect(on.extras).toEqual(["bolsa"]);
    expect(run([{ type: "extra", id: "bolsa" }], on).extras).toEqual([]);
    expect(run([{ type: "message", text: "a".repeat(200) }]).message).toHaveLength(120);
  });

  it("ignora envases y packs desconocidos en la dirección", () => {
    expect(parseBuildSearch({ envase: "caja-99", base: "bombon-clasico" })).toEqual({ envase: undefined, base: undefined });
    expect(parseBuildSearch({ envase: "corazon-12" }).envase).toBe("corazon-12");
  });
});
