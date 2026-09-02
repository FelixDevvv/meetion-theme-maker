import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PackageCard } from "@/components/package-card";
import { StoreLayout } from "@/components/store-layout";
import { STORE_CONFIG, categorySlug, formatPrice } from "@/lib/tebex";
import { categoriesQuery, storeQuery } from "@/lib/tebex-queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tienda MeeTion MC — Rangos, llaves y cosméticos" },
      {
        name: "description",
        content:
          "Compra rangos VIP, llaves y cosméticos para MeeTion MC. Pagos seguros con Tebex y entrega instantánea en el servidor.",
      },
      { property: "og:title", content: "Tienda MeeTion MC — Rangos, llaves y cosméticos" },
      {
        property: "og:description",
        content: "Rangos VIP, llaves y cosméticos con entrega instantánea.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(storeQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  component: Index,
});

function Index() {
  const { data: store } = useSuspenseQuery(storeQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const goal = STORE_CONFIG.monthlyGoal;
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

  return (
    <StoreLayout>
      <section className="panel-card p-5">
        <h1 className="font-display text-2xl uppercase tracking-widest text-primary-glow">
          Bienvenido a {store?.name ?? STORE_CONFIG.serverName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gracias por apoyar el servidor. Elige una categoría en el menú lateral o explora
          los paquetes destacados más abajo. Todas las compras se entregan automáticamente.
        </p>
      </section>

      <section className="panel-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="label-caps text-muted-foreground">Objetivo mensual</h2>
          <span className="font-display text-sm text-primary-glow">
            {formatPrice(goal.current, goal.currency)} /{" "}
            {formatPrice(goal.target, goal.currency)}
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div className="gradient-primary h-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{pct}% completado</p>
      </section>

      {(categories ?? []).map((category) => (
        <section key={category.id} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl uppercase tracking-wide">{category.name}</h2>
            <Link
              to="/categoria/$slug"
              params={{ slug: categorySlug(category) }}
              className="label-caps text-[10px] text-primary-glow hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {category.packages.slice(0, 6).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>
      ))}
    </StoreLayout>
  );
}
