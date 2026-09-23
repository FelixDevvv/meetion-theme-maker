import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PackageCard } from "@/components/package-card";
import { StoreLayout } from "@/components/store-layout";
import { categorySlug, stripHtml } from "@/lib/tebex";
import { categoriesQuery } from "@/lib/tebex-queries";

export const Route = createFileRoute("/categoria/$slug")({
  head: () => ({
    meta: [
      { title: "Categoría — Tienda Nexora Network" },
      {
        name: "description",
        content: "Explora los paquetes de esta categoría en la tienda de Nexora Network.",
      },
      { property: "og:title", content: "Categoría — Tienda Nexora Network" },
      {
        property: "og:description",
        content: "Explora los paquetes de esta categoría en la tienda de Nexora Network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const category = (categories ?? []).find((item) => categorySlug(item) === slug);

  return (
    <StoreLayout>
      {!category ? (
        <div className="panel-card p-6 text-sm text-muted-foreground">
          No encontramos esta categoría.
        </div>
      ) : (
        <>
          <section className="panel-card border-l-4 border-l-primary p-6 sm:p-8">
            <p className="label-caps text-muted-foreground">Estás viendo</p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase text-primary-glow sm:text-4xl">
              {category.name}
            </h1>
            {stripHtml(category.description) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {stripHtml(category.description)}
              </p>
            )}
          </section>
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
            {category.packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          {category.packages.length === 0 && (
            <p className="panel-card p-6 text-sm text-muted-foreground">
              Esta categoría todavía no tiene paquetes.
            </p>
          )}
        </>
      )}
    </StoreLayout>
  );
}
