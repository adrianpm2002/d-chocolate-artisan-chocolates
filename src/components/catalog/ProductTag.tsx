import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const styles: Record<NonNullable<Product["tag"]>, string> = {
  Nuevo: "bg-raspberry text-raspberry-foreground",
  "Más vendido": "bg-gold text-gold-foreground",
  "Edición limitada": "bg-primary text-primary-foreground",
};

export function ProductTag({ tag, className }: { tag: NonNullable<Product["tag"]>; className?: string }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", styles[tag], className)}>
      {tag}
    </span>
  );
}
