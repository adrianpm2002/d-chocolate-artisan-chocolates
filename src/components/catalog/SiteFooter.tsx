export function SiteFooter() {
  return (
    <footer className="mt-24 bg-cacao text-cacao-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-3xl font-semibold">
            D'Chocol<span className="text-gold">A</span>te
          </p>
          <p className="mt-2 max-w-sm text-sm text-cacao-foreground/70">
            Chocolates artesanales elaborados a mano, en pequeños lotes.
          </p>
        </div>
        <p className="text-xs text-cacao-foreground/60">
          © {new Date().getFullYear()} D'ChocolAte. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
