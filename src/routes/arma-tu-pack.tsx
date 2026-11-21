import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Gift, Heart, Lock, Mail, ShoppingBag, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { PieceThumb, RIBBON_FILL, ArtDefs, BowArt, TopperArt, useSvgPrefix } from "@/components/packs/art";
import { OptionBubble, OptionRow } from "@/components/packs/OptionBubble";
import { DeliveryChoice, PaymentChoice } from "@/components/catalog/OrderOptions";
import { PackScene } from "@/components/packs/PackScene";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTAINERS,
  EXTRAS,
  PIECES,
  RIBBONS,
  TOPPERS,
  type PackSlot,
  formatPrice,
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
  type Build,
  type BuildSearch,
  MESSAGE_MAX,
  buildPrice,
  buildReducer,
  decorPrice,
  parseBuildSearch,
  startBuild,
} from "@/lib/builder";
import { type Delivery, type Shortage, LOW_STOCK, availableStock, shortages, slotLines } from "@/lib/availability";
import { emptySlots, filledCount, fitToCapacity, groupSlots } from "@/lib/packs";
import { DEFAULT_PAYMENT, type PaymentMethodId, formatMoney, priceFor } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/catalog/CartProvider";
import { buildItem } from "@/lib/cart";

export const Route = createFileRoute("/arma-tu-pack")({
  validateSearch: parseBuildSearch,
  head: () => ({
    meta: [
      { title: "Arma tu caja de bombones | D'ChocolAte" },
      {
        name: "description",
        content: "Elige el envase, los bombones, sus rellenos, el listón y los detalles, y mira cómo queda tu regalo en tiempo real.",
      },
      { property: "og:title", content: "Arma tu caja de bombones | D'ChocolAte" },
      { property: "og:description", content: "Crea tu caja de bombones a tu gusto y mírala tomar forma en tiempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuilderPage,
});

const STEPS = [
  { id: "empaque", label: "Empaque" },
  { id: "bombones", label: "Bombones" },
  { id: "decoracion", label: "Decoración" },
  { id: "extras", label: "Extras" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

function BuilderPage() {
  const search = Route.useSearch();
  return <Builder key={`${search.base ?? ""}:${search.envase ?? ""}`} search={search} />;
}

function Builder({ search }: { search: BuildSearch }) {
  const [build, dispatch] = useReducer(buildReducer, search, startBuild);
  const [step, setStep] = useState<StepId>(search.base ? "bombones" : "empaque");
  const [selected, setSelected] = useState<number | null>(null);
  const [activePiece, setActivePiece] = useState<string>(PIECES[0]!.slug);
  const [lastSlot, setLastSlot] = useState<PackSlot | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const container = getContainer(build.container)!;
  const filled = filledCount(build.slots);
  const missing = container.capacity - filled;
  const total = buildPrice(build);
  const [payment, setPayment] = useState<PaymentMethodId>(DEFAULT_PAYMENT);
  const [delivery, setDelivery] = useState<Delivery>("ahora");
  const lack = shortages(slotLines(build.slots), delivery);
  const pendingApproval = delivery === "encargo" && shortages(slotLines(build.slots), "ahora").length > 0;
  const toPay = formatMoney(priceFor(total, payment));
  const base = build.base ? getProduct(build.base) : undefined;
  const ribbon = getRibbon(build.ribbon);
  const topper = getTopper(build.topper);
  const decorCount = (ribbon?.tone ? 1 : 0) + (topper?.kind ? 1 : 0);

  const goTo = (id: StepId) => {
    setStep(id);
    setHint(null);
  };

  const onSlotClick = (i: number) => {
    const slot = build.slots[i];
    if (selected === i) return setSelected(null);
    if (!slot && build.locked) return;
    setSelected(i);
    setStep("bombones");
    setHint(null);
    if (slot) setActivePiece(slot.piece);
    // On phones the choices sit below the preview: bring them into view.
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const add = (slot: PackSlot) => {
    if (missing === 0) {
      toast("Tu caja ya está completa", { description: "Quita una pieza o elige un envase más grande." });
      return;
    }
    const target = selected != null && !build.slots[selected] ? selected : null;
    dispatch({ type: "add", slot, target });
    if (target != null) setSelected(null);
    setLastSlot(slot);
    const piece = getPiece(slot.piece);
    const variant = piece && getVariant(piece, slot.variant);
    setHint(variant?.detail ? `${variant.label}: ${variant.detail.toLowerCase()}.` : null);
  };

  const changeContainer = (id: string) => {
    const next = getContainer(id);
    if (!next || next.id === build.container) return;
    const { dropped } = fitToCapacity(build.slots, next.capacity);
    dispatch({ type: "container", id });
    setSelected(null);
    setHint(next.description);
    if (dropped) toast(`Quitamos ${dropped} ${dropped === 1 ? "pieza que no cabía" : "piezas que no cabían"}`);
  };

  const badges: Record<StepId, string | number | null> = {
    empaque: container.capacity,
    bombones: `${filled}/${container.capacity}`,
    decoracion: decorCount || null,
    extras: build.extras.length || null,
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const nextStep = STEPS[stepIndex + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-36 pt-5 sm:px-8 lg:pb-20">
      <Link
        to={base ? "/productos/$slug" : "/"}
        params={base ? { slug: base.slug } : {}}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {base ? base.name : "Catálogo"}
      </Link>

      <div className="mt-2 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold leading-none text-primary sm:text-5xl">
          Arma tu <span className="font-script text-[1.2em] text-rosa-deep">caja</span>
        </h1>
        <p className="hidden font-script text-2xl text-caramel sm:block">Hecho con mucho amor</p>
      </div>

      <div className="mt-4 grid gap-5 lg:mt-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Stage build={build} selected={selected} onSlotClick={onSlotClick} price={toPay} filled={filled} />
        </div>

        {/* Choices */}
        <div className="flex min-w-0 flex-col gap-4">
          <div role="tablist" aria-label="Pasos" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {STEPS.map((s) => {
              const active = s.id === step;
              const badge = badges[s.id];
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTo(s.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-rosa",
                  )}
                >
                  {s.label}
                  {badge != null && (
                    <span
                      className={cn(
                        "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px]",
                        active ? "bg-rosa text-rosa-foreground" : "bg-rosa-deep text-primary-foreground",
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section ref={panelRef} role="tabpanel" aria-label={STEPS[stepIndex]?.label} className="scroll-mb-28 scroll-mt-20 lg:scroll-m-0 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-5">
            {step === "empaque" && (
              <EmpaqueStep build={build} onChoose={changeContainer} />
            )}
            {step === "bombones" && (
              <BombonesStep
                build={build}
                selected={selected}
                activePiece={activePiece}
                setActivePiece={setActivePiece}
                lastSlot={lastSlot}
                onAdd={add}
                onRemoveOne={(slot) => dispatch({ type: "removeOne", slot })}
                onRemoveAt={(i) => {
                  dispatch({ type: "removeAt", index: i });
                  setSelected(null);
                }}
                onVariantAt={(i, variant) => dispatch({ type: "variantAt", index: i, variant })}
                onVariantAll={(piece, variant) => {
                  dispatch({ type: "variantForPiece", piece, variant });
                  toast("Listo, cambiamos el relleno de todas esas piezas");
                }}
                onFill={(slot) => dispatch({ type: "fill", slot })}
                onClear={() => {
                  dispatch({ type: "clear" });
                  setSelected(null);
                }}
                onUnlock={() => {
                  dispatch({ type: "unlock" });
                  toast("Ahora puedes armarla a tu manera");
                }}
                onCloseSelection={() => setSelected(null)}
              />
            )}
            {step === "decoracion" && (
              <DecoracionStep
                build={build}
                onRibbon={(id) => {
                  dispatch({ type: "ribbon", id });
                  setHint(getRibbon(id)?.detail ?? null);
                }}
                onTopper={(id) => {
                  dispatch({ type: "topper", id });
                  setHint(getTopper(id)?.detail ?? null);
                }}
              />
            )}
            {step === "extras" && (
              <ExtrasStep
                build={build}
                onToggle={(id) => {
                  dispatch({ type: "extra", id });
                  setHint(getExtra(id)?.detail ?? null);
                }}
                onMessage={(text) => dispatch({ type: "message", text })}
              />
            )}

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-border pt-3">
              <p className="min-h-5 text-xs font-semibold text-muted-foreground" aria-live="polite">
                {hint ?? STEP_HINTS[step](build)}
              </p>
              {nextStep && (
                <button
                  type="button"
                  onClick={() => goTo(nextStep.id)}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-caramel hover:text-primary"
                >
                  {nextStep.label} <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </section>

          <Summary
            build={build}
            total={total}
            payment={payment}
            onPayment={setPayment}
            delivery={delivery}
            onDelivery={setDelivery}
            lack={lack}
          />

          <div className="hidden lg:block">
            <OrderButton build={build} payment={payment} price={toPay} missing={missing} delivery={delivery} short={lack.length > 0} approval={pendingApproval} />
          </div>
        </div>
      </div>

      {/* Mobile order bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-xl">
          <OrderButton build={build} payment={payment} price={toPay} missing={missing} delivery={delivery} short={lack.length > 0} approval={pendingApproval} />
        </div>
      </div>
    </div>
  );
}

const STEP_HINTS: Record<StepId, (b: Build) => string> = {
  empaque: (b) => (b.locked ? "El envase de este pack es fijo." : "Si cambias a uno más pequeño, quitamos las piezas que no quepan."),
  bombones: (b) =>
    b.locked ? "Toca un bombón en la caja para cambiar su relleno." : "Toca un bombón para agregarlo. Toca una pieza en la caja para cambiarla.",
  decoracion: () => "El listón y el detalle se ven sobre tu caja.",
  extras: () => "Agrega los toques finales a tu regalo.",
};

/* ---------- Live preview ---------- */

function Stage({
  build,
  selected,
  onSlotClick,
  price,
  filled,
}: {
  build: Build;
  selected: number | null;
  onSlotClick: (i: number) => void;
  price: string;
  filled: number;
}) {
  const container = getContainer(build.container)!;
  const ribbon = getRibbon(build.ribbon);
  const topper = getTopper(build.topper);
  const hasCard = build.extras.includes("tarjeta");
  const hasBag = build.extras.includes("bolsa");

  return (
    <div className="relative isolate overflow-hidden rounded-[2.25rem] border-4 border-card bg-secondary shadow-lift">
      <div aria-hidden className="paw-pattern absolute inset-0 -z-10 bg-sand opacity-40" />
      <div aria-hidden className="absolute inset-x-[12%] top-[18%] -z-10 h-[64%] rounded-full bg-card opacity-70 blur-3xl" />

      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-extrabold text-foreground shadow-card">
        <span className="size-2 rounded-full bg-rosa-deep" aria-hidden />
        {filled}/{container.capacity} piezas
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-3 py-1 font-display text-sm font-bold text-primary-foreground shadow-card">
        {price}
      </div>

      <div className="mx-auto flex aspect-square max-h-[44svh] w-full items-center justify-center px-3 pb-5 pt-9 sm:max-h-[30rem] lg:aspect-[5/4.6] lg:max-h-none lg:p-12">
        <PackScene
          key={container.id}
          container={container}
          slots={build.slots}
          selected={selected}
          onSlotClick={onSlotClick}
          decor={{ ribbon: ribbon?.tone ?? null, topper: topper?.kind ?? null, sparkle: build.extras.includes("brillo") }}
          className="h-full w-full animate-rise"
        />
      </div>

      {hasCard && (
        <div className="absolute bottom-2 right-2 z-10 w-24 rotate-6 rounded-xl border border-border bg-card p-2 shadow-lift animate-rise sm:bottom-4 sm:right-4 sm:w-36 sm:p-2.5">
          <p className="line-clamp-3 font-script text-sm leading-tight text-primary sm:line-clamp-4 sm:text-lg">
            {build.message.trim() || "Con mucho amor…"}
          </p>
          <Heart className="ml-auto mt-1 size-3.5 fill-rosa text-rosa" aria-hidden />
        </div>
      )}
      {hasBag && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-extrabold text-foreground shadow-card animate-rise">
          <Gift className="size-3.5 text-rosa-deep" /> Va en bolsa de regalo
        </div>
      )}
    </div>
  );
}

/* ---------- Steps ---------- */

function EmpaqueStep({ build, onChoose }: { build: Build; onChoose: (id: string) => void }) {
  const list = build.locked ? CONTAINERS.filter((c) => c.id === build.container) : CONTAINERS;
  return (
    <>
      <StepTitle>Elige el envase</StepTitle>
      <OptionRow label="Envases">
        {list.map((c) => (
          <OptionBubble
            key={c.id}
            label={c.label}
            sub={`${c.capacity} pzs · ${formatPrice(c.price)}`}
            selected={c.id === build.container}
            onSelect={() => onChoose(c.id)}
          >
            <PackScene container={c} slots={emptySlots(c.capacity)} className="size-full" title={c.label} />
          </OptionBubble>
        ))}
      </OptionRow>
      {build.locked && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Lock className="size-3.5" /> Viene con el pack. Para cambiarlo, ve a Bombones y elige “Armarla a mi manera”.
        </p>
      )}
    </>
  );
}

type BombonesProps = {
  build: Build;
  selected: number | null;
  activePiece: string;
  setActivePiece: (slug: string) => void;
  lastSlot: PackSlot | null;
  onAdd: (slot: PackSlot) => void;
  onRemoveOne: (slot: PackSlot) => void;
  onRemoveAt: (i: number) => void;
  onVariantAt: (i: number, variant: string) => void;
  onVariantAll: (piece: string, variant: string) => void;
  onFill: (slot: PackSlot) => void;
  onClear: () => void;
  onUnlock: () => void;
  onCloseSelection: () => void;
};

function BombonesStep(props: BombonesProps) {
  const { build, selected } = props;
  const selectedSlot = selected != null ? build.slots[selected] : null;

  if (selectedSlot && selected != null) {
    const piece = getPiece(selectedSlot.piece)!;
    const sameCount = build.slots.filter((s) => s?.piece === piece.slug).length;
    return (
      <>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-eyebrow text-caramel">Pieza {selected + 1}</p>
            <StepTitle className="mt-0.5">{piece.name}: elige el relleno</StepTitle>
          </div>
          <button
            type="button"
            onClick={props.onCloseSelection}
            aria-label="Cerrar"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground hover:bg-blush"
          >
            <X className="size-4" />
          </button>
        </div>
        <OptionRow label="Rellenos">
          {piece.variants.map((v) => (
            <OptionBubble
              key={v.id}
              label={v.label}
              sub={formatPrice(v.price)}
              note={stockHint(build, piece.slug, v.id)}
              selected={v.id === selectedSlot.variant}
              onSelect={() => props.onVariantAt(selected, v.id)}
            >
              {v.look && <PieceThumb shape={piece.piece} look={v.look} className="size-full" />}
            </OptionBubble>
          ))}
        </OptionRow>
        <div className="mt-3 flex flex-wrap gap-2">
          {sameCount > 1 && (
            <Button size="sm" variant="secondary" className="rounded-full" onClick={() => props.onVariantAll(piece.slug, selectedSlot.variant)}>
              <Wand2 /> Usar este relleno en las {sameCount} piezas
            </Button>
          )}
          {!build.locked && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => props.onRemoveAt(selected)}>
              <Trash2 /> Quitar pieza
            </Button>
          )}
        </div>
      </>
    );
  }

  if (build.locked) {
    return (
      <>
        <StepTitle>Este pack ya viene armado</StepTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Toca cualquier bombón en la caja para cambiar su relleno. Si prefieres elegir pieza por pieza, ármala a tu manera.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {groupSlots(build.slots).map((g) => {
            const piece = getPiece(g.piece)!;
            const v = getVariant(piece, g.variant)!;
            return (
              <li key={`${g.piece}:${g.variant}`} className="flex items-center gap-1.5 rounded-full bg-muted py-1 pl-1 pr-3 text-xs font-bold">
                {v.look && <PieceThumb shape={piece.piece} look={v.look} className="size-6" />}
                {g.count} × {v.label}
              </li>
            );
          })}
        </ul>
        <Button variant="outline" className="mt-4 rounded-full" onClick={props.onUnlock}>
          <Wand2 /> Armarla a mi manera
        </Button>
      </>
    );
  }

  const piece = getPiece(props.activePiece) ?? PIECES[0]!;
  const target = selected != null && !build.slots[selected] ? selected : null;
  const fillWith = props.lastSlot ?? { piece: piece.slug, variant: piece.variants[0]!.id };
  const fillPiece = getPiece(fillWith.piece);
  const fillVariant = fillPiece && getVariant(fillPiece, fillWith.variant);
  const missing = build.slots.length - filledCount(build.slots);

  return (
    <>
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4" role="group" aria-label="Tipo de pieza">
        {PIECES.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => props.setActivePiece(p.slug)}
            aria-pressed={p.slug === piece.slug}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors",
              p.slug === piece.slug ? "bg-caramel text-caramel-foreground" : "bg-muted text-foreground hover:bg-blush",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      {target != null && (
        <p className="mt-2 text-xs font-bold text-rosa-deep">Se colocará en el espacio {target + 1}</p>
      )}
      <div className="mt-2">
        <OptionRow label={`Rellenos de ${piece.name}`}>
          {piece.variants.map((v) => {
            const slot = { piece: piece.slug, variant: v.id };
            const count = build.slots.filter((s) => s?.piece === piece.slug && s.variant === v.id).length;
            return (
              <OptionBubble
                key={v.id}
                label={v.label}
                sub={formatPrice(v.price)}
                note={stockHint(build, piece.slug, v.id)}
                count={count}
                onSelect={() => props.onAdd(slot)}
                onMinus={() => props.onRemoveOne(slot)}
              >
                {v.look && <PieceThumb shape={piece.piece} look={v.look} className="size-full" />}
              </OptionBubble>
            );
          })}
        </OptionRow>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {missing > 0 && fillVariant && (
          <Button size="sm" variant="secondary" className="rounded-full" onClick={() => props.onFill(fillWith)}>
            <Wand2 /> Completar con {fillVariant.label} ({missing})
          </Button>
        )}
        {filledCount(build.slots) > 0 && (
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={props.onClear}>
            <Trash2 /> Vaciar
          </Button>
        )}
      </div>
    </>
  );
}

function DecoracionStep({ build, onRibbon, onTopper }: { build: Build; onRibbon: (id: string) => void; onTopper: (id: string) => void }) {
  const prefix = useSvgPrefix();
  return (
    <>
      <StepTitle>Listón</StepTitle>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <ArtDefs prefix={prefix} />
      </svg>
      <OptionRow label="Listón">
        {RIBBONS.map((r) => (
          <OptionBubble
            key={r.id}
            label={r.label}
            sub={r.price ? `+${formatPrice(r.price)}` : "Gratis"}
            selected={r.id === build.ribbon}
            onSelect={() => onRibbon(r.id)}
          >
            {r.tone ? (
              <svg viewBox="-28 -22 56 56" className="size-full" aria-hidden>
                <rect x={-30} y={-3} width={60} height={6} style={{ fill: RIBBON_FILL[r.tone] }} opacity={0.8} />
                <BowArt prefix={prefix} tone={r.tone} />
              </svg>
            ) : (
              <X className="size-6 text-muted-foreground" />
            )}
          </OptionBubble>
        ))}
      </OptionRow>
      <StepTitle className="mt-4">Detalle sobre la caja</StepTitle>
      <OptionRow label="Detalle">
        {TOPPERS.map((t) => (
          <OptionBubble
            key={t.id}
            label={t.label}
            sub={t.price ? `+${formatPrice(t.price)}` : "Gratis"}
            selected={t.id === build.topper}
            onSelect={() => onTopper(t.id)}
          >
            {t.kind ? (
              <svg viewBox="-15 -15 30 30" className="size-full" aria-hidden>
                <TopperArt prefix={prefix} kind={t.kind} />
              </svg>
            ) : (
              <X className="size-6 text-muted-foreground" />
            )}
          </OptionBubble>
        ))}
      </OptionRow>
    </>
  );
}

const EXTRA_ICONS = { tarjeta: Mail, brillo: Sparkles, bolsa: Gift } as const;

function ExtrasStep({ build, onToggle, onMessage }: { build: Build; onToggle: (id: string) => void; onMessage: (text: string) => void }) {
  return (
    <>
      <StepTitle>Toques finales</StepTitle>
      <OptionRow label="Extras">
        {EXTRAS.map((e) => {
          const Icon = EXTRA_ICONS[e.id as keyof typeof EXTRA_ICONS] ?? Gift;
          return (
            <OptionBubble
              key={e.id}
              label={e.label}
              sub={`+${formatPrice(e.price)}`}
              selected={build.extras.includes(e.id)}
              onSelect={() => onToggle(e.id)}
            >
              <Icon className="size-7 text-caramel" />
            </OptionBubble>
          );
        })}
      </OptionRow>
      {build.extras.includes("tarjeta") && (
        <div className="mt-3 animate-rise">
          <label htmlFor="dedicatoria" className="text-sm font-extrabold text-foreground">
            Tu dedicatoria
          </label>
          <Textarea
            id="dedicatoria"
            value={build.message}
            onChange={(e) => onMessage(e.target.value)}
            maxLength={MESSAGE_MAX}
            rows={2}
            placeholder="Para ti, con mucho amor…"
            className="mt-1.5 resize-none rounded-2xl bg-background font-script text-xl"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {build.message.length}/{MESSAGE_MAX}
          </p>
        </div>
      )}
    </>
  );
}

function StepTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-2 font-display text-lg font-bold text-primary", className)}>{children}</h2>;
}

/* ---------- Summary and order ---------- */

/** Today's stock left for a filling once the pieces already in the box are counted. */
function stockHint(build: Build, piece: string, variant: string) {
  const inBox = build.slots.filter((s) => s?.piece === piece && s.variant === variant).length;
  const left = availableStock(piece, variant) - inBox;
  if (left <= 0) return inBox > 0 && left === 0 ? "No quedan más hoy" : "Agotado hoy";
  return left <= LOW_STOCK ? `Quedan ${left} hoy` : undefined;
}

type SummaryProps = {
  build: Build;
  total: number;
  payment: PaymentMethodId;
  onPayment: (id: PaymentMethodId) => void;
  delivery: Delivery;
  onDelivery: (d: Delivery) => void;
  lack: Shortage[];
};

function Summary({ build, total, payment, onPayment, delivery, onDelivery, lack }: SummaryProps) {
  const container = getContainer(build.container)!;
  const groups = groupSlots(build.slots);
  const pieces = packPrice(build.container, build.slots) - container.price;
  const decor = decorPrice(build);
  const decorItems = [getRibbon(build.ribbon), getTopper(build.topper), ...build.extras.map(getExtra)].filter(
    (d): d is NonNullable<typeof d> => Boolean(d && d.price),
  );

  return (
    <details className="group rounded-3xl border border-border bg-card px-4 py-3 shadow-card sm:px-5" open>
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold text-primary">
        Tu pedido
        <span className="text-sm font-sans font-bold text-muted-foreground group-open:hidden">Ver detalle</span>
      </summary>
      <dl className="mt-2 space-y-1.5 text-sm">
        <Line label={container.label} value={container.price} />
        {groups.map((g) => {
          const piece = getPiece(g.piece)!;
          const v = getVariant(piece, g.variant)!;
          return (
            <Line key={`${g.piece}:${g.variant}`} label={`${g.count} × ${piece.name} · ${v.label}`} value={g.count * g.unitPrice} muted />
          );
        })}
        {groups.length === 0 && <p className="text-muted-foreground">Aún no agregas bombones.</p>}
        {decorItems.map((d) => (
          <Line key={d.id} label={d.label} value={d.price} muted />
        ))}
        <div className="flex justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
          <span>Bombones {formatPrice(pieces)} · Decoración {formatPrice(decor)}</span>
        </div>
      </dl>
      <div className="mt-4 grid gap-4 border-t border-border pt-4">
        <DeliveryChoice value={delivery} onChange={onDelivery} nowAvailable />
        {lack.length > 0 && (
          <div role="alert" className="rounded-2xl bg-blush px-3 py-2.5 text-sm text-rosa-deep">
            <p className="font-extrabold">Hoy no alcanza para entregarla ya:</p>
            <ul className="mt-1 list-inside list-disc text-xs font-semibold">
              {lack.map((l) => {
                const piece = getPiece(l.product);
                const v = piece && getVariant(piece, l.variant);
                return (
                  <li key={`${l.product}:${l.variant}`}>
                    {piece?.name} · {v?.label}: pides {l.qty}, {l.available === 0 ? "no queda ninguno" : `hay ${l.available}`}
                  </li>
                );
              })}
            </ul>
            <p className="mt-1.5 text-xs">Cambia esos rellenos o pídela por encargo para otra fecha (sujeto a aprobación).</p>
          </div>
        )}
        <PaymentChoice amount={total} value={payment} onChange={onPayment} />
      </div>
    </details>
  );
}

function Line({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className={cn(muted ? "text-muted-foreground" : "font-bold text-foreground")}>{label}</dt>
      <dd className="shrink-0 font-bold text-foreground">{formatPrice(value)}</dd>
    </div>
  );
}

function OrderButton({
  build,
  payment,
  price,
  missing,
  delivery,
  short,
  approval,
}: {
  build: Build;
  payment: PaymentMethodId;
  price: string;
  missing: number;
  delivery: Delivery;
  short: boolean;
  approval: boolean;
}) {
  const { dispatch } = useCart();
  const capacity = build.slots.length;
  const pct = ((capacity - missing) / capacity) * 100;
  return (
    <div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-rosa-deep transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {approval && missing === 0 && (
        <p className="mb-2 text-xs font-bold text-rosa-deep">Lleva rellenos agotados hoy: tu encargo quedará pendiente de aprobación.</p>
      )}
      <Button
        variant="brand"
        size="xl"
        className="w-full justify-between"
        disabled={missing > 0 || short}
        onClick={() => {
          dispatch({ type: "add", item: buildItem(build, delivery), payment });
          toast.success("¡Tu caja está en el carrito!", { description: `${price}${approval ? " · Sujeto a aprobación" : ""}` });
        }}
      >
        <span className="inline-flex items-center gap-2">
          <ShoppingBag />
          {missing > 0
            ? `Faltan ${missing} ${missing === 1 ? "bombón" : "bombones"}`
            : short
              ? "No alcanza para hoy"
              : delivery === "encargo"
                ? "Encargar mi caja"
                : "Agregar al pedido"}
        </span>
        <span className="font-display text-lg">{price}</span>
      </Button>
    </div>
  );
}
