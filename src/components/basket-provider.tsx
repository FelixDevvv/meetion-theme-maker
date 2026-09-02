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
import {
  addPackageToBasket,
  createBasket,
  getBasket,
  getBasketAuthLinks,
  removePackageFromBasket,
  updateBasketQuantity,
} from "@/lib/tebex.functions";
import type { TebexBasket } from "@/lib/tebex";

const BASKET_KEY = "tebex_basket_ident";
const USERNAME_KEY = "tebex_username";
const PENDING_KEY = "tebex_pending_package";

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
  const create = useServerFn(createBasket);
  const fetchBasket = useServerFn(getBasket);
  const addItem = useServerFn(addPackageToBasket);
  const updateItem = useServerFn(updateBasketQuantity);
  const removeItem = useServerFn(removePackageFromBasket);
  const authLinks = useServerFn(getBasketAuthLinks);

  const [basket, setBasket] = useState<TebexBasket | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    setUsernameState(localStorage.getItem(USERNAME_KEY));
    const ident = localStorage.getItem(BASKET_KEY);
    if (!ident) return;
    fetchBasket({ data: { ident } })
      .then((data) => {
        if (data.complete) {
          localStorage.removeItem(BASKET_KEY);
          return;
        }
        setBasket(data);
      })
      .catch(() => localStorage.removeItem(BASKET_KEY));
  }, [fetchBasket]);

  const setUsername = useCallback((value: string | null) => {
    setUsernameState(value);
    if (value) localStorage.setItem(USERNAME_KEY, value);
    else localStorage.removeItem(USERNAME_KEY);
  }, []);

  const ensureBasket = useCallback(async () => {
    const existing = localStorage.getItem(BASKET_KEY);
    if (existing && basket && !basket.complete) return existing;
    const created = await create({
      data: { origin: window.location.origin, username: localStorage.getItem(USERNAME_KEY) },
    });
    localStorage.setItem(BASKET_KEY, created.ident);
    setBasket(created);
    return created.ident;
  }, [basket, create]);

  const withErrors = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Algo salió mal con Tebex.");
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(
    async (packageId: number, quantity = 1) => {
      await withErrors(async () => {
        const ident = await ensureBasket();

        // Las tiendas de Minecraft exigen vincular la cuenta antes de añadir
        // paquetes. Si Tebex devuelve enlaces de auth, la cesta no está
        // autenticada todavía: enviamos al usuario a iniciar sesión y al
        // volver añadimos el paquete pendiente automáticamente.
        const authUrl = await authLinks({
          data: { ident, returnUrl: `${window.location.origin}${window.location.pathname}` },
        })
          .then(findAuthUrl)
          .catch(() => null);

        if (authUrl) {
          localStorage.setItem(PENDING_KEY, JSON.stringify({ packageId, quantity }));
          toast.info("Vincula tu cuenta del juego para continuar…");
          window.location.href = authUrl;
          return;
        }

        try {
          const updated = await addItem({ data: { ident, packageId, quantity } });
          setBasket(updated);
          setOpen(true);
          toast.success("Añadido a la cesta");
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("must login")) {
            throw new Error(
              "Tebex requiere vincular la cuenta del juego, pero la tienda no tiene métodos de login activos. Activa la tienda y su autenticación en el panel de Tebex.",
            );
          }
          throw error;
        }

      });
    },
    [addItem, authLinks, ensureBasket, withErrors],
  );

  // Al regresar del login de Tebex, añade el paquete que quedó pendiente.
  useEffect(() => {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    localStorage.removeItem(PENDING_KEY);
    try {
      const pending = JSON.parse(raw) as { packageId: number; quantity?: number };
      void add(pending.packageId, pending.quantity ?? 1);
    } catch {
      /* ignorar */
    }
  }, [add]);


  const setQuantity = useCallback(
    async (packageId: number, quantity: number) => {
      await withErrors(async () => {
        const ident = await ensureBasket();
        const updated =
          quantity <= 0
            ? await removeItem({ data: { ident, packageId } })
            : await updateItem({ data: { ident, packageId, quantity } });
        setBasket(updated);
      });
    },
    [ensureBasket, removeItem, updateItem, withErrors],
  );

  const remove = useCallback(
    async (packageId: number) => {
      await withErrors(async () => {
        const ident = await ensureBasket();
        const updated = await removeItem({ data: { ident, packageId } });
        setBasket(updated);
      });
    },
    [ensureBasket, removeItem, withErrors],
  );

  const checkout = useCallback(async () => {
    await withErrors(async () => {
      const ident = await ensureBasket();
      const links = await authLinks({
        data: { ident, returnUrl: `${window.location.origin}/` },
      }).catch(() => [] as { name: string; url: string }[]);

      if (Array.isArray(links) && links.length > 0 && links[0]?.url) {
        window.location.href = links[0].url;
        return;
      }
      const current = basket ?? (await fetchBasket({ data: { ident } }));
      if (!current.links?.checkout) throw new Error("Tebex no devolvió un enlace de pago.");
      window.location.href = current.links.checkout;
    });
  }, [authLinks, basket, ensureBasket, fetchBasket, withErrors]);

  const itemCount = useMemo(
    () => basket?.packages?.reduce((sum, p) => sum + (p.in_basket?.quantity ?? 0), 0) ?? 0,
    [basket],
  );

  const value = useMemo(
    () => ({
      basket,
      loading,
      username,
      setUsername,
      open,
      setOpen,
      itemCount,
      add,
      setQuantity,
      remove,
      checkout,
    }),
    [
      basket,
      loading,
      username,
      setUsername,
      open,
      itemCount,
      add,
      setQuantity,
      remove,
      checkout,
    ],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket debe usarse dentro de BasketProvider");
  return ctx;
}
