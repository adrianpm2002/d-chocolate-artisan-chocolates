import wordmark from "@/assets/wordmark-dchocolate.png.asset.json";
import sello from "@/assets/mascota-sello.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img src={sello.url} alt="" width={141} height={147} className="h-10 w-auto sm:h-11" />
      <img
        src={wordmark.url}
        alt="D'ChocolAte"
        width={432}
        height={71}
        className="h-6 w-auto sm:h-7"
      />
    </span>
  );
}
