import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Leaf, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductTag } from "@/components/catalog/ProductTag";
import { Button } from "@/components/ui/button";
import { PRODUCTS, categoryLabel, formatPrice, getProduct } from "@/lib/catalog";

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
        <div className="relative overflow-hidden rounded-3xl bg-muted shadow-card animate-rise">
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="aspect-square size-full object-cover"
          />
          {product.tag && <ProductTag tag={product.tag} className="absolute left-4 top-4" />}
        </div>

        <div className="flex flex-col animate-rise" style={{ animationDelay: "100ms" }}>
          <Link
            to="/"
            search={{ categoria: product.category }}
            className="text-eyebrow text-gold hover:underline"
          >
            {categoryLabel(product.category)}
          </Link>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.presentation}
            {product.cacao ? ` · ${product.cacao}% cacao` : ""}
          </p>
          <p className="mt-6 font-display text-4xl font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              variant="gold"
              size="xl"
              disabled={!product.inStock}
              onClick={() => toast("El carrito estará disponible en el próximo módulo.")}
            >
              <ShoppingBag /> {product.inStock ? "Agregar al pedido" : "Agotado"}
            </Button>
            {product.inStock && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-gold" /> Disponible
              </span>
            )}
          </div>

          <dl className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-2">
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
        <h2 className="text-3xl font-semibold text-foreground">También te puede gustar</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
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
