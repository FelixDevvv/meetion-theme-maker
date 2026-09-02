import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PackageCard } from "@/components/package-card";
import { StoreLayout } from "@/components/store-layout";
import { categorySlug, stripHtml } from "@/lib/tebex";
import { categoriesQuery } from "@/lib/tebex-queries";

export const Route = createFileRoute("/categoria/$slug")({
  head: () => ({
    meta: [
      { title: "Categoría — Tienda MeeTion MC" },
      {
        name: "description",
        content: "Explora los paquetes de esta categoría en la tienda de MeeTion MC.",
      },
      { property: "og:title", content: "Categoría — Tienda MeeTion MC" },
      {
        property: "og:description",
        content: "Explora los paquetes de esta categoría en la tienda de MeeTion MC.",
      },
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
          <section className="panel-card p-5">
            <h1 className="font-display text-2xl uppercase tracking-widest text-primary-glow">
              {category.name}
            </h1>
            {stripHtml(category.description) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {stripHtml(category.description)}
              </p>
            )}
          </section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
