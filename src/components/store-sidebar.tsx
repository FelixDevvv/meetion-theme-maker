import { Link } from "@tanstack/react-router";
import { ChevronUp, Gift, LayoutGrid, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORE_CONFIG, avatarUrl, categorySlug, type TebexCategory } from "@/lib/tebex";

export function StoreSidebar({ categories }: { categories: TebexCategory[] }) {
  const [openCategories, setOpenCategories] = useState(true);
  const [openCategoryIds, setOpenCategoryIds] = useState<Set<number>>(() => new Set());
  const [coupon, setCoupon] = useState("");
  const rootCategories = categories.filter((category) => !category.parent);

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <div className="panel-card overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpenCategories((value) => !value)}
          className="h-auto w-full justify-start gap-3 rounded-none px-4 py-4 text-left hover:bg-secondary/60"
        >
          <LayoutGrid className="size-6 text-primary-glow" />
          <span>
            <span className="label-caps block text-[10px] text-muted-foreground">
              Haz clic aquí para
            </span>
            <span className="font-display text-base uppercase">Selecciona una categoría</span>
          </span>
        </Button>
        {openCategories && (
          <nav className="border-t border-border">
            {categories.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Todavía no hay categorías en la tienda.
              </p>
            )}
            {rootCategories.map((category) => {
              const children = categories.filter((item) => item.parent?.id === category.id);
              const isOpen = openCategoryIds.has(category.id);
              const categoryIcon = category.image_url ? (
                <img
                  src={category.image_url}
                  alt=""
                  loading="lazy"
                  className="size-7 rounded object-cover"
                />
              ) : (
                <span className="gradient-primary size-7 rounded" />
              );

              if (children.length === 0) {
                return (
                  <Link
                    key={category.id}
                    to="/categoria/$slug"
                    params={{ slug: categorySlug(category) }}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary/60"
                    activeProps={{ className: "bg-secondary/80 text-primary-glow" }}
                  >
                    {categoryIcon}
                    <span className="font-display uppercase tracking-wide">{category.name}</span>
                  </Link>
                );
              }

              return (
                <div key={category.id} className="border-b border-border/70 last:border-b-0">
                  <Button
                    type="button"
                    variant="ghost"
                    aria-expanded={isOpen}
                    aria-controls={`subcategory-${category.id}`}
                    onClick={() => toggleCategory(category.id)}
                    className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-left hover:bg-secondary/60"
                  >
                    {categoryIcon}
                    <span className="min-w-0 flex-1 font-display text-sm uppercase tracking-wide">
                      {category.name}
                    </span>
                    <ChevronUp
                      className={`size-4 shrink-0 text-primary-glow transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                  <div
                    id={`subcategory-${category.id}`}
                    className={`grid overflow-hidden bg-background/25 transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="min-h-0">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          to="/categoria/$slug"
                          params={{ slug: categorySlug(child) }}
                          className="flex items-center border-t border-border/50 py-3 pr-4 pl-14 text-sm transition-colors hover:bg-secondary/60"
                          activeProps={{ className: "bg-secondary/80 text-primary-glow" }}
                        >
                          <span className="font-display uppercase tracking-wide">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        )}
      </div>

      <div className="panel-card p-4">
        <h2 className="label-caps flex items-center gap-2 text-muted-foreground">
          <Trophy className="size-4 text-primary-glow" /> Top donador
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={avatarUrl(STORE_CONFIG.topDonor.name)}
            alt=""
            loading="lazy"
            className="size-9 rounded"
          />
          <div>
            <p className="font-display text-sm uppercase text-primary-glow">
              {STORE_CONFIG.topDonor.name}
            </p>
            <p className="text-xs text-muted-foreground">{STORE_CONFIG.topDonor.note}</p>
          </div>
        </div>
      </div>

      <div className="panel-card p-4">
        <h2 className="label-caps flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 text-primary-glow" /> Pagos recientes
        </h2>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {STORE_CONFIG.recentPayments.map((name) => (
            <img
              key={name}
              src={avatarUrl(name)}
              alt={name}
              title={name}
              loading="lazy"
              className="size-8 rounded"
            />
          ))}
        </div>
      </div>

      <div className="panel-card p-4">
        <h2 className="label-caps flex items-center gap-2 text-muted-foreground">
          <Gift className="size-4 text-primary-glow" /> Saldo de tarjeta regalo
        </h2>
        <div className="mt-3 flex gap-2">
          <Input
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
            placeholder="Código"
            className="bg-background/40"
          />
          <Button
            variant="secondary"
            onClick={() =>
              toast.info(
                "Los códigos de tarjeta regalo y cupones se aplican en el checkout de Tebex.",
              )
            }
          >
            Ver
          </Button>
        </div>
      </div>
    </aside>
  );
}
