import {
  type Container,
  type PackSlot,
  getPiece,
  getVariant,
  slotPrice,
} from "@/lib/catalog";

export type Slots = (PackSlot | null)[];

/* ---------- Slot operations (pure, so packs behave the same everywhere) ---------- */

export function emptySlots(capacity: number): Slots {
  return Array.from({ length: capacity }, () => null);
}

export function filledCount(slots: Slots) {
  return slots.filter(Boolean).length;
}

/** Places a piece at `target` when that slot is empty, otherwise in the first empty slot. */
export function addPiece(slots: Slots, slot: PackSlot, target?: number | null) {
  const index =
    target != null && target >= 0 && target < slots.length && !slots[target]
      ? target
      : slots.findIndex((s) => !s);
  if (index === -1) return { slots, index: -1 };
  const next = [...slots];
  next[index] = slot;
  return { slots: next, index };
}

export function removeAt(slots: Slots, index: number): Slots {
  const next = [...slots];
  next[index] = null;
  return next;
}

/** Changes the filling of one slot. The piece type stays the same. */
export function setVariantAt(slots: Slots, index: number, variant: string): Slots {
  const current = slots[index];
  if (!current) return slots;
  const piece = getPiece(current.piece);
  if (!piece || !getVariant(piece, variant)) return slots;
  const next = [...slots];
  next[index] = { piece: current.piece, variant };
  return next;
}

/** Changes the filling of every slot holding the same piece type. */
export function setVariantForPiece(slots: Slots, pieceSlug: string, variant: string): Slots {
  const piece = getPiece(pieceSlug);
  if (!piece || !getVariant(piece, variant)) return slots;
  return slots.map((s) => (s && s.piece === pieceSlug ? { piece: pieceSlug, variant } : s));
}

/** Moves pieces into a container of another size, keeping their order. */
export function fitToCapacity(slots: Slots, capacity: number) {
  const pieces = slots.filter((s): s is PackSlot => Boolean(s));
  const kept = pieces.slice(0, capacity);
  return {
    slots: [...kept, ...emptySlots(capacity - kept.length)],
    dropped: pieces.length - kept.length,
  };
}

export type SlotGroup = { piece: string; variant: string; count: number; unitPrice: number };

export function groupSlots(slots: Slots): SlotGroup[] {
  const groups = new Map<string, SlotGroup>();
  for (const s of slots) {
    if (!s) continue;
    const key = `${s.piece}:${s.variant}`;
    const g = groups.get(key);
    if (g) g.count += 1;
    else groups.set(key, { piece: s.piece, variant: s.variant, count: 1, unitPrice: slotPrice(s) });
  }
  return [...groups.values()];
}

export function slotsEqual(a: Slots, b: Slots) {
  return a.length === b.length && a.every((s, i) => s?.piece === b[i]?.piece && s?.variant === b[i]?.variant);
}

/* ---------- Geometry for the visual preview (percentages of the container) ---------- */

export type SlotPosition = { x: number; y: number; size: number };

const HEART_ROWS: { y: number; xs: number[] }[] = [
  { y: 29, xs: [21, 37, 63, 79] },
  { y: 46, xs: [20, 40, 60, 80] },
  { y: 63, xs: [31, 50, 69] },
  { y: 79, xs: [50] },
];

export function slotLayout(container: Container): { aspect: number; slots: SlotPosition[] } {
  if (container.shape === "caja" && container.grid) {
    const { cols, rows } = container.grid;
    const pad = 0.35;
    const w = cols + pad * 2;
    const h = rows + pad * 2;
    const slots: SlotPosition[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({
          x: ((pad + c + 0.5) / w) * 100,
          y: ((pad + r + 0.5) / h) * 100,
          size: (0.84 / w) * 100,
        });
      }
    }
    return { aspect: w / h, slots };
  }

  if (container.shape === "corazon") {
    const slots = HEART_ROWS.flatMap((row) => row.xs.map((x) => ({ x, y: row.y, size: 14 })));
    return { aspect: 1, slots: slots.slice(0, container.capacity) };
  }

  const rings = container.rings ?? [container.capacity];
  const radii = rings.length === 1 ? [0] : rings.map((_, i) => (i / (rings.length - 1)) * 34 + (i > 0 ? 2 : 0));
  const slots: SlotPosition[] = [];
  rings.forEach((count, ring) => {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i / count) * Math.PI * 2 + (ring % 2 ? Math.PI / count : 0);
      slots.push({
        x: 50 + (radii[ring] ?? 0) * Math.cos(angle),
        y: 50 + (radii[ring] ?? 0) * Math.sin(angle),
        size: 14.5,
      });
    }
  });
  return { aspect: 1, slots };
}
