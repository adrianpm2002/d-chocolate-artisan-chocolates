import { Heart, PawPrint } from "lucide-react";
import logo from "@/assets/logo-dchocolate.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="relative isolate mt-24 overflow-hidden border-t border-border bg-secondary">
      <div aria-hidden className="paw-pattern absolute inset-0 -z-10 bg-sand opacity-60" />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-14 text-center sm:px-8">
        <img
          src={logo.url}
          alt="D'ChocolAte, bombones y turrones artesanales"
          width={438}
          height={282}
          loading="lazy"
          className="w-56 sm:w-64"
        />
        <p className="mt-6 font-script text-3xl text-caramel">
          El chocolate también se disfruta en buena compañía
          <Heart className="ml-2 inline size-5 fill-rosa text-rosa" aria-hidden />
        </p>
        <div className="mt-10 flex w-full items-center gap-4 text-eyebrow text-muted-foreground">
          <span className="h-px flex-1 bg-input" />
          <span className="flex items-center gap-2">
            D'ChocolAte <PawPrint className="size-3.5 text-caramel" aria-hidden />
            <span className="hidden sm:inline">Bombones y turrones artesanales</span>
          </span>
          <span className="h-px flex-1 bg-input" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} D'ChocolAte. Hecho con mucho amor.
        </p>
      </div>
    </footer>
  );
}
