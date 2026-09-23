import { Info, ShoppingCart } from "lucide-react";
import { useBasket } from "@/components/basket-provider";
import { PackagePreviewDialog } from "@/components/package-preview-dialog";
import { Button } from "@/components/ui/button";
import { formatPrice, type TebexPackage } from "@/lib/tebex";

export function PackageCard({ pkg }: { pkg: TebexPackage }) {
  const { add, loading } = useBasket();
  const hasDiscount = pkg.discount > 0;

  return (
    <article className="panel-card group relative flex min-h-[360px] flex-col p-5 pt-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:glow">
      {hasDiscount && (
        <span className="gradient-primary absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1 text-[10px] font-extrabold uppercase text-primary-foreground">
          {Math.round((pkg.discount / (pkg.base_price + pkg.discount)) * 100)}% de descuento
        </span>
      )}
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="flex h-44 w-full items-center justify-center p-3">
          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.name}
              loading="lazy"
              className="max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="gradient-primary size-28 rounded-md" />
          )}
        </div>
        <h3 className="font-display min-h-12 text-lg font-extrabold uppercase">{pkg.name}</h3>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="font-display text-xl font-black text-primary-glow">
            {formatPrice(pkg.total_price, pkg.currency)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-bold text-destructive line-through opacity-80">
              {formatPrice(pkg.base_price + pkg.discount, pkg.currency)}
            </span>
          )}
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <PackagePreviewDialog pkg={pkg}>
          <Button variant="outline" size="icon" className="size-11 shrink-0" title="Ver información">
            <Info className="size-5" />
            <span className="sr-only">Ver información de {pkg.name}</span>
          </Button>
        </PackagePreviewDialog>
        <Button
          disabled={loading}
          onClick={() => void add(pkg.id)}
          className="h-11 min-w-0 flex-1 gap-2 px-3 font-bold"
        >
          <ShoppingCart className="size-5" />
          <span className="truncate">Añadir al carrito</span>
        </Button>
      </div>
    </article>
  );
}
