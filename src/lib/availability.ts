import type { PackSlot, Product } from "./catalog";

/**
 * Availability = what production has ready today.
 * Orders for a future date ("encargo") are produced apart, so they never consume today's stock.
 */

export type Delivery = "ahora" | "encargo";

export const DELIVERIES: { id: Delivery; label: string; detail: string }[] = [
  { id: "ahora", label: "Lo antes posible", detail: "De lo que ya está hecho" },
  { id: "encargo", label: "Por encargo", detail: "Para otra fecha" },
];

export const LOW_STOCK = 5;
export const MAX_QUANTITY = 50;

/** Sample of today's production: units ready per product and variant. */
const PRODUCED: Record<string, number> = {
  "bombon-clasico:ganache-oscuro": 40,
  "bombon-clasico:praline-avellana": 24,
  "bombon-clasico:caramelo-salado": 6,
  "bombon-clasico:maracuya": 12,
  "bombon-clasico:frutos-rojos": 30,
  "bombon-corazon:ganache-leche": 30,
  "bombon-corazon:fresa": 20,
  "bombon-corazon:frambuesa": 8,
  "trufa-artesanal:cacao": 15,
  "trufa-artesanal:cafe": 10,
  "trufa-artesanal:coco": 0,
  "turron-artesanal:almendra": 16,
  "turron-artesanal:avellana": 10,
  "turron-artesanal:pistache": 4,
  "tableta-oscura-70:unica": 12,
  "fresas-cubiertas:unica": 0,
  "tableta-blanca-frambuesa:unica": 3,
  "paletas-de-chocolate:unica": 0,
};

export function producedStock(product: string, variant: string) {
  return PRODUCED[`${product}:${variant}`] ?? 0;
}

export type Reservation = { product: string; variant: string; qty: number; delivery: Delivery };

/** Units still available for immediate delivery. Only "ahora" orders take from today's production. */
export function availableStock(product: string, variant: string, reservations: Reservation[] = []) {
  const taken = reservations
    .filter((r) => r.delivery === "ahora" && r.product === product && r.variant === variant)
    .reduce((sum, r) => sum + r.qty, 0);
  return Math.max(0, producedStock(product, variant) - taken);
}

export type StockStatus = "disponible" | "pocas" | "agotado";

export function stockStatus(units: number): StockStatus {
  if (units <= 0) return "agotado";
  return units <= LOW_STOCK ? "pocas" : "disponible";
}

export type Line = { product: string; variant: string; qty: number };
export type Shortage = Line & { available: number };

export function slotLines(slots: (PackSlot | null)[]): Line[] {
  return slots.filter((s): s is PackSlot => Boolean(s)).map((s) => ({ product: s.piece, variant: s.variant, qty: 1 }));
}

/** What can't be delivered now. Orders for another date never fall short. */
export function shortages(lines: Line[], delivery: Delivery, reservations: Reservation[] = []): Shortage[] {
  if (delivery === "encargo") return [];
  const wanted = new Map<string, Line>();
  for (const l of lines) {
    const key = `${l.product}:${l.variant}`;
    const prev = wanted.get(key);
    wanted.set(key, { ...l, qty: (prev?.qty ?? 0) + l.qty });
  }
  const result: Shortage[] = [];
  for (const l of wanted.values()) {
    const available = availableStock(l.product, l.variant, reservations);
    if (l.qty > available) result.push({ ...l, available });
  }
  return result;
}

/** How many copies of a pack today's production can fill. */
export function packsAvailable(slots: (PackSlot | null)[], reservations: Reservation[] = []) {
  const lines = slotLines(slots);
  if (lines.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const l of lines) counts.set(`${l.product}:${l.variant}`, (counts.get(`${l.product}:${l.variant}`) ?? 0) + 1);
  let packs = Infinity;
  for (const [key, count] of counts) {
    const [product, variant] = key.split(":") as [string, string];
    packs = Math.min(packs, Math.floor(availableStock(product, variant, reservations) / count));
  }
  return packs;
}

/** Units ready today: all variants of an individual product, or how many packs can be filled. */
export function productStock(product: Product) {
  if (product.kind === "pack") return packsAvailable(product.contents);
  return product.variants.reduce((sum, v) => sum + availableStock(product.slug, v.id), 0);
}

export function maxQuantity(stock: number, delivery: Delivery) {
  return delivery === "encargo" ? MAX_QUANTITY : Math.min(stock, MAX_QUANTITY);
}

