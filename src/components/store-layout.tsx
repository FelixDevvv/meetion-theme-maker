import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BasketSheet } from "@/components/basket-sheet";
import { StoreHero } from "@/components/store-hero";
import { StoreSidebar } from "@/components/store-sidebar";
import { STORE_CONFIG } from "@/lib/tebex";
import { categoriesQuery, storeQuery } from "@/lib/tebex-queries";

export function StoreLayout({ children }: { children: ReactNode }) {
  useSuspenseQuery(storeQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);

  return (
    <div className="min-h-screen">
      <StoreHero storeName={STORE_CONFIG.serverName} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 lg:flex-row">
        <StoreSidebar categories={categories ?? []} />
        <main className="min-w-0 flex-1 space-y-5">{children}</main>
      </div>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Los pagos se procesan de forma segura a través de Tebex. Todas las compras son
        finales.
      </footer>
      <BasketSheet />
    </div>
  );
}
