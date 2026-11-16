import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  sub?: string;
  selected?: boolean;
  count?: number;
  onSelect: () => void;
  onMinus?: (() => void) | undefined;
  disabled?: boolean;
  children: ReactNode;
};

/** Round option like a sticker: tap to choose, badge shows how many are in the pack. */
export function OptionBubble({ label, sub, selected, count, onSelect, onMinus, disabled, children }: Props) {
  return (
    <div className="relative flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1 text-center">
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-pressed={Boolean(selected || count)}
        aria-label={`${label}${sub ? `, ${sub}` : ""}`}
        className={cn(
          "grid size-[4.25rem] place-items-center overflow-hidden rounded-full border-2 bg-background p-1.5 shadow-card transition-all duration-200 active:scale-90 disabled:opacity-40",
          selected || count ? "border-rosa-deep bg-blush" : "border-border hover:border-rosa",
        )}
      >
        {children}
      </button>
      {(selected || Boolean(count)) && (
        <span className="pointer-events-none absolute right-0 top-0 grid h-6 min-w-6 place-items-center rounded-full border-2 border-card bg-rosa-deep px-1 text-[11px] font-extrabold text-primary-foreground animate-pop">
          {count ? count : <Check className="size-3" strokeWidth={3.5} />}
        </span>
      )}
      {onMinus && Boolean(count) && (
        <button
          type="button"
          onClick={onMinus}
          aria-label={`Quitar un ${label}`}
          className="absolute left-0 top-0 grid size-6 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground animate-pop"
        >
          <Minus className="size-3" strokeWidth={3.5} />
        </button>
      )}
      <span className="mt-0.5 line-clamp-2 text-[0.72rem] font-extrabold leading-tight text-foreground">{label}</span>
      {sub && <span className="text-[0.68rem] font-semibold text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function OptionRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 pt-1">
      {children}
    </div>
  );
}
