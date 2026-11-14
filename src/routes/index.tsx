import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-chocolate.jpg";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  PRODUCTS,
  SORT_OPTIONS,
  filterProducts,
  parseCatalogSearch,
  type SortId,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  validateSearch: parseCatalogSearch,
  head: () => ({
    meta: [
      { title: "Catálogo de chocolates artesanales | D'ChocolAte" },
      {
        name: "description",
        content:
          "Explora bombones, tabletas, frutas cubiertas y cajas de regalo hechas a mano por D'ChocolAte.",
      },
      { property: "og:title", content: "Catálogo de chocolates artesanales | D'ChocolAte" },
      {
        property: "og:description",
        content: "Bombones, tabletas, frutas cubiertas y cajas de regalo hechas a mano.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [query, setQuery] = useState(search.q ?? "");

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = query.trim() ? query : undefined;
      if (next !== search.q) {
        navigate({ search: (prev) => ({ ...prev, q: next }), replace: true, resetScroll: false });
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, search.q, navigate]);

  const products = filterProducts(PRODUCTS, search);
  const hasFilters = Boolean(search.q || search.categoria);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-cacao">
        <img
          src={heroImage}
          alt="Bombones artesanales, cacao y chocolate troceado sobre madera"
          width={1600}
          height={912}
          className="absolute inset-0 -z-10 size-full object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="text-eyebrow text-gold animate-rise">Hecho a mano · Pequeños lotes</p>
          <h1
            className="mt-4 max-w-xl text-5xl font-semibold leading-[1.05] text-cacao-foreground sm:text-6xl animate-rise"
            style={{ animationDelay: "80ms" }}
          >
            El arte del cacao, pieza por pieza.
          </h1>
          <p
            className="mt-5 max-w-md text-base text-cacao-foreground/75 animate-rise"
            style={{ animationDelay: "160ms" }}
          >
            Descubre nuestro catálogo de bombones, tabletas y detalles para regalar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-foreground">Catálogo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "producto" : "productos"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar chocolates…"
                aria-label="Buscar productos"
                className="h-11 rounded-full bg-card pl-9"
              />
            </div>
            <Select
              value={search.orden ?? "destacados"}
              onValueChange={(value) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    orden: value === "destacados" ? undefined : (value as SortId),
                  }),
                  resetScroll: false,
                })
              }
            >
              <SelectTrigger aria-label="Ordenar" className="h-11 rounded-full bg-card sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Categorías">
          <CategoryChip active={!search.categoria} to={undefined}>
            Todos
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.id} active={search.categoria === c.id} to={c.id}>
              {c.label}
            </CategoryChip>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="font-display text-2xl text-foreground">No encontramos productos</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prueba con otra búsqueda o categoría.
            </p>
          </div>
        )}

        {hasFilters && (
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              search={(prev) => ({ orden: prev.orden })}
              resetScroll={false}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <X className="size-4" /> Limpiar filtros
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

function CategoryChip({
  active,
  to,
  children,
}: {
  active: boolean;
  to: (typeof CATEGORIES)[number]["id"] | undefined;
  children: React.ReactNode;
}) {
  return (
    <Link
      to="/"
      search={(prev) => ({ ...prev, categoria: to })}
      resetScroll={false}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary",
      )}
    >
      {children}
    </Link>
  );
}
