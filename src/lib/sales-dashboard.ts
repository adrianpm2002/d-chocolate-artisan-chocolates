import { PRODUCTS, getProduct, productPrice } from "./catalog";
import { priceFor, type PaymentMethodId } from "./pricing";

export type SalesView = "diaria" | "semanal" | "mensual";
export type Sale = { date: string; product: string; qty: number; revenue: number; payment: PaymentMethodId };
export type InventoryItem = { id: string; label: string; type: "producto" | "insumo"; stock: number; minimum: number; unit: string };
export const DEMO_TODAY = "2026-11-22";

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
function utcDate(value: string) { return new Date(`${value}T12:00:00Z`); }
export function shiftDate(value: string, days: number) {
  const date = utcDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

/** Deterministic sample receipts; never reads or changes the store's orders or stock. */
export const DEMO_SALES: Sale[] = Array.from({ length: 365 }, (_, index) => {
  const date = shiftDate(DEMO_TODAY, index - 364);
  return Array.from({ length: 3 + (index % 5) }, (_, j): Sale => {
    const product = PRODUCTS[(index * 3 + j * 5) % PRODUCTS.length] ?? PRODUCTS[0];
    if (!product) throw new Error("Catálogo vacío");
    const qty = 1 + ((index + j * 2) % (product.kind === "pack" ? 3 : 12));
    const payment = (index + j) % 3 === 0 ? "efectivo" : "transferencia";
    return { date, product: product.slug, qty, revenue: priceFor(productPrice(product) * qty, payment).amount, payment };
  });
}).flat();

export const DEMO_INVENTORY: InventoryItem[] = [
  { id: "fresas", label: "Fresas cubiertas", type: "producto", stock: 0, minimum: 8, unit: "charolas" },
  { id: "paletas", label: "Paletas de chocolate", type: "producto", stock: 0, minimum: 10, unit: "paquetes" },
  { id: "blanca", label: "Tableta blanca con frambuesa", type: "producto", stock: 3, minimum: 8, unit: "tabletas" },
  { id: "chocolate", label: "Chocolate de cobertura oscuro", type: "insumo", stock: 1.5, minimum: 5, unit: "kg" },
  { id: "cajas", label: "Cajas Celebración · 12 piezas", type: "insumo", stock: 6, minimum: 20, unit: "unidades" },
  { id: "crema", label: "Crema para ganache", type: "insumo", stock: 0, minimum: 3, unit: "litros" },
  { id: "liston", label: "Listón de satín rosa", type: "insumo", stock: 8, minimum: 15, unit: "metros" },
  { id: "avellana", label: "Avellana tostada", type: "insumo", stock: 4, minimum: 2, unit: "kg" },
];

export function replenishment(items: InventoryItem[]) {
  return items.filter((item) => item.stock < item.minimum).sort((a, b) => a.stock / a.minimum - b.stock / b.minimum);
}

export function salesRange(view: SalesView, end: string) {
  if (view === "diaria") return { start: shiftDate(end, -6), end };
  if (view === "semanal") {
    const monday = shiftDate(end, -((utcDate(end).getUTCDay() + 6) % 7));
    return { start: shiftDate(monday, -49), end };
  }
  const start = utcDate(end);
  start.setUTCDate(1);
  start.setUTCMonth(start.getUTCMonth() - 5);
  return { start: isoDate(start), end };
}

export function movePeriod(view: SalesView, end: string, direction: -1 | 1) {
  if (view !== "mensual") return shiftDate(end, direction * (view === "diaria" ? 7 : 56));
  const date = utcDate(end);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + direction * 6);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return isoDate(date);
}

const round = (value: number) => Math.round(value * 100) / 100;
function bucket(date: string, view: SalesView) {
  if (view === "mensual") return `${date.slice(0, 7)}-01`;
  if (view === "semanal") return shiftDate(date, -((utcDate(date).getUTCDay() + 6) % 7));
  return date;
}

export function dashboardData(sales: Sale[], view: SalesView, end: string) {
  const range = salesRange(view, end);
  const selected = sales.filter((s) => s.date >= range.start && s.date <= range.end);
  const points = new Map<string, { date: string; label: string; revenue: number; orders: number }>();
  for (let date = range.start; date <= range.end; date = shiftDate(date, 1)) {
    const key = bucket(date, view);
    if (!points.has(key)) points.set(key, { date: key,
      label: utcDate(key).toLocaleDateString("es", view === "mensual" ? { month: "short", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" }), revenue: 0, orders: 0 });
  }
  const ranking = new Map<string, { slug: string; label: string; qty: number; revenue: number }>();
  for (const sale of selected) {
    const point = points.get(bucket(sale.date, view));
    if (point) { point.revenue += sale.revenue; point.orders += 1; }
    const product = ranking.get(sale.product) ?? { slug: sale.product, label: getProduct(sale.product)?.name ?? sale.product, qty: 0, revenue: 0 };
    product.qty += sale.qty;
    product.revenue += sale.revenue;
    ranking.set(sale.product, product);
  }
  const revenue = round(selected.reduce((sum, s) => sum + s.revenue, 0));
  const orders = selected.length;
  const units = selected.reduce((sum, s) => sum + s.qty, 0);
  const byPayment = (["transferencia", "efectivo"] as const).map((payment) => ({ payment, revenue: round(selected.filter((s) => s.payment === payment).reduce((sum, s) => sum + s.revenue, 0)) }));
  const previousEnd = shiftDate(range.start, -1);
  const duration = Math.round((utcDate(range.end).getTime() - utcDate(range.start).getTime()) / 86400000) + 1;
  const previousStart = shiftDate(previousEnd, -(duration - 1));
  const previousRevenue = sales.filter((s) => s.date >= previousStart && s.date <= previousEnd).reduce((sum, s) => sum + s.revenue, 0);
  return { range, revenue, orders, units, average: orders ? round(revenue / orders) : 0,
    change: previousRevenue ? (revenue - previousRevenue) / previousRevenue * 100 : null,
    points: [...points.values()].map((p) => ({ ...p, revenue: round(p.revenue) })),
    ranking: [...ranking.values()].sort((a, b) => b.qty - a.qty).map((p) => ({ ...p, revenue: round(p.revenue) })), byPayment };
}