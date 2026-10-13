import { createServerFn } from "@tanstack/react-start";
import {
  TIP4SERV_API,
  TIP4SERV_STORE_ID,
  type TebexCategory,
  type TebexPackage,
  type TebexStore,
} from "./tebex";

// Conexión con Tip4Serv. Mantiene los mismos tipos que usaba la tienda para no
// tocar la interfaz.

async function tip4serv<T>(
  path: string,
  init?: { method?: string; body?: unknown; auth?: boolean },
): Promise<T> {
  const key = process.env['TIP4SERV_API_KEY'];
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init?.auth !== false) {
    if (!key) throw new Error("Falta la clave de Tip4Serv.");
    headers['Authorization'] = `Bearer ${key}`;
  }
  if (init?.body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${TIP4SERV_API}${path}`, {
    method: init?.method ?? "GET",
    headers,
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      message = (JSON.parse(text) as { error?: string }).error ?? text;
    } catch {
      /* no JSON */
    }
    throw new Error(`Tip4Serv (${res.status}): ${message || "error desconocido"}`);
  }
  return JSON.parse(text) as T;
}

type T4Product = {
  id: number;
  name: string;
  slug: string;
  small_description?: string | null;
  description?: string | null;
  image?: string | null;
  price: number;
  old_price?: number | null;
  status?: boolean;
  category: { id: number; name: string; slug: string; hide?: boolean } | number;
};

type T4Category = {
  id: number;
  name: string;
  slug: string;
  hide?: boolean;
  parent?: number | { id: number; name: string; slug?: string } | null;
};

function mapProduct(p: T4Product, currency: string): TebexPackage {
  const old = p.old_price && p.old_price > p.price ? p.old_price : null;
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? p.small_description ?? null,
    image: p.image ?? null,
    base_price: old ?? p.price,
    total_price: p.price,
    discount: old ? old - p.price : 0,
    currency,
    ...(typeof p.category === "object"
      ? { category: { id: p.category.id, name: p.category.name } }
      : {}),
  };
}

async function fetchAllProducts() {
  const all: T4Product[] = [];
  let currency = "USD";
  for (let page = 1; page <= 10; page++) {
    const data = await tip4serv<{ products: T4Product[]; product_count: number; currency: string }>(
      `/store/products?only_enabled=true&details=true&max_page=50&page=${page}`,
    );
    currency = data.currency ?? currency;
    all.push(...(data.products ?? []));
    if ((data.products ?? []).length < 50) break;
  }
  return { products: all.map((p) => mapProduct(p, currency)), raw: all, currency };
}

const fallbackPackages: TebexPackage[] = [
  { id: 1, name: "Rango VIP", description: "Beneficios exclusivos para tu aventura.", image: null, base_price: 14.99, total_price: 9.99, discount: 5, currency: "USD", category: { id: 1, name: "Rangos" } },
  { id: 2, name: "Rango MVP", description: "Más ventajas, cosméticos y prioridad.", image: null, base_price: 24.99, total_price: 17.99, discount: 7, currency: "USD", category: { id: 1, name: "Rangos" } },
  { id: 3, name: "Caja Legendaria", description: "Una caja con recompensas aleatorias.", image: null, base_price: 8.99, total_price: 6.99, discount: 2, currency: "USD", category: { id: 2, name: "Cajas" } },
];

const fallbackCategories: TebexCategory[] = [
  { id: 1, name: "Rangos", slug: "rangos", description: null, parent: null, order: 0, packages: fallbackPackages.filter((pkg) => pkg.category?.id === 1) },
  { id: 2, name: "Cajas", slug: "cajas", description: null, parent: null, order: 1, packages: fallbackPackages.filter((pkg) => pkg.category?.id === 2) },
];

export const getStore = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const s = await tip4serv<{ id: number; title: string; description: string; currency: string; logo: string }>(
      "/store/whoami",
    );
    return { id: s.id, name: s.title, description: s.description ?? null, currency: s.currency, logo: s.logo ?? null, platform_type: "tip4serv" } satisfies TebexStore;
  } catch (error) {
    console.warn("Tip4Serv no está disponible; usando configuración local.", error);
    return { id: TIP4SERV_STORE_ID, name: "VortexMC Network", description: "Tienda oficial", currency: "USD", logo: null, platform_type: "tip4serv" } satisfies TebexStore;
  }
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [cats, { products, raw }] = await Promise.all([
      tip4serv<{ categories: T4Category[] }>("/store/categories"),
      fetchAllProducts(),
    ]);
    const list = (cats.categories ?? []).filter((c) => !c.hide && c.slug !== "home");
    const byId = new Map(list.map((c) => [c.id, c]));
    return list.map((c, index) => {
      const parentId = typeof c.parent === "number" ? c.parent : c.parent && typeof c.parent === "object" ? c.parent.id : null;
      const parent = parentId != null ? byId.get(parentId) : undefined;
      return { id: c.id, name: c.name.trim(), slug: c.slug, description: null, parent: parent ? { id: parent.id, name: parent.name.trim(), slug: parent.slug } : null, order: index, packages: products.filter((_, i) => {
        const cat = raw[i]?.category;
        return (cat && typeof cat === "object" ? cat.id : cat) === c.id;
      }) } satisfies TebexCategory;
    });
  } catch (error) {
    console.warn("Tip4Serv no está disponible; mostrando paquetes de demostración.", error);
    return fallbackCategories;
  }
});

export const getPackage = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => ({ id: Number(input.id) }))
  .handler(async ({ data }) => {
    const { products } = await fetchAllProducts();
    const found = products.find((p) => p.id === data.id);
    if (!found) throw new Error("Paquete no encontrado.");
    return found;
  });

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { origin: string; items: { id: number; quantity: number }[] }) => ({
      origin: String(input.origin),
      items: (input.items ?? []).map((i) => ({
        id: Number(i.id),
        quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
      })),
    }),
  )
  .handler(async ({ data }) => {
    if (data.items.length === 0) throw new Error("La cesta está vacía.");
    const res = await tip4serv<{ url: string }>(`/store/checkout?store=${TIP4SERV_STORE_ID}`, {
      method: "POST",
      auth: false,
      body: {
        products: data.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        redirect_success_checkout: `${data.origin}/`,
        redirect_canceled_checkout: `${data.origin}/`,
      },
    });
    return { url: res.url };
  });

export type RecentPayment = { username: string; amount: number; currency: string; date: number };

export const getRecentPayments = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await tip4serv<{
      payments: { username: string; amount: number; currency: string; date: number; status: string }[];
    }>("/store/payments?max_page=50");
    const ok = (data.payments ?? []).filter(
      (p) => p.username && (p.status === "Paid" || p.status === "Processed"),
    );
    const totals = new Map<string, number>();
    for (const p of ok) totals.set(p.username, (totals.get(p.username) ?? 0) + Number(p.amount));
    const top = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      recent: ok.slice(0, 18).map<RecentPayment>((p) => ({
        username: p.username,
        amount: Number(p.amount),
        currency: p.currency,
        date: p.date,
      })),
      topDonor: top ? { name: top[0], total: top[1] } : null,
    };
  } catch {
    return { recent: [] as RecentPayment[], topDonor: null };
  }
});
