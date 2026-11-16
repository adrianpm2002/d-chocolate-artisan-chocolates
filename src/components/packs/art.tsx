import { useId } from "react";
import mascotaSello from "@/assets/mascota-sello.png.asset.json";
import type { Accent, PieceLook, PieceShape, RibbonTone, Shell, TopperKind } from "@/lib/catalog";

/* Every drawing uses a -50..50 unit box so it can be placed and scaled anywhere. */

export const SHELL_FILL: Record<Shell, string> = {
  oscuro: "var(--choco-oscuro)",
  leche: "var(--choco-leche)",
  blanco: "var(--choco-blanco)",
  rubi: "var(--choco-rubi)",
};

export const ACCENT_FILL: Record<Accent, string> = {
  rosa: "var(--rosa)",
  caramelo: "var(--caramel)",
  blanco: "var(--choco-blanco)",
  oscuro: "var(--choco-oscuro)",
  dorado: "var(--dorado)",
  pistache: "var(--pistache)",
};

export const RIBBON_FILL: Record<RibbonTone, string> = {
  rosa: "var(--rosa)",
  rojo: "var(--liston-rojo)",
  dorado: "var(--dorado)",
  caramelo: "var(--caramel)",
};

const SHAPE_PATH: Record<PieceShape, string> = {
  redondo: "M0 -44 A44 44 0 1 1 0 44 A44 44 0 1 1 0 -44 Z",
  corazon:
    "M0 42 C-12 33 -46 12 -46 -12 C-46 -30 -33 -42 -19 -42 C-9 -42 -3 -36 0 -29 C3 -36 9 -42 19 -42 C33 -42 46 -30 46 -12 C46 12 12 33 0 42 Z",
  cuadrado: "M-30 -40 H30 Q40 -40 40 -30 V30 Q40 40 30 40 H-30 Q-40 40 -40 30 V-30 Q-40 -40 -30 -40 Z",
  trufa: "M0 -44 C24 -46 45 -27 44 -2 C46 23 27 45 1 44 C-25 46 -45 26 -44 0 C-46 -24 -25 -43 0 -44 Z",
};

export const HEART_PATH = SHAPE_PATH.corazon;

const DUST = [
  [-22, -18], [-8, -30], [10, -26], [26, -14], [-30, 2], [-14, -6], [4, -10], [20, 2], [32, 14],
  [-24, 18], [-6, 12], [12, 16], [-14, 30], [4, 30], [22, 26], [-34, -10], [34, -4], [0, -38], [-2, 0],
];

