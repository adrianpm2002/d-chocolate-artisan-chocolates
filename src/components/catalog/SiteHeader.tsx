import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">
          D'Chocol<span className="text-gold">A</span>te
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true, includeSearch: false }}
          >
            Catálogo
          </Link>
          <button
            type="button"
            aria-label="Carrito"
            onClick={() => toast("El carrito estará disponible en el próximo módulo.")}
            className="relative grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="size-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
