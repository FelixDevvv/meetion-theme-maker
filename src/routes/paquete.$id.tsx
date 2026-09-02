import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useBasket } from "@/components/basket-provider";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { formatPrice, stripHtml } from "@/lib/tebex";
import { packageQuery } from "@/lib/tebex-queries";

export const Route = createFileRoute("/paquete/$id")({
  head: () => ({
    meta: [
      { title: "Paquete — Tienda MeeTion MC" },
      {
        name: "description",
        content: "Detalles del paquete: precio, contenido y compra segura con Tebex.",
      },
      { property: "og:title", content: "Paquete — Tienda MeeTion MC" },
      {
        property: "og:description",
        content: "Detalles del paquete: precio, contenido y compra segura con Tebex.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(packageQuery(Number(params.id))),
  component: PackagePage,
});

function PackagePage() {
  const { id } = Route.useParams();
  const { data: pkg } = useSuspenseQuery(packageQuery(Number(id)));
  const { add, loading } = useBasket();

  if (!pkg) {
    return (
      <StoreLayout>
        <div className="panel-card p-6 text-sm text-muted-foreground">
          No encontramos este paquete.
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <article className="panel-card grid gap-6 p-6 md:grid-cols-[240px_1fr]">
        <div className="flex items-center justify-center rounded-md bg-background/40 p-4">
          {pkg.image ? (
            <img src={pkg.image} alt={pkg.name} className="max-h-56 w-auto object-contain" />
          ) : (
            <div className="gradient-primary h-40 w-40 rounded-md" />
          )}
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-2xl uppercase tracking-widest text-primary-glow">
            {pkg.name}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {stripHtml(pkg.description) || "Paquete de la tienda."}
          </p>
          <p className="font-display text-2xl">{formatPrice(pkg.total_price, pkg.currency)}</p>
          <Button disabled={loading} onClick={() => void add(pkg.id)} className="gap-2">
            <Plus className="size-4" /> Añadir a la cesta
          </Button>
        </div>
      </article>
    </StoreLayout>
  );
}
