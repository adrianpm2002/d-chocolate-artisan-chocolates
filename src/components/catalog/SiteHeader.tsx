import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, ShoppingBag, Wand2, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useCart } from "./CartProvider";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { cart } = useCart();
  const count = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-8">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="menu-lateral"
              onClick={() => setOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-input text-foreground transition-colors hover:bg-secondary sm:hidden"
            >
              <Menu className="size-5" />
            </button>
            <Link
              to="/"
              aria-label="D'ChocolAte, ir al inicio"
              className="min-w-0"
              onClick={() => setOpen(false)}
            >
              <BrandLogo />
            </Link>
          </div>

          <nav className="flex shrink-0 items-center gap-2 text-sm font-bold sm:gap-5">
            <Link
              to="/"
              className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: true, includeSearch: false }}
            >
              Catálogo
            </Link>
            <Link
              to="/arma-tu-pack"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-rosa bg-blush px-3 py-1.5 text-xs text-rosa-deep transition-colors hover:bg-rosa hover:text-rosa-foreground sm:inline-flex sm:text-sm"
              activeProps={{ className: "bg-rosa text-rosa-foreground" }}
              activeOptions={{ includeSearch: false }}
            >
              <Wand2 className="size-4" /> Arma tu caja
            </Link>
            <Button asChild size="icon" variant="brand" className="relative size-10 rounded-full">
              <Link to="/carrito" aria-label={`Carrito, ${count} productos`}>
                <ShoppingBag className="size-4" />
                {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rosa-deep px-1 text-[10px] font-extrabold text-primary-foreground">{count > 99 ? "99+" : count}</span>}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" title="Dashboard de ventas">
              <Link to="/admin" aria-label="Dashboard de ventas"><LayoutDashboard /></Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Menú lateral: se abre con las 3 líneas y se cierra con la X, el fondo o Escape.
          Va fuera de <header> para que el desenfoque de la barra no recorte el panel. */}
      <div
        id="menu-lateral"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-50 sm:hidden ${open ? "" : "pointer-events-none"}`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-foreground/45 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className={`absolute inset-y-0 left-0 flex w-[82%] max-w-[19rem] flex-col border-r border-border bg-background shadow-lift transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <BrandLogo />
            <button
              ref={closeRef}
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-input text-foreground transition-colors hover:bg-secondary"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 p-4 text-base font-bold">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: true, includeSearch: false }}
            >
              Catálogo
            </Link>
            <Link
              to="/arma-tu-pack"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl border-2 border-rosa bg-blush px-4 py-3 text-rosa-deep transition-colors hover:bg-rosa hover:text-rosa-foreground"
              activeProps={{ className: "bg-rosa text-rosa-foreground" }}
              activeOptions={{ includeSearch: false }}
            >
              <Wand2 className="size-4.5 shrink-0" /> Arma tu caja
            </Link>
            <Button asChild variant="ghost" className="h-12 justify-start px-4" onClick={() => setOpen(false)}>
              <Link to="/admin"><LayoutDashboard /> Dashboard de ventas</Link>
            </Button>
          </nav>

          <div className="relative isolate mt-auto overflow-hidden border-t border-border px-5 py-6">
            <div aria-hidden className="paw-pattern absolute inset-0 -z-10 bg-sand opacity-50" />
            <p className="font-script text-2xl text-caramel">
              El chocolate también se disfruta en buena compañía
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
