/**
 * Money rules. Every catalog price is the bank-transfer price in the base currency (CUP).
 * The payment method decides the discount and the currency the customer sees.
 * Currencies and exchange rates will be set from the admin panel; for now only CUP exists.
 */

export const BASE_CURRENCY = "CUP";

export type Currency = { code: string; label: string; /** Units of this currency per 1 CUP. */ perBase: number };

export const CURRENCIES: Currency[] = [{ code: "CUP", label: "Peso cubano", perBase: 1 }];

export type PaymentMethodId = "transferencia" | "efectivo";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  /** Fraction taken off the transfer price (0.2 = 20%). */
  discount: number;
  currency: string;
};

export const CASH_DISCOUNT = 0.2;

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "transferencia", label: "Transferencia", discount: 0, currency: BASE_CURRENCY },
  { id: "efectivo", label: "Efectivo", discount: CASH_DISCOUNT, currency: BASE_CURRENCY },
];

export const DEFAULT_PAYMENT: PaymentMethodId = "transferencia";

export type Money = { amount: number; currency: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!;
}

export function getPaymentMethod(id: PaymentMethodId) {
  return PAYMENT_METHODS.find((m) => m.id === id) ?? PAYMENT_METHODS[0]!;
}

/** What the customer pays for a catalog (transfer) amount with the given payment method. */
export function priceFor(transferAmount: number, method: PaymentMethodId = DEFAULT_PAYMENT): Money {
  const m = getPaymentMethod(method);
  const currency = getCurrency(m.currency);
  return { amount: round2(transferAmount * (1 - m.discount) * currency.perBase), currency: currency.code };
}

export function formatMoney({ amount, currency }: Money) {
  const whole = Number.isInteger(amount);
  const number = amount.toLocaleString("es", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${number} ${currency}`;
}

/** Formats a catalog amount (transfer price, CUP). */
export function formatPrice(transferAmount: number) {
  return formatMoney({ amount: round2(transferAmount), currency: BASE_CURRENCY });
}
