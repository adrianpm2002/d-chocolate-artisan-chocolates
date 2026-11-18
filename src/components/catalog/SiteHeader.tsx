import { Link } from "@tanstack/react-router";
import { ShoppingBag, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-8">
        <Link to="/" aria-label="D'ChocolAte, ir al inicio" className="shrink-0">
          <BrandLogo />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-bold">
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
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-rosa bg-blush px-3 py-1.5 text-xs text-rosa-deep sm:text-sm transition-colors hover:bg-rosa hover:text-rosa-foreground"
            activeProps={{ className: "bg-rosa text-rosa-foreground" }}
            activeOptions={{ includeSearch: false }}
          >
            <Wand2 className="size-4" /> Arma tu caja
          </Link>
          <button
            type="button"
            aria-label="Carrito"
            onClick={() => toast("El carrito estará disponible en el próximo módulo.")}
            className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-caramel"
          >
            <ShoppingBag className="size-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
