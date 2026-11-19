import { Banknote, CalendarClock, Heart, Landmark, Minus, Plus, Zap } from "lucide-react";
import { DELIVERIES, type Delivery, stockStatus } from "@/lib/availability";
import { CASH_DISCOUNT, PAYMENT_METHODS, type PaymentMethodId, formatMoney, priceFor } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const CASH_PCT = `${Math.round(CASH_DISCOUNT * 100)}%`;

/** "En efectivo 14,40 CUP −20%" under a transfer price. */
export function CashHint({ amount, className }: { amount: number; className?: string }) {
  return (
    <p className={cn("text-xs font-bold text-rosa-deep", className)}>
      En efectivo {formatMoney(priceFor(amount, "efectivo"))}
      <span className="ml-1.5 rounded-full bg-blush px-1.5 py-0.5 text-[0.65rem] font-extrabold">−{CASH_PCT}</span>
    </p>
  );
}

/** Short note explaining how catalog prices work. */
export function PaymentNote({ className }: { className?: string }) {
  return (
    <p className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
        <Landmark className="size-4 text-caramel" /> Precios por transferencia en CUP
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-2.5 py-0.5 text-xs font-extrabold text-rosa-deep">
        <Banknote className="size-3.5" /> En efectivo pagas {CASH_PCT} menos
      </span>
    </p>
  );
}

const PAYMENT_ICON = { transferencia: Landmark, efectivo: Banknote } as const;

/** Choose how to pay; each option shows what the customer would pay with it. */
export function PaymentChoice({
  amount,
  value,
  onChange,
  className,
}: {
  amount: number;
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="text-eyebrow text-muted-foreground">¿Cómo vas a pagar?</legend>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup">
        {PAYMENT_METHODS.map((m) => {
          const Icon = PAYMENT_ICON[m.id];
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(m.id)}
              className={cn(
                "relative flex flex-col items-start gap-0.5 rounded-2xl border-2 bg-card px-3 py-2.5 text-left transition-colors",
                active ? "border-rosa-deep bg-blush" : "border-border hover:border-rosa",
              )}
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground">
                <Icon className="size-3.5" /> {m.label}
              </span>
              <span className="font-display text-lg font-bold text-primary">{formatMoney(priceFor(amount, m.id))}</span>
              {m.discount > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-rosa-deep px-1.5 py-0.5 text-[0.65rem] font-extrabold text-primary-foreground">
                  −{Math.round(m.discount * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const DELIVERY_ICON = { ahora: Zap, encargo: CalendarClock } as const;

/** Deliver from today's production, or order for another date (doesn't depend on stock). */
export function DeliveryChoice({
  value,
  onChange,
  nowAvailable,
  className,
}: {
  value: Delivery;
  onChange: (d: Delivery) => void;
  nowAvailable: boolean;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="text-eyebrow text-muted-foreground">¿Para cuándo?</legend>
      <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup">
        {DELIVERIES.map((d) => {
          const Icon = DELIVERY_ICON[d.id];
          const active = d.id === value;
          const disabled = d.id === "ahora" && !nowAvailable;
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(d.id)}
              className={cn(
                "flex items-center gap-2 rounded-2xl border-2 bg-card px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                active ? "border-primary bg-secondary" : "border-border hover:border-rosa",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-caramel")} />
              <span className="min-w-0">
                <span className="block text-sm font-extrabold leading-tight text-foreground">{d.label}</span>
                <span className="block text-[0.7rem] font-semibold text-muted-foreground">
                  {disabled ? "Agotado hoy" : d.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Today's stock in words. */
export function StockNote({ units, unit = "unidades", className }: { units: number; unit?: string; className?: string }) {
  const status = stockStatus(units);
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold",
        status === "agotado" ? "text-muted-foreground" : status === "pocas" ? "text-rosa-deep" : "text-muted-foreground",
        className,
      )}
    >
      <Heart className={cn("size-4", status === "agotado" ? "text-muted-foreground" : "fill-rosa text-rosa")} aria-hidden />
      {status === "agotado"
        ? "Agotado hoy · puedes encargarlo para otra fecha"
        : status === "pocas"
          ? `¡Quedan solo ${units} ${units === 1 ? unit.replace(/es$|s$/, "") : unit} hoy!`
          : `Disponible hoy · ${units} ${unit} listas`}
    </p>
  );
}

export function QuantityStepper({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border-2 border-border bg-card" role="group" aria-label="Cantidad">
      <button
        type="button"
        aria-label="Quitar uno"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="grid size-11 place-items-center rounded-full text-foreground hover:bg-secondary disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center font-display text-lg font-bold text-foreground" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Agregar uno"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid size-11 place-items-center rounded-full text-foreground hover:bg-secondary disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
