import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, PawPrint, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-bombones-corazon.jpg";
import mascota from "@/assets/mascota-corazon.png.asset.json";
import { Button } from "@/components/ui/button";
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
      { title: "Bombones y turrones artesanales | D'ChocolAte" },
      {
        name: "description",
        content:
          "Explora bombones, tabletas, frutas cubiertas y cajas de regalo hechas a mano por D'ChocolAte.",
      },
      { property: "og:title", content: "Bombones y turrones artesanales | D'ChocolAte" },
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
      <section className="relative isolate overflow-hidden border-b border-border bg-secondary">
        <div aria-hidden className="paw-pattern absolute inset-0 -z-10 bg-sand opacity-50" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <p className="text-eyebrow flex items-center gap-2 text-caramel animate-rise">
              <PawPrint className="size-3.5" aria-hidden /> Bombones y turrones artesanales
            </p>
            <h1
              className="mt-4 max-w-xl text-[2.6rem] font-bold leading-[1.02] text-primary sm:text-6xl animate-rise"
              style={{ animationDelay: "80ms" }}
            >
              Pequeños placeres, grandes momentos.
            </h1>
            <p
              className="mt-4 font-script text-3xl text-caramel animate-rise sm:text-4xl"
              style={{ animationDelay: "140ms" }}
            >
              Hecho con mucho amor
              <Heart className="ml-2 inline size-6 -translate-y-0.5 fill-rosa text-rosa" aria-hidden />
            </p>
            <p
              className="mt-5 max-w-md text-base text-muted-foreground animate-rise"
              style={{ animationDelay: "200ms" }}
            >
              Bombones, tabletas y detalles para regalar, elaborados a mano en pequeños lotes.
            </p>
            <div className="mt-8 animate-rise" style={{ animationDelay: "260ms" }}>
              <Button asChild variant="brand" size="xl">
                <a href="#catalogo">Ver el catálogo</a>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-rise lg:max-w-none" style={{ animationDelay: "120ms" }}>
            <div className="overflow-hidden rounded-[2.5rem] border-4 border-card shadow-lift">
              <img
                src={heroImage}
                alt="Caja de bombones en forma de corazón y turrón de avellana con listón rosa"
                width={1024}
                height={1152}
                className="aspect-[4/4.2] size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-3 grid size-32 place-items-center rounded-full border-4 border-card bg-background shadow-card sm:-left-8 sm:size-40">
              <img
                src={mascota.url}
                alt="Mascota de D'ChocolAte sosteniendo un bombón de corazón"
                width={194}
                height={205}
                className="w-[78%] animate-wag"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-20 px-5 pt-16 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-script text-2xl text-caramel">Elige tu antojo</p>
            <h2 className="text-4xl font-bold text-primary">Nuestro catálogo</h2>
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
          <div className="mt-10 rounded-3xl border border-dashed border-input bg-card px-6 py-14 text-center">
            <img src={mascota.url} alt="" width={194} height={205} className="mx-auto w-24" />
            <p className="mt-4 font-display text-2xl text-foreground">No encontramos productos</p>
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
        "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-rosa hover:bg-blush",
      )}
    >
      {children}
    </Link>
  );
}
