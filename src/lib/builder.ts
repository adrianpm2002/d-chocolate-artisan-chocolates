import {
  CONTAINERS,
  type PackSlot,
  getContainer,
  getExtra,
  getPiece,
  getProduct,
  getRibbon,
  getTopper,
  getVariant,
  packPrice,
} from "@/lib/catalog";
import {
  type Slots,
  addPiece,
  emptySlots,
  fitToCapacity,
  removeAt,
  setVariantAt,
  setVariantForPiece,
} from "@/lib/packs";

/** Everything the customer chose in the pack builder. */
export type Build = {
  /** Predefined pack the build started from, if any. */
  base: string | null;
  /** A locked build keeps its container and pieces; only fillings and decoration change. */
  locked: boolean;
  container: string;
  slots: Slots;
  ribbon: string;
  topper: string;
  extras: string[];
  message: string;
};

export const MESSAGE_MAX = 120;
export const DEFAULT_CONTAINER = "caja-12";

export type BuildSearch = { envase?: string | undefined; base?: string | undefined };

export function parseBuildSearch(search: Record<string, unknown>): BuildSearch {
  const envase = search["envase"];
  const base = search["base"];
  return {
    envase: typeof envase === "string" && getContainer(envase) ? envase : undefined,
    base: typeof base === "string" && getProduct(base)?.kind === "pack" ? base : undefined,
  };
}

export function startBuild(search: BuildSearch): Build {
  const decor = { ribbon: "sin-liston", topper: "ninguno", extras: [] as string[], message: "" };
  const base = search.base ? getProduct(search.base) : undefined;
  if (base?.kind === "pack") {
    return { base: base.slug, locked: true, container: base.container, slots: [...base.contents], ...decor };
  }
  const container = getContainer(search.envase ?? DEFAULT_CONTAINER) ?? CONTAINERS[0]!;
  return { base: null, locked: false, container: container.id, slots: emptySlots(container.capacity), ...decor };
}

export function decorPrice(build: Build) {
  const ribbon = getRibbon(build.ribbon)?.price ?? 0;
  const topper = getTopper(build.topper)?.price ?? 0;
  const extras = build.extras.reduce((sum, id) => sum + (getExtra(id)?.price ?? 0), 0);
  return ribbon + topper + extras;
}

/** Total = container + every piece's filling + ribbon, topper and extras. */
export function buildPrice(build: Build) {
  return packPrice(build.container, build.slots) + decorPrice(build);
}

export type BuildAction =
  | { type: "container"; id: string }
  | { type: "add"; slot: PackSlot; target?: number | null }
  | { type: "removeAt"; index: number }
  | { type: "removeOne"; slot: PackSlot }
  | { type: "fill"; slot: PackSlot }
  | { type: "clear" }
  | { type: "variantAt"; index: number; variant: string }
  | { type: "variantForPiece"; piece: string; variant: string }
  | { type: "ribbon"; id: string }
  | { type: "topper"; id: string }
  | { type: "extra"; id: string }
  | { type: "message"; text: string }
  | { type: "unlock" };

function validSlot(slot: PackSlot) {
  const piece = getPiece(slot.piece);
  return Boolean(piece && getVariant(piece, slot.variant));
}

export function buildReducer(state: Build, action: BuildAction): Build {
  switch (action.type) {
    case "container": {
      const container = getContainer(action.id);
      if (state.locked || !container || container.id === state.container) return state;
      return { ...state, container: container.id, slots: fitToCapacity(state.slots, container.capacity).slots };
    }
    case "add": {
      if (state.locked || !validSlot(action.slot)) return state;
      const { slots, index } = addPiece(state.slots, action.slot, action.target ?? null);
      return index === -1 ? state : { ...state, slots };
    }
    case "removeAt":
      return state.locked || !state.slots[action.index] ? state : { ...state, slots: removeAt(state.slots, action.index) };
    case "removeOne": {
      if (state.locked) return state;
      let index = -1;
      state.slots.forEach((s, i) => {
        if (s?.piece === action.slot.piece && s.variant === action.slot.variant) index = i;
      });
      return index === -1 ? state : { ...state, slots: removeAt(state.slots, index) };
    }
    case "fill":
      if (state.locked || !validSlot(action.slot)) return state;
      return { ...state, slots: state.slots.map((s) => s ?? { ...action.slot }) };
    case "clear":
      return state.locked ? state : { ...state, slots: emptySlots(state.slots.length) };
    case "variantAt":
      return { ...state, slots: setVariantAt(state.slots, action.index, action.variant) };
    case "variantForPiece":
      return { ...state, slots: setVariantForPiece(state.slots, action.piece, action.variant) };
    case "ribbon":
      return getRibbon(action.id) ? { ...state, ribbon: action.id } : state;
    case "topper":
      return getTopper(action.id) ? { ...state, topper: action.id } : state;
    case "extra": {
      if (!getExtra(action.id)) return state;
      const has = state.extras.includes(action.id);
      return { ...state, extras: has ? state.extras.filter((e) => e !== action.id) : [...state.extras, action.id] };
    }
    case "message":
      return { ...state, message: action.text.slice(0, MESSAGE_MAX) };
    case "unlock":
      return { ...state, locked: false };
  }
}
