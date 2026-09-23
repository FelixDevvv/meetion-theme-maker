import { Gift, ShoppingCart } from "lucide-react";
import { useBasket } from "@/components/basket-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice, stripHtml, type TebexPackage } from "@/lib/tebex";

export function PackagePreviewDialog({
  pkg,
  children,
}: {
  pkg: TebexPackage;
  children: React.ReactNode;
}) {
  const { add, loading } = useBasket();
  const hasDiscount = pkg.discount > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[88vh] w-[calc(100%-2rem)] max-w-4xl gap-0 overflow-y-auto border-border bg-card p-0 shadow-2xl sm:rounded-lg">
        <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[180px_1fr]">
          <div className="flex aspect-square items-center justify-center rounded-md bg-background/55 p-5">
            {pkg.image ? (
              <img
                src={pkg.image}
                alt={pkg.name}
                className="max-h-40 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="gradient-primary size-32 rounded-md" />
            )}
          </div>

          <div className="min-w-0 space-y-4 text-center md:text-left">
            <DialogTitle className="font-display text-2xl font-extrabold uppercase text-foreground sm:text-3xl">
              {pkg.name}
            </DialogTitle>
            <div className="flex flex-wrap items-baseline justify-center gap-3 md:justify-start">
              <span className="font-display text-3xl font-black text-primary-glow">
                {formatPrice(pkg.total_price, pkg.currency)}
              </span>
              {hasDiscount && (
                <span className="text-base font-bold text-destructive line-through opacity-80">
                  {formatPrice(pkg.base_price + pkg.discount, pkg.currency)}
                </span>
              )}
            </div>
            <div className="flex justify-center gap-3 md:justify-start">
              <Button
                disabled={loading}
                onClick={() => void add(pkg.id)}
                className="h-11 gap-2 px-6 font-bold"
              >
                <ShoppingCart className="size-5" /> Añadir al carrito
              </Button>
              <Button variant="outline" size="icon" className="size-11" title="Regalo digital">
                <Gift className="size-5" />
                <span className="sr-only">Regalo digital</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-background/55 p-6 sm:p-8">
          <p className="label-caps mb-4 text-primary-glow">Descripción del paquete</p>
          <DialogDescription className="text-sm leading-7 text-muted-foreground">
            {stripHtml(pkg.description) || "Este paquete se entrega automáticamente en el servidor."}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}