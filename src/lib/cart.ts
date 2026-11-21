import { type Build, buildPrice } from "./builder";
import { type IndividualProduct, type PackProduct, getContainer, productPrice } from "./catalog";
import { type Delivery, type Line, MAX_QUANTITY, shortages, slotLines } from "./availability";
import { DEFAULT_PAYMENT, type PaymentMethodId, priceFor } from "./pricing";

export type CartItem = {
  id: string;
  product: string;
  label: string;
  detail: string;
  image?: string;
  variant?: string;
  build?: Build;
  unitPrice: number;
  qty: number;
  delivery: Delivery;
};
export type CartState = { items: CartItem[]; payment: PaymentMethodId };
export const initialCart: CartState = { items: [], payment: DEFAULT_PAYMENT };

function itemId(product: string, variant: string | undefined, build: Build | undefined, delivery: Delivery) {
  return build
    ? `pack:${JSON.stringify([product, build.container, build.slots, build.ribbon, build.topper, [...build.extras].sort(), build.message, delivery])}`
    : `individual:${product}:${variant ?? "unica"}:${delivery}`;
}

export function individualItem(product: IndividualProduct, variantId: string, qty: number, delivery: Delivery): CartItem {
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) throw new Error("Relleno no disponible");
  return {
    id: itemId(product.slug, variant.id, undefined, delivery),
    product: product.slug, label: product.name, detail: variant.label,
    ...(product.image ? { image: product.image } : {}),
    variant: variant.id, unitPrice: variant.price, qty, delivery,
  };
}

export function buildItem(build: Build, delivery: Delivery, label = "Caja personalizada", product = "personalizado"): CartItem {
  const container = getContainer(build.container);
  if (!container || build.slots.length !== container.capacity || build.slots.some((s) => !s)) {
    throw new Error("Completa tu caja antes de agregarla");
  }
  const copy: Build = { ...build, slots: build.slots.map((s) => s ? { ...s } : null), extras: [...build.extras] };
  return {
    id: itemId(product, undefined, copy, delivery),
    product, label, detail: `${container.label} · ${container.capacity} piezas`,
    build: copy, unitPrice: buildPrice(copy), qty: 1, delivery,
  };
}

export function predefinedItem(product: PackProduct, delivery: Delivery): CartItem {
  const item = buildItem({ base: product.slug, locked: true, container: product.container, slots: product.contents,
    ribbon: "sin-liston", topper: "ninguno", extras: [], message: "" }, delivery, product.name, product.slug);
  return { ...item, unitPrice: productPrice(product) };
}

export function itemLines(item: CartItem): Line[] {
  if (item.build) return slotLines(item.build.slots).map((l) => ({ ...l, qty: l.qty * item.qty }));
  return [{ product: item.product, variant: item.variant ?? "unica", qty: item.qty }];
}

export function cartSummary(state: CartState) {
  const subtotal = Math.round(state.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0) * 100) / 100;
  const total = priceFor(subtotal, state.payment);
  const immediate = state.items.filter((i) => i.delivery === "ahora").flatMap(itemLines);
  const future = state.items.filter((i) => i.delivery === "encargo").flatMap(itemLines);
  return { subtotal, total, discount: Math.round((subtotal - total.amount) * 100) / 100,
    count: state.items.reduce((sum, i) => sum + i.qty, 0),
    lack: shortages(immediate, "ahora"), approval: shortages(future, "ahora").length > 0 };
}

export type CartAction =
  | { type: "add"; item: CartItem; payment?: PaymentMethodId }
  | { type: "quantity"; id: string; qty: number }
  | { type: "delivery"; id: string; delivery: Delivery }
  | { type: "remove"; id: string }
  | { type: "payment"; payment: PaymentMethodId }
  | { type: "clear" };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const qty = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(action.item.qty)));
      if (!Number.isFinite(qty)) return state;
      const existing = state.items.find((i) => i.id === action.item.id);
      return { payment: action.payment ?? state.payment, items: existing
        ? state.items.map((i) => i.id === existing.id ? { ...i, qty: Math.min(MAX_QUANTITY, i.qty + qty) } : i)
        : [...state.items, { ...action.item, qty }] };
    }
    case "quantity":
      if (!Number.isInteger(action.qty) || action.qty < 1 || action.qty > MAX_QUANTITY) return state;
      return { ...state, items: state.items.map((i) => i.id === action.id ? { ...i, qty: action.qty } : i) };
    case "delivery": {
      const item = state.items.find((i) => i.id === action.id);
      if (!item || item.delivery === action.delivery) return state;
      return cartReducer({ ...state, items: state.items.filter((i) => i.id !== item.id) }, {
        type: "add", item: { ...item, delivery: action.delivery, id: itemId(item.product, item.variant, item.build, action.delivery) },
      });
    }
    case "remove": return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "payment": return { ...state, payment: action.payment };
    case "clear": return { ...state, items: [] };
  }
}