export function useSvgPrefix() {
  return `p${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** Shared gradients and clip paths. Render once inside every <svg> that draws pieces. */
export function ArtDefs({ prefix }: { prefix: string }) {
  return (
    <defs>
      <radialGradient id={`${prefix}-shade`} cx="34%" cy="28%" r="80%">
        <stop offset="0%" style={{ stopColor: "var(--card)", stopOpacity: 0.6 }} />
        <stop offset="42%" style={{ stopColor: "var(--card)", stopOpacity: 0 }} />
        <stop offset="100%" style={{ stopColor: "var(--foreground)", stopOpacity: 0.45 }} />
      </radialGradient>
      <linearGradient id={`${prefix}-sheen`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={{ stopColor: "var(--card)", stopOpacity: 0.28 }} />
        <stop offset="55%" style={{ stopColor: "var(--card)", stopOpacity: 0 }} />
        <stop offset="100%" style={{ stopColor: "var(--foreground)", stopOpacity: 0.18 }} />
      </linearGradient>
      {(Object.keys(SHAPE_PATH) as PieceShape[]).map((shape) => (
        <clipPath key={shape} id={`${prefix}-clip-${shape}`}>
          <path d={SHAPE_PATH[shape]} />
        </clipPath>
      ))}
    </defs>
  );
}

function Topping({ look }: { look: PieceLook }) {
  const fill = ACCENT_FILL[look.accent];
  switch (look.topping) {
    case "hilos":
      return (
        <g style={{ stroke: fill }} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-46 -12 L-32 2 L-18 -12 L-4 2 L10 -12 L24 2 L38 -12 L52 2" />
          <path d="M-46 10 L-32 24 L-18 10 L-4 24 L10 10 L24 24 L38 10 L52 24" opacity={0.8} />
        </g>
      );
    case "punto":
      return (
        <g>
          <circle cx={0} cy={-4} r={11} style={{ fill }} />
          <circle cx={-3} cy={-8} r={3.5} style={{ fill: "var(--card)" }} opacity={0.6} />
        </g>
      );
    case "polvo":
      return (
        <g style={{ fill }}>
          {DUST.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2.1} />
          ))}
        </g>
      );
    case "nuez":
      return (
        <g transform="rotate(-18)">
          <ellipse cx={0} cy={-6} rx={17} ry={10} style={{ fill }} />
          <path d="M-12 -6 Q0 -12 12 -6" fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity={0.25} strokeWidth={2} />
        </g>
      );
    case "rayas":
      return (
        <g style={{ stroke: fill }} strokeWidth={5} strokeLinecap="round">
          <line x1={-50} y1={4} x2={4} y2={-50} />
          <line x1={-40} y1={30} x2={30} y2={-40} />
          <line x1={-14} y1={50} x2={50} y2={-14} />
        </g>
      );
    default:
      return null;
  }
}

/** One chocolate piece. Shape comes from the product, colours and topping from the filling. */
export function PieceArt({ prefix, shape, look }: { prefix: string; shape: PieceShape; look: PieceLook }) {
  const d = SHAPE_PATH[shape];
  return (
    <g>
      <ellipse cx={2} cy={40} rx={36} ry={8} style={{ fill: "var(--foreground)" }} opacity={0.28} />
      <path d={d} style={{ fill: SHELL_FILL[look.shell] }} />
      <g clipPath={`url(#${prefix}-clip-${shape})`}>
        <Topping look={look} />
      </g>
      <path d={d} fill={`url(#${prefix}-shade)`} />
      <path d="M-24 -24 Q-12 -34 4 -33" fill="none" style={{ stroke: "var(--card)" }} strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

/** A standalone piece drawing for buttons and lists. */
export function PieceThumb({ shape, look, className }: { shape: PieceShape; look: PieceLook; className?: string }) {
  const prefix = useSvgPrefix();
  return (
    <svg viewBox="-54 -54 108 108" className={className} aria-hidden>
      <ArtDefs prefix={prefix} />
      <PieceArt prefix={prefix} shape={shape} look={look} />
    </svg>
  );
}

/** Ribbon bow, knot at 0,0, about 46 units wide. */
export function BowArt({ prefix, tone }: { prefix: string; tone: RibbonTone }) {
  const fill = RIBBON_FILL[tone];
  return (
    <g>
      <path d="M-2 2 L-12 26 L-6 24 L-3 30 L4 3 Z" style={{ fill }} />
      <path d="M2 2 L12 26 L6 24 L3 30 L-4 3 Z" style={{ fill }} />
      <path d="M0 0 C-7 -14 -24 -18 -24 -6 C-24 4 -11 6 0 0 Z" style={{ fill }} />
      <path d="M0 0 C7 -14 24 -18 24 -6 C24 4 11 6 0 0 Z" style={{ fill }} />
      <path d="M-3 -2 C-9 -9 -17 -10 -18 -5" fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity={0.2} strokeWidth={1.6} />
      <path d="M3 -2 C9 -9 17 -10 18 -5" fill="none" style={{ stroke: "var(--foreground)" }} strokeOpacity={0.2} strokeWidth={1.6} />
      <g>
        <path d="M-2 2 L-12 26 L-6 24 L-3 30 L4 3 Z M2 2 L12 26 L6 24 L3 30 L-4 3 Z M0 0 C-7 -14 -24 -18 -24 -6 C-24 4 -11 6 0 0 Z M0 0 C7 -14 24 -18 24 -6 C24 4 11 6 0 0 Z" fill={`url(#${prefix}-sheen)`} />
      </g>
      <ellipse cx={0} cy={0} rx={5} ry={5.5} style={{ fill }} />
      <ellipse cx={0} cy={0} rx={5} ry={5.5} fill={`url(#${prefix}-shade)`} />
    </g>
  );
}

/** Topper placed on the container, centred at 0,0, about 24 units wide. */
export function TopperArt({ prefix, kind }: { prefix: string; kind: TopperKind }) {
  if (kind === "flor") {
    return (
      <g>
        <ellipse cx={1} cy={11} rx={11} ry={3} style={{ fill: "var(--foreground)" }} opacity={0.2} />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx={0} cy={-6.5} rx={5.5} ry={8} transform={`rotate(${a})`} style={{ fill: "var(--blush)", stroke: "var(--rosa)" }} strokeWidth={1} />
        ))}
        {[36, 108, 180, 252, 324].map((a) => (
          <ellipse key={a} cx={0} cy={-4} rx={3.5} ry={5} transform={`rotate(${a})`} style={{ fill: "var(--rosa)" }} />
        ))}
        <circle r={3.6} style={{ fill: "var(--dorado)" }} />
      </g>
    );
  }
  if (kind === "corazon") {
    return (
      <g>
        <ellipse cx={1} cy={11} rx={11} ry={3} style={{ fill: "var(--foreground)" }} opacity={0.2} />
        <g transform="scale(0.27)">
          <path d={HEART_PATH} style={{ fill: "var(--dorado)" }} />
          <path d={HEART_PATH} fill={`url(#${prefix}-shade)`} />
        </g>
        <path d="M-6 -6 Q-3 -9 0 -8" fill="none" style={{ stroke: "var(--card)" }} strokeWidth={1.4} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={1} cy={12} rx={11} ry={3} style={{ fill: "var(--foreground)" }} opacity={0.2} />
      <circle r={12} style={{ fill: "var(--card)", stroke: "var(--caramel)" }} strokeWidth={1.6} />
      <circle r={10} fill="none" style={{ stroke: "var(--sand)" }} strokeWidth={0.8} strokeDasharray="1.4 1.4" />
      <image href={mascotaSello.url} x={-8.5} y={-8.5} width={17} height={17} preserveAspectRatio="xMidYMid meet" />
    </g>
  );
}

export function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const s = size;
  return (
    <path
      d={`M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z`}
      style={{ fill: "var(--dorado)", animationDelay: `${delay}ms` }}
      className="animate-pulse"
    />
  );
}
