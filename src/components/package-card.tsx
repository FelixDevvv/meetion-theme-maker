import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useBasket } from "@/components/basket-provider";
import { formatPrice, stripHtml, type TebexPackage } from "@/lib/tebex";

export function PackageCard({ pkg }: { pkg: TebexPackage }) {
  const { add, loading } = useBasket();
  const hasDiscount = pkg.discount > 0;

  return (
    <article className="panel-card group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5 hover:glow">
      {hasDiscount && (
        <span className="gradient-primary absolute right-2 top-2 z-10 rounded px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          -{formatPrice(pkg.discount, pkg.currency)}
        </span>
      )}
      <Link
        to="/paquete/$id"
        params={{ id: String(pkg.id) }}
        className="flex flex-1 flex-col gap-3 p-4"
      >
        <div className="flex items-center justify-center rounded-md bg-background/40 p-3">
          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.name}
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
          ) : (
            <div className="gradient-primary h-20 w-20 rounded-md" />
          )}
        </div>
        <div>
          <h3 className="font-display text-base uppercase tracking-wide">{pkg.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {stripHtml(pkg.description) || "Paquete de la tienda"}
          </p>
        </div>
        <div className="mt-auto flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(pkg.base_price + pkg.discount, pkg.currency)}
            </span>
          )}
          <span className="font-display text-lg text-primary-glow">
            {formatPrice(pkg.total_price, pkg.currency)}
          </span>
        </div>
      </Link>
      <button
        disabled={loading}
        onClick={() => void add(pkg.id)}
        className="gradient-primary label-caps flex items-center justify-center gap-2 py-2 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Plus className="size-4" /> Añadir a la cesta
      </button>
    </article>
  );
}
