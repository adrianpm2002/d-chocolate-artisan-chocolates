import type { KeyboardEvent } from "react";
import {
  type Container,
  type RibbonTone,
  type TopperKind,
  getPiece,
  getVariant,
} from "@/lib/catalog";
import { type Slots, slotLayout } from "@/lib/packs";
import { cn } from "@/lib/utils";
import { ArtDefs, BowArt, HEART_PATH, PieceArt, Sparkle, TopperArt, useSvgPrefix } from "./art";

type Theme = { frame: string; inner: string; cup: string; pleat: string };

const THEMES: Record<Container["theme"], Theme> = {
  chocolate: { frame: "var(--cacao)", inner: "var(--caramel)", cup: "var(--sand)", pleat: "var(--caramel)" },
  caramelo: { frame: "var(--caramel)", inner: "var(--sand)", cup: "var(--card)", pleat: "var(--caramel)" },
  rosa: { frame: "var(--rosa)", inner: "var(--blush)", cup: "var(--card)", pleat: "var(--rosa-deep)" },
  sanvalentin: { frame: "var(--rosa-deep)", inner: "var(--blush)", cup: "var(--card)", pleat: "var(--rosa-deep)" },
};

export type SceneDecor = { ribbon?: RibbonTone | null; topper?: TopperKind | null; sparkle?: boolean };

type Props = {
  container: Container;
  slots: Slots;
  decor?: SceneDecor;
  selected?: number | null;
  /** Next empty slot gets a "+" hint when the scene is interactive. */
  onSlotClick?: (index: number) => void;
  className?: string;
  title?: string;
};

