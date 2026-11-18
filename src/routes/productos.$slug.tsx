import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Leaf, ShoppingBag, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PieceThumb } from "@/components/packs/art";
import { PackScene } from "@/components/packs/PackScene";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductTag } from "@/components/catalog/ProductTag";
import { Button } from "@/components/ui/button";
import {
  PRODUCTS,
  type IndividualProduct,
  type PackProduct,
  categoryLabel,
  formatPrice,
  getContainer,
  getPiece,
  getProduct,
  getVariant,
  productPrice,
} from "@/lib/catalog";
import { groupSlots } from "@/lib/packs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/productos/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { slug: product.slug };
  },
  head: ({ loaderData }) => {
    const product = loaderData ? getProduct(loaderData.slug) : undefined;
    if (!product) {
      return { meta: [{ title: "Producto no encontrado | D'ChocolAte" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${product.name} | D'ChocolAte`;
    return {
      meta: [
        { title },
        { name: "description", content: product.short },
        { property: "og:title", content: title },
        { property: "og:description", content: product.short },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const product = getProduct(slug)!;
  const related = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug)
    .concat(PRODUCTS.filter((p) => p.category !== product.category))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-card bg-muted shadow-lift animate-rise lg:sticky lg:top-24 lg:self-start">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square size-full object-cover"
            />
          ) : product.kind === "pack" ? (
            <div className="relative isolate grid aspect-square place-items-center bg-secondary p-10">
              <div aria-hidden className="paw-pattern absolute inset-0 -z-10 bg-sand opacity-40" />
              <PackScene container={getContainer(product.container)!} slots={product.contents} className="size-full" title={product.name} />
            </div>
          ) : null}
          {product.tag && <ProductTag tag={product.tag} className="absolute left-4 top-4" />}
        </div>

        <div className="flex flex-col animate-rise" style={{ animationDelay: "100ms" }}>
          <Link
            to="/"
            search={{ categoria: product.category }}
            className="text-eyebrow text-caramel hover:underline"
          >
            {categoryLabel(product.category)}
          </Link>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-primary sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.presentation}
            {product.cacao ? ` · ${product.cacao}% cacao` : ""}
          </p>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">{product.description}</p>

          {product.kind === "pack" ? (
            <PackBuy key={product.slug} product={product} />
          ) : (
            <IndividualBuy key={product.slug} product={product} />
          )}

          <dl className="mt-10 grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2">
            <div>
              <dt className="text-eyebrow flex items-center gap-2 text-muted-foreground">
                <Leaf className="size-3.5" /> Ingredientes
              </dt>
              <dd className="mt-2 text-sm text-foreground">{product.ingredients.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-muted-foreground">Alérgenos</dt>
              <dd className="mt-2 text-sm text-foreground">{product.allergens.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-24">
        <p className="font-script text-2xl text-caramel">Para compartir en buena compañía</p>
        <h2 className="text-3xl font-bold text-primary">También te puede gustar</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function IndividualBuy({ product }: { product: IndividualProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]!.id);
  const variant = getVariant(product, variantId) ?? product.variants[0]!;
  const choosable = product.variants.length > 1;

  return (
    <>
      {choosable && (
        <fieldset className="mt-8">
          <legend className="text-eyebrow text-muted-foreground">Elige tu relleno</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {product.variants.map((v) => {
              const active = v.id === variant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 bg-card p-2.5 pr-4 text-left transition-colors",
                    active ? "border-rosa-deep bg-blush" : "border-border hover:border-rosa",
                  )}
                >
                  {product.piece && v.look && (
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-background p-1">
                      <PieceThumb shape={product.piece} look={v.look} className="size-full" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-foreground">{v.label}</span>
                    {v.detail && <span className="block truncate text-xs text-muted-foreground">{v.detail}</span>}
                  </span>
                  <span className="font-display text-base font-bold text-primary">{formatPrice(v.price)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="mt-6 font-display text-4xl font-bold text-primary" aria-live="polite">
        {formatPrice(variant.price)}
        {choosable && <span className="ml-2 font-sans text-sm font-bold text-muted-foreground">{variant.label}</span>}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          variant="brand"
          size="xl"
          disabled={!product.inStock}
          onClick={() =>
            toast(`${product.name}${choosable ? ` · ${variant.label}` : ""}`, {
              description: "El carrito estará disponible en el próximo módulo.",
            })
          }
        >
          <ShoppingBag /> {product.inStock ? "Agregar al pedido" : "Agotado"}
        </Button>
        {product.piece ? (
          <Link to="/arma-tu-pack" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-caramel hover:text-primary">
            <Wand2 className="size-4" /> Ponlo en tu propia caja
          </Link>
        ) : (
          product.inStock && <Available />
        )}
      </div>
    </>
  );
}

function PackBuy({ product }: { product: PackProduct }) {
  const container = getContainer(product.container)!;
  return (
    <>
      <div className="mt-8 rounded-3xl border border-border bg-card p-5">
        <p className="text-eyebrow text-muted-foreground">Contiene · {container.label}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {groupSlots(product.contents).map((g) => {
            const piece = getPiece(g.piece)!;
            const v = getVariant(piece, g.variant)!;
            return (
              <li key={`${g.piece}:${g.variant}`} className="flex items-center gap-1.5 rounded-full bg-muted py-1 pl-1 pr-3 text-xs font-bold">
                {v.look && <PieceThumb shape={piece.piece} look={v.look} className="size-6" />}
                {g.count} × {piece.name} · {v.label}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-6 font-display text-4xl font-bold text-primary">{formatPrice(productPrice(product))}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="brand" size="xl">
          <Link to="/arma-tu-pack" search={{ base: product.slug }}>
            <Wand2 /> Personalizar este pack
          </Link>
        </Button>
        <Button
          variant="outline"
          size="xl"
          disabled={!product.inStock}
          onClick={() => toast(product.name, { description: "El carrito estará disponible en el próximo módulo." })}
        >
          <ShoppingBag /> Agregar tal cual
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Cambia el relleno de cada bombón y agrega listón, detalles o tarjeta.</p>
    </>
  );
}

function Available() {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Heart className="size-4 fill-rosa text-rosa" aria-hidden /> Disponible, hecho con mucho amor
    </span>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-4xl font-semibold text-foreground">Producto no encontrado</h1>
      <p className="mt-3 text-muted-foreground">Es posible que ya no esté disponible.</p>
      <Button asChild className="mt-8" size="lg">
        <Link to="/">Ver catálogo</Link>
      </Button>
    </div>
  );
}
