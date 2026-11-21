import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag, Trash2, Minus, Plus, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/catalog/CartProvider";
import { PaymentChoice, DeliveryChoice } from "@/components/catalog/OrderOptions";
import { Button } from "@/components/ui/button";
import { PackScene } from "@/components/packs/PackScene";
import { cartSummary, itemLines, type CartItem } from "@/lib/cart";
import { MAX_QUANTITY, shortages } from "@/lib/availability";
import { getContainer, getExtra, getPiece, getRibbon, getTopper, getVariant } from "@/lib/catalog";
import { groupSlots } from "@/lib/packs";
import { formatMoney, formatPrice, priceFor } from "@/lib/pricing";

export const Route = createFileRoute("/carrito")({
  head: () => ({ meta: [
    { title: "Tu carrito de compras | D'ChocolAte" },
    { name: "description", content: "Revisa tus bombones, cajas y detalles personalizados y el total de tu pedido en CUP." },
    { property: "og:title", content: "Tu carrito de compras | D'ChocolAte" },
    { property: "og:description", content: "Tus chocolates favoritos, reunidos en un solo pedido." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CartPage,
});

function CartPage() {
  const { cart, dispatch } = useCart();
  const summary = cartSummary(cart);
  const [clearing, setClearing] = useState(false);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <Button asChild variant="link" className="h-auto p-0 text-muted-foreground">
        <Link to="/"><ArrowLeft /> Seguir comprando</Link>
      </Button>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-script text-2xl text-caramel">Un poquito de felicidad</p>
          <h1 className="mt-1 text-4xl font-bold text-primary sm:text-5xl">Tu carrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">{summary.count} {summary.count === 1 ? "producto" : "productos"} en tu pedido</p>
        </div>
        {cart.items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {clearing ? <>
              <span className="text-sm font-bold text-foreground">¿Quitar todo?</span>
              <Button variant="outline" onClick={() => setClearing(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => { dispatch({ type: "clear" }); setClearing(false); }}>Vaciar</Button>
            </> : <Button variant="ghost" onClick={() => setClearing(true)}><Trash2 /> Vaciar carrito</Button>}
          </div>
        )}
      </div>
      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="relative grid size-24 place-items-center rounded-full bg-blush text-rosa-deep">
            <ShoppingBag className="size-10" /><Heart className="absolute right-2 top-2 size-5 fill-rosa text-rosa-deep" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-primary">Tu carrito espera algo dulce</h2>
          <Button asChild variant="brand" size="xl" className="mt-6"><Link to="/">Elegir chocolates <ArrowLeft className="rotate-180" /></Link></Button>
        </div>
      ) : (
        <div className="grid gap-10 pt-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <section aria-label="Productos en el carrito" className="min-w-0 divide-y divide-border">
            {cart.items.map((item) => <CartLine key={item.id} item={item} />)}
          </section>
          <aside className="min-w-0 self-start border-y border-border bg-secondary px-5 py-6 lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold text-primary">Resumen del pedido</h2>
            <div className="mt-6"><PaymentChoice amount={summary.subtotal} value={cart.payment} onChange={(payment) => dispatch({ type: "payment", payment })} /></div>
            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-3"><dt>Subtotal por transferencia</dt><dd className="shrink-0 font-bold">{formatPrice(summary.subtotal)}</dd></div>
              {cart.payment === "efectivo" && <div className="flex justify-between gap-3 text-rosa-deep"><dt>Descuento en efectivo · 20%</dt><dd className="shrink-0 font-bold">−{formatPrice(summary.discount)}</dd></div>}
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-border pt-5"><dt className="text-base font-bold">Total a pagar</dt><dd data-testid="cart-total" className="font-display text-3xl font-bold text-primary" aria-live="polite">{formatMoney(summary.total)}</dd></div>
            </dl>
            {cart.payment === "efectivo" && <p className="mt-3 text-xs font-semibold text-rosa-deep">El 20% incluye bombones, empaques, decoración y extras.</p>}
            {summary.lack.length > 0 && <div role="alert" className="mt-6 border-l-2 border-rosa-deep pl-3 text-sm text-rosa-deep">
              <p className="font-extrabold">La producción de hoy no alcanza para todo.</p>
              <ul className="mt-2 space-y-1">{summary.lack.map((l) => <li key={`${l.product}:${l.variant}`}>{getPiece(l.product)?.name ?? l.product} · {l.variant}: {l.qty} pedidos, {l.available} disponibles.</li>)}</ul>
              <p className="mt-2">Reduce cantidades o cambia esos productos a «Por encargo».</p>
            </div>}
            {summary.approval && <p className="mt-5 border-l-2 border-rosa-deep pl-3 text-sm font-bold text-rosa-deep">El encargo incluye productos agotados hoy y estará sujeto a aprobación de la administración.</p>}
            <p className="mt-6 text-xs text-muted-foreground">Productos añadidos al carrito. Aún no has realizado un pedido ni un pago.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const { cart, dispatch } = useCart();
  const container = item.build ? getContainer(item.build.container) : undefined;
  const ribbon = item.build ? getRibbon(item.build.ribbon) : undefined;
  const topper = item.build ? getTopper(item.build.topper) : undefined;
  const nowAvailable = shortages(itemLines(item), "ahora").length === 0;
  return (
    <article className="py-6" aria-label={item.label}>
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted sm:size-32">
          {item.build && container ? <PackScene container={container} slots={item.build.slots} decor={{ ribbon: ribbon?.tone ?? null, topper: topper?.kind ?? null, sparkle: item.build.extras.includes("brillo") }} className="size-full p-2" title={item.label} />
            : item.image ? <img src={item.image} alt={item.label} className="size-full object-cover" /> : <ShoppingBag className="size-8 text-caramel" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold leading-tight text-primary">{item.label}</h2>
            <Button size="icon" variant="ghost" className="shrink-0" title={`Quitar ${item.label}`} aria-label={`Quitar ${item.label}`} onClick={() => dispatch({ type: "remove", id: item.id })}><Trash2 /></Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          <p className="mt-2 text-xs text-muted-foreground">{formatPrice(item.unitPrice)} por unidad · transferencia</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label={`Cantidad de ${item.label}`} className="flex items-center gap-2 rounded-md border border-border bg-card">
              <Button size="icon" variant="ghost" aria-label={`Reducir cantidad de ${item.label}`} disabled={item.qty <= 1} onClick={() => dispatch({ type: "quantity", id: item.id, qty: item.qty - 1 })}><Minus /></Button>
              <span className="w-5 text-center font-bold" aria-live="polite">{item.qty}</span>
              <Button size="icon" variant="ghost" aria-label={`Aumentar cantidad de ${item.label}`} disabled={item.qty >= MAX_QUANTITY} onClick={() => dispatch({ type: "quantity", id: item.id, qty: item.qty + 1 })}><Plus /></Button>
            </div>
            <span className="font-display text-xl font-bold text-primary">{formatMoney(priceFor(item.unitPrice * item.qty, cart.payment))}</span>
          </div>
        </div>
      </div>
      {item.build && <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-bold text-caramel">Bombones y detalles de esta caja</summary>
        <ul className="mt-3 space-y-1 text-muted-foreground">
          {groupSlots(item.build.slots).map((g) => { const piece = getPiece(g.piece); const variant = piece ? getVariant(piece, g.variant) : undefined; return <li key={`${g.piece}:${g.variant}`}>{g.count} × {piece?.name} · {variant?.label}</li>; })}
          {ribbon?.tone && <li>{ribbon.label}</li>}{topper?.kind && <li>{topper.label}</li>}
          {item.build.extras.map((id) => <li key={id}>{getExtra(id)?.label}</li>)}
        </ul>
        {item.build.message && <p className="mt-2 break-words font-script text-xl text-caramel">«{item.build.message}»</p>}
      </details>}
      <DeliveryChoice className="mt-4" value={item.delivery} nowAvailable={nowAvailable} onChange={(delivery) => dispatch({ type: "delivery", id: item.id, delivery })} />
    </article>
  );
}