/** Live drawing of a container with its pieces, ribbon and topper. */
export function PackScene({ container, slots, decor, selected = null, onSlotClick, className, title }: Props) {
  const prefix = useSvgPrefix();
  const layout = slotLayout(container);
  const W = 100 * layout.aspect;
  const H = 100;
  const theme = THEMES[container.theme];
  const interactive = Boolean(onSlotClick);
  const nextEmpty = slots.findIndex((s) => !s);
  const frameClip = `${prefix}-frame`;

  const frame = (inset: number) => {
    if (container.shape === "caja") {
      return <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} rx={Math.max(2, 7 - inset / 2)} />;
    }
    if (container.shape === "circulo") return <circle cx={50} cy={50} r={49 - inset} />;
    const s = 1 - inset / 50;
    return (
      <path
        d="M50 94 C40 86 2 64 2 34 C2 15 16 4 30 4 C40 4 46 10 50 17 C54 10 60 4 70 4 C84 4 98 15 98 34 C98 64 60 86 50 94 Z"
        transform={`translate(50 50) scale(${s}) translate(-50 -50)`}
      />
    );
  };

  const inset = container.shape === "caja" ? 3.2 : container.shape === "circulo" ? 4.6 : 5;
  const bow = container.shape === "corazon" ? { x: 50, y: 17 } : { x: W / 2, y: 1.5 };
  const topperAt =
    container.shape === "caja"
      ? { x: W - 6, y: H - 6 }
      : container.shape === "circulo"
        ? { x: 85, y: 85 }
        : { x: 84, y: 12 };

  const label = (i: number) => {
    const s = slots[i];
    if (!s) return `Espacio ${i + 1}, vacío`;
    const piece = getPiece(s.piece);
    const variant = piece && getVariant(piece, s.variant);
    return `Espacio ${i + 1}: ${piece?.name ?? ""}, ${variant?.label ?? ""}`;
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSlotClick?.(i);
    }
  };

  return (
    <svg
      viewBox={`-8 -14 ${W + 16} ${H + 22}`}
      className={cn("block", className)}
      style={{ filter: "drop-shadow(0 18px 22px color-mix(in oklab, var(--primary) 30%, transparent))" }}
      role={interactive ? "group" : "img"}
      aria-label={title ?? `${container.label} con ${slots.filter(Boolean).length} de ${container.capacity} piezas`}
    >
      <ArtDefs prefix={prefix} />
      <clipPath id={frameClip}>{frame(0)}</clipPath>

      {/* Container */}
      <g style={{ fill: theme.frame }}>{frame(0)}</g>
      <g fill={`url(#${prefix}-sheen)`}>{frame(0)}</g>
      {decor?.ribbon && (
        <g clipPath={`url(#${frameClip})`}>
          <g style={{ fill: ribbonVar(decor.ribbon) }}>
            <rect x={bow.x - 3.5} y={-2} width={7} height={H + 4} />
            <rect x={-2} y={H / 2 - 3.5} width={W + 4} height={7} />
          </g>
        </g>
      )}
      <g style={{ fill: theme.inner }}>{frame(inset)}</g>
      <g fill={`url(#${prefix}-sheen)`} opacity={0.6}>{frame(inset)}</g>

      {container.theme === "sanvalentin" && container.shape === "circulo" && (
        <g style={{ fill: "var(--blush)" }}>
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return (
              <path
                key={i}
                d={HEART_PATH}
                transform={`translate(${50 + 46.7 * Math.cos(a)} ${50 + 46.7 * Math.sin(a)}) rotate(${(a * 180) / Math.PI + 90}) scale(0.045)`}
              />
            );
          })}
        </g>
      )}

      {/* Slots */}
      {layout.slots.map((pos, i) => {
        const cx = (pos.x / 100) * W;
        const cy = (pos.y / 100) * H;
        const d = (pos.size / 100) * W;
        const slot = slots[i];
        const piece = slot ? getPiece(slot.piece) : undefined;
        const look = piece && slot ? getVariant(piece, slot.variant)?.look : undefined;
        const isSelected = selected === i;
        return (
          <g
            key={i}
            {...(interactive
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": label(i),
                  "aria-pressed": isSelected,
                  onClick: () => onSlotClick?.(i),
                  onKeyDown: (e: KeyboardEvent) => onKey(e, i),
                  className: "cursor-pointer outline-none focus-visible:opacity-80",
                }
              : {})}
          >
            <circle cx={cx} cy={cy} r={(d / 2) * 1.1} style={{ fill: theme.cup }} />
            <circle
              cx={cx}
              cy={cy}
              r={(d / 2) * 1.02}
              fill="none"
              style={{ stroke: theme.pleat }}
              strokeOpacity={0.35}
              strokeWidth={d * 0.06}
              strokeDasharray={`${d * 0.05} ${d * 0.05}`}
            />
            {piece?.piece && look ? (
              <g transform={`translate(${cx} ${cy}) scale(${d / 100})`}>
                <g key={`${slot?.piece}-${slot?.variant}`} className="animate-pop">
                  <PieceArt prefix={prefix} shape={piece.piece} look={look} />
                </g>
              </g>
            ) : (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={(d / 2) * 0.72}
                  fill="none"
                  style={{ stroke: theme.pleat }}
                  strokeOpacity={0.5}
                  strokeWidth={0.6}
                  strokeDasharray="2 1.6"
                />
                {interactive && (i === nextEmpty || isSelected) && (
                  <g style={{ stroke: theme.pleat }} strokeWidth={d * 0.07} strokeLinecap="round" className="animate-pulse">
                    <line x1={cx - d * 0.16} y1={cy} x2={cx + d * 0.16} y2={cy} />
                    <line x1={cx} y1={cy - d * 0.16} x2={cx} y2={cy + d * 0.16} />
                  </g>
                )}
              </>
            )}
            {isSelected && (
              <circle cx={cx} cy={cy} r={(d / 2) * 1.22} fill="none" style={{ stroke: "var(--rosa-deep)" }} strokeWidth={1.6} />
            )}
          </g>
        );
      })}

      {decor?.sparkle &&
        layout.slots.map((pos, i) => {
          if (!slots[i] || i % 2) return null;
          const d = (pos.size / 100) * W;
          return (
            <Sparkle key={i} x={(pos.x / 100) * W + d * 0.28} y={(pos.y / 100) * H - d * 0.28} size={d * 0.16} delay={i * 120} />
          );
        })}

      {decor?.ribbon && (
        <g transform={`translate(${bow.x} ${bow.y}) scale(${container.shape === "caja" ? 0.42 * Math.min(1.25, layout.aspect) : 0.42})`}>
          <BowArt prefix={prefix} tone={decor.ribbon} />
        </g>
      )}
      {decor?.topper && (
        <g transform={`translate(${topperAt.x} ${topperAt.y}) scale(0.62)`}>
          <TopperArt prefix={prefix} kind={decor.topper} />
        </g>
      )}
    </svg>
  );
}

function ribbonVar(tone: RibbonTone) {
  return tone === "rojo" ? "var(--liston-rojo)" : tone === "dorado" ? "var(--dorado)" : tone === "caramelo" ? "var(--caramel)" : "var(--rosa)";
}
