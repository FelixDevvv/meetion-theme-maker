import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { createCheckout } from "@/lib/tebex.functions";
import type { TebexBasket, TebexCategory, TebexPackage } from "@/lib/tebex";
import { categoriesQuery } from "@/lib/tebex-queries";

const BASKET_KEY = "t4s_basket";
const USERNAME_KEY = "tebex_username";

type StoredItem = { id: number; name: string; image: string | null; price: number; currency: string; quantity: number };

type BasketContextValue = {
  basket: TebexBasket | null;
  loading: boolean;
  username: string | null;
  setUsername: (value: string | null) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  itemCount: number;
  add: (packageId: number, quantity?: number) => Promise<void>;
  setQuantity: (packageId: number, quantity: number) => Promise<void>;
  remove: (packageId: number) => Promise<void>;
  checkout: () => Promise<void>;
};

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const startCheckout = useServerFn(createCheckout);
  const [items, setItems] = useState<StoredItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    setUsernameState(localStorage.getItem(USERNAME_KEY));
    try {
      const raw = localStorage.getItem(BASKET_KEY);
      if (raw) setItems(JSON.parse(raw) as StoredItem[]);
    } catch {
      localStorage.removeItem(BASKET_KEY);
    }
  }, []);

  const persist = useCallback((next: StoredItem[]) => {
    setItems(next);
    localStorage.setItem(BASKET_KEY, JSON.stringify(next));
  }, []);

  const setUsername = useCallback((value: string | null) => {
    setUsernameState(value);
    if (value) localStorage.setItem(USERNAME_KEY, value);
    else localStorage.removeItem(USERNAME_KEY);
  }, []);

  const findPackage = useCallback(
    async (id: number): Promise<TebexPackage | undefined> => {
      const cats = (await queryClient.ensureQueryData(categoriesQuery)) as TebexCategory[];
      for (const c of cats) {
        const p = c.packages.find((x) => x.id === id);
        if (p) return p;
      }
      return undefined;
    },
    [queryClient],
  );

  const add = useCallback(
    async (packageId: number, quantity = 1) => {
      const existing = items.find((i) => i.id === packageId);
      if (existing) {
        persist(items.map((i) => (i.id === packageId ? { ...i, quantity: i.quantity + quantity } : i)));
      } else {
        const pkg = await findPackage(packageId);
        if (!pkg) {
          toast.error("No se encontró el paquete.");
          return;
        }
        persist([
          ...items,
          { id: pkg.id, name: pkg.name, image: pkg.image, price: pkg.total_price, currency: pkg.currency, quantity },
        ]);
      }
      setOpen(true);
      toast.success("Añadido a la cesta");
    },
    [findPackage, items, persist],
  );

  const setQuantity = useCallback(
    async (packageId: number, quantity: number) => {
      persist(
        quantity <= 0
          ? items.filter((i) => i.id !== packageId)
          : items.map((i) => (i.id === packageId ? { ...i, quantity } : i)),
      );
    },
    [items, persist],
  );

  const remove = useCallback(
    async (packageId: number) => persist(items.filter((i) => i.id !== packageId)),
    [items, persist],
  );

  const checkout = useCallback(async () => {
    setLoading(true);
    try {
      const { url } = await startCheckout({
        data: { origin: window.location.origin, items: items.map((i) => ({ id: i.id, quantity: i.quantity })) },
      });
      localStorage.removeItem(BASKET_KEY);
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar el pago.");
      setLoading(false);
    }
  }, [items, startCheckout]);

  const basket = useMemo<TebexBasket | null>(() => {
    if (items.length === 0) return null;
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      ident: "local",
      complete: false,
      base_price: total,
      total_price: total,
      currency: items[0].currency,
      packages: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        image: i.image,
        in_basket: { quantity: i.quantity, price: i.price * i.quantity },
      })),
      links: { checkout: "" },
    };
  }, [items]);

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ basket, loading, username, setUsername, open, setOpen, itemCount, add, setQuantity, remove, checkout }),
    [basket, loading, username, setUsername, open, itemCount, add, setQuantity, remove, checkout],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket debe usarse dentro de BasketProvider");
  return ctx;
}
