import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type Product, categoryLabel, formatPrice, hasPriceRange, productPrice } from "@/lib/catalog";
import { PackScene } from "@/components/packs/PackScene";
import { getContainer } from "@/lib/catalog";
import { ProductTag } from "./ProductTag";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <Link
      to="/productos/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-2.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift animate-rise"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        ) : product.kind === "pack" ? (
          <div className="relative isolate grid size-full place-items-center bg-secondary p-6">
            <div aria-hidden className="paw-pattern absolute inset-0 -z-10 bg-sand opacity-40" />
            <PackScene
              container={getContainer(product.container)!}
              slots={product.contents}
              className="size-full transition-transform duration-700 group-hover:scale-105"
              title={product.name}
            />
          </div>
        ) : null}
        <div className="absolute left-3 top-3 flex gap-2">
          {product.tag && <ProductTag tag={product.tag} />}
          {!product.inStock && (
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-muted-foreground">
              Agotado
            </span>
          )}
        </div>
        {(product.kind === "pack" || product.variants.length > 1) && (
          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-extrabold text-rosa-deep">
            {product.kind === "pack" ? "Personalizable" : `${product.variants.length} rellenos`}
          </span>
        )}
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 text-rosa-deep opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Heart className="size-4 fill-rosa text-rosa-deep" aria-hidden />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-2.5 pt-4">
        <p className="text-eyebrow text-caramel">{categoryLabel(product.category)}</p>
        <h3 className="text-xl font-semibold leading-tight text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.short}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="font-display text-2xl font-bold text-primary">
            {hasPriceRange(product) ? "Desde " : ""}
              {formatPrice(productPrice(product))}
          </span>
          <span className="max-w-[45%] text-right text-xs font-semibold text-muted-foreground">
            {product.presentation}
          </span>
        </div>
      </div>
    </Link>
  );
}
