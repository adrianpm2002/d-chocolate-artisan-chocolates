import type { Delivery } from "./availability";
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
};

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
  };
}
