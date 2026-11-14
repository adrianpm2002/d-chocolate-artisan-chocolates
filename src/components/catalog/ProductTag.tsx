import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const styles: Record<NonNullable<Product["tag"]>, string> = {
  Nuevo: "bg-rosa text-rosa-foreground",
  "Más vendido": "bg-caramel text-caramel-foreground",
  "Edición limitada": "bg-primary text-primary-foreground",
};

export function ProductTag({ tag, className }: { tag: NonNullable<Product["tag"]>; className?: string }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-bold shadow-sm", styles[tag], className)}>
      {tag}
    </span>
  );
}
