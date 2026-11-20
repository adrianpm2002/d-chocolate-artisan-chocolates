import { type Delivery, shortages } from "./availability";
import { type Money, type PaymentMethodId, priceFor } from "./pricing";

/** One line of a placed order. `unitPrice` is the transfer price (CUP) copied at the moment of ordering. */
export type OrderLine = { product: string; variant?: string; label: string; qty: number; unitPrice: number };

export type Order = {
  placedAt: string;
  payment: PaymentMethodId;
  delivery: Delivery;
  lines: OrderLine[];
  /** Sum of the lines at transfer price. */
  subtotal: number;
  /** What the customer pays with the chosen payment method. */
  total: Money;
  /** Orders for another date that include items sold out today wait for the admin's approval. */
  status: "confirmado" | "pendiente-aprobacion";
};

/** True when an order for another date includes something today's production can't cover. */
export function needsApproval(lines: { product: string; variant?: string | undefined; qty: number }[], delivery: Delivery) {
  if (delivery !== "encargo") return false;
  return shortages(lines.map((l) => ({ product: l.product, variant: l.variant ?? "unica", qty: l.qty })), "ahora").length > 0;
}

/**
 * Places an order with its prices frozen: it keeps its own copy of every price,
 * so later catalog changes never alter what an existing order costs.
 */
export function placeOrder(input: {
  lines: OrderLine[];
  payment: PaymentMethodId;
  delivery: Delivery;
  placedAt?: Date;
}): Order {
  const lines = input.lines.map((l) => ({ ...l }));
  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0) * 100) / 100;
  return {
    placedAt: (input.placedAt ?? new Date()).toISOString(),
    payment: input.payment,
    delivery: input.delivery,
    lines,
    subtotal,
    total: priceFor(subtotal, input.payment),
    status: needsApproval(lines, input.delivery) ? "pendiente-aprobacion" : "confirmado",
  };
}
