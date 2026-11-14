import { Link } from "@tanstack/react-router";
import { type Product, categoryLabel, formatPrice } from "@/lib/catalog";
import { ProductTag } from "./ProductTag";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <Link
      to="/productos/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift animate-rise"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.tag && <ProductTag tag={product.tag} />}
          {!product.inStock && (
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Agotado
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-eyebrow text-muted-foreground">{categoryLabel(product.category)}</p>
        <h3 className="text-xl font-semibold leading-tight text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.short}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="font-display text-2xl font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          <span className="max-w-[45%] text-right text-xs text-muted-foreground">{product.presentation}</span>
        </div>
      </div>
    </Link>
  );
}
