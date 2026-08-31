import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useBasket } from "@/components/basket-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/tebex";

export function BasketSheet() {
  const { basket, open, setOpen, setQuantity, remove, checkout, loading, username } =
    useBasket();
  const items = basket?.packages ?? [];
  const currency = basket?.currency ?? "USD";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 bg-panel sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2 uppercase tracking-wide">
            <ShoppingCart className="size-5 text-primary-glow" /> Tu cesta
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tu cesta está vacía. Elige un paquete para empezar.
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="panel-card flex items-center gap-3 p-3">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="size-12 rounded object-contain"
                />
              ) : (
                <div className="gradient-primary size-12 rounded" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display truncate text-sm uppercase">{item.name}</p>
                <p className="text-xs text-primary-glow">
                  {formatPrice(item.in_basket.price, currency)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void setQuantity(item.id, item.in_basket.quantity - 1)}
                >
                  <Minus className="size-3" />
                </Button>
                <span className="w-6 text-center text-sm">{item.in_basket.quantity}</span>
                <Button
                  size="icon"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void setQuantity(item.id, item.in_basket.quantity + 1)}
                >
                  <Plus className="size-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => void remove(item.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center justify-between">
            <span className="label-caps text-muted-foreground">Subtotal</span>
            <span className="font-display text-xl text-primary-glow">
              {formatPrice(basket?.total_price ?? 0, currency)}
            </span>
          </div>
          {!username && (
            <p className="text-xs text-muted-foreground">
              Recuerda iniciar sesión con tu nombre de usuario para recibir los paquetes.
            </p>
          )}
          <Button
            className="gradient-primary w-full text-primary-foreground"
            disabled={loading || items.length === 0}
            onClick={() => void checkout()}
          >
            Pagar con Tebex
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
