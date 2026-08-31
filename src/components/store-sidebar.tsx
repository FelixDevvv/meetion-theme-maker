import { Link } from "@tanstack/react-router";
import { Gift, LayoutGrid, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORE_CONFIG, avatarUrl, categorySlug, type TebexCategory } from "@/lib/tebex";

export function StoreSidebar({ categories }: { categories: TebexCategory[] }) {
  const [openCategories, setOpenCategories] = useState(true);
  const [coupon, setCoupon] = useState("");

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
      <div className="panel-card overflow-hidden">
        <button
          onClick={() => setOpenCategories((value) => !value)}
          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/60"
        >
          <LayoutGrid className="size-6 text-primary-glow" />
          <span>
            <span className="label-caps block text-[10px] text-muted-foreground">
              Haz clic aquí para
            </span>
            <span className="font-display text-base uppercase">Selecciona una categoría</span>
          </span>
        </button>
        {openCategories && (
          <nav className="border-t border-border">
            {categories.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Todavía no hay categorías en la tienda.
              </p>
            )}
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/categoria/$slug"
                params={{ slug: categorySlug(category) }}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary/60"
                activeProps={{ className: "bg-secondary/80 text-primary-glow" }}
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt=""
                    loading="lazy"
                    className="size-7 rounded object-cover"
                  />
                ) : (
                  <span className="gradient-primary size-7 rounded" />
                )}
                <span className="font-display uppercase tracking-wide">{category.name}</span>
              </Link>
            ))}
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
