/**
 * Configuración de la tienda Tip4Serv.
 * La clave API privada vive en el secreto TIP4SERV_API_KEY (solo servidor).
 */
export const TIP4SERV_API = "https://api.tip4serv.com/v1";
export const TIP4SERV_STORE_ID = 10041;

/**
 * Datos que la Headless API de Tebex no expone.
 * EDITA ESTOS VALORES para tu servidor.
 */
export const STORE_CONFIG = {
  serverName: "VORTEXMC NETWORK",
  serverIp: "play.vortexnw.xyz",
  discordUrl: "https://discord.com/invites/QG364yJM4V/",
  playersOnline: 308,
  discordMembers: 1009,
  monthlyGoal: { current: 190, target: 1000, currency: "USD" },
  topDonor: { name: "CloudStrife75", note: "Es el jugador TOP este mes." },
  recentPayments: [
    "Notch",
    "jeb_",
    "Dinnerbone",
    "Grumm",
    "Technoblade",
    "Dream",
    "GeorgeNotFound",
    "Sapnap",
    "BadBoyHalo",
    "Skeppy",
    "Tommyinnit",
    "Wilbursoot",
    "Ranboo",
    "Tubbo",
    "Purpled",
    "Punz",
    "Awesamdude",
    "Foolish_Gamers",
  ],
  promoBanner: {
    text: "¡ASEGURA YA UN 30% DE DESCUENTO EN TU PRIMER PAQUETE VIP!",
    ctaLabel: "CONSEGUIR",
  },
} as const;

export type TebexPackage = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  base_price: number;
  total_price: number;
  discount: number;
  currency: string;
  disable_quantity?: boolean;
  category?: { id: number; name: string };
};

export type TebexCategory = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  image_url?: string | null;
  parent?: {
    id: number;
    name: string;
    slug?: string | null;
  } | null;
  order: number;
  packages: TebexPackage[];
};

export type TebexStore = {
  id: number;
  name: string;
  description: string | null;
  currency: string;
  logo: string | null;
  platform_type: string;
  disabled?: boolean;
};

export type TebexBasketPackage = {
  id: number;
  name: string;
  quantity: number;
  in_basket: { quantity: number; price: number };
  image?: string | null;
};

export type TebexBasket = {
  ident: string;
  complete: boolean;
  base_price: number;
  total_price: number;
  currency: string;
  packages: TebexBasketPackage[];
  links: { checkout: string; payment?: string | null };
};

export function categorySlug(category: { id: number; name: string; slug?: string | null }) {
  if (category.slug) return category.slug;
  return `${slugify(category.name)}-${category.id}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function avatarUrl(username: string) {
  return `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`;
}
