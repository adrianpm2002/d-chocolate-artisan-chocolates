import { describe, expect, it } from "vitest";
import { dashboardData, replenishment, salesRange, type Sale } from "./sales-dashboard";

const sales: Sale[] = [
  { date: "2026-11-21", product: "bombon-clasico", qty: 2, revenue: 36, payment: "transferencia" },
  { date: "2026-11-22", product: "bombon-clasico", qty: 3, revenue: 43.2, payment: "efectivo" },
  { date: "2026-11-22", product: "tableta-oscura-70", qty: 1, revenue: 135, payment: "transferencia" },
  { date: "2026-11-01", product: "bombon-clasico", qty: 1, revenue: 18, payment: "transferencia" },
];
describe("dashboard de ventas", () => {
  it("suma lo realmente cobrado, sin descontar el efectivo dos veces", () => {
    const data = dashboardData(sales, "diaria", "2026-11-22");
    expect(data.revenue).toBe(214.2);
    expect(data.orders).toBe(3);
    expect(data.average).toBe(71.4);
    expect(data.ranking[0]?.qty).toBe(5);
    expect(data.ranking[0]?.slug).toBe("bombon-clasico");
  });
  it("agrupa ventas diarias, semanales y mensuales sin perder ingresos", () => {
    expect(dashboardData(sales, "diaria", "2026-11-22").points.at(-1)?.revenue).toBe(178.2);
    expect(dashboardData(sales, "semanal", "2026-11-22").points.at(-1)?.revenue).toBe(214.2);
    expect(dashboardData(sales, "mensual", "2026-11-22").points.at(-1)?.revenue).toBe(232.2);
    expect(salesRange("mensual", "2026-11-22").start).toBe("2026-06-01");
  });
  it("solo alerta de existencias inferiores al mínimo de ejemplo", () => {
    const data = replenishment([
      { id: "a", label: "A", type: "producto", stock: 0, minimum: 5, unit: "uds" },
      { id: "b", label: "B", type: "insumo", stock: 5, minimum: 5, unit: "kg" },
      { id: "c", label: "C", type: "insumo", stock: 2, minimum: 4, unit: "kg" },
    ]);
    expect(data.map((i) => i.id)).toEqual(["a", "c"]);
  });
});