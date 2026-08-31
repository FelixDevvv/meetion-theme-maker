import { createServerFn } from "@tanstack/react-start";
import {
  TEBEX_API,
  TEBEX_PUBLIC_TOKEN,
  type TebexBasket,
  type TebexCategory,
  type TebexPackage,
  type TebexStore,
} from "./tebex";

async function tebex<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${TEBEX_API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      const parsed = JSON.parse(text) as { title?: string; detail?: string; message?: string };
      message = parsed.detail ?? parsed.message ?? parsed.title ?? text;
    } catch {
      /* respuesta no JSON */
    }
    throw new Error(`Tebex (${res.status}): ${message || "error desconocido"}`);
  }

  const parsed = JSON.parse(text) as { data?: T };
  return (parsed.data ?? (parsed as T)) as T;
}

export const getStore = createServerFn({ method: "GET" }).handler(async () => {
  return tebex<TebexStore>(`/accounts/${TEBEX_PUBLIC_TOKEN}`);
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  return tebex<TebexCategory[]>(
    `/accounts/${TEBEX_PUBLIC_TOKEN}/categories?includePackages=1`,
  );
});

export const getPackage = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => ({ id: Number(input.id) }))
  .handler(async ({ data }) => {
    return tebex<TebexPackage>(`/accounts/${TEBEX_PUBLIC_TOKEN}/packages/${data.id}`);
  });

export const createBasket = createServerFn({ method: "POST" })
  .inputValidator((input: { origin: string; username?: string | null }) => ({
    origin: String(input.origin),
    username: input.username ? String(input.username) : null,
  }))
  .handler(async ({ data }) => {
    return tebex<TebexBasket>(`/accounts/${TEBEX_PUBLIC_TOKEN}/baskets`, {
      method: "POST",
      body: {
        complete_url: `${data.origin}/compra-completada`,
        cancel_url: `${data.origin}/compra-cancelada`,
        complete_auto_redirect: true,
        ...(data.username ? { username: data.username } : {}),
      },
    });
  });

export const getBasket = createServerFn({ method: "GET" })
  .inputValidator((input: { ident: string }) => ({ ident: String(input.ident) }))
  .handler(async ({ data }) => {
    return tebex<TebexBasket>(`/accounts/${TEBEX_PUBLIC_TOKEN}/baskets/${data.ident}`);
  });

export const addPackageToBasket = createServerFn({ method: "POST" })
  .inputValidator((input: { ident: string; packageId: number; quantity?: number }) => ({
    ident: String(input.ident),
    packageId: Number(input.packageId),
    quantity: Math.max(1, Number(input.quantity ?? 1)),
  }))
  .handler(async ({ data }) => {
    return tebex<TebexBasket>(`/baskets/${data.ident}/packages`, {
      method: "POST",
      body: { package_id: data.packageId, quantity: data.quantity },
    });
  });

export const updateBasketQuantity = createServerFn({ method: "POST" })
  .inputValidator((input: { ident: string; packageId: number; quantity: number }) => ({
    ident: String(input.ident),
    packageId: Number(input.packageId),
    quantity: Math.max(0, Number(input.quantity)),
  }))
  .handler(async ({ data }) => {
    return tebex<TebexBasket>(
      `/baskets/${data.ident}/packages/${data.packageId}`,
      { method: "PUT", body: { quantity: data.quantity } },
    );
  });

export const removePackageFromBasket = createServerFn({ method: "POST" })
  .inputValidator((input: { ident: string; packageId: number }) => ({
    ident: String(input.ident),
    packageId: Number(input.packageId),
  }))
  .handler(async ({ data }) => {
    return tebex<TebexBasket>(`/baskets/${data.ident}/packages/remove`, {
      method: "POST",
      body: { package_id: data.packageId },
    });
  });

export const getBasketAuthLinks = createServerFn({ method: "GET" })
  .inputValidator((input: { ident: string; returnUrl: string }) => ({
    ident: String(input.ident),
    returnUrl: String(input.returnUrl),
  }))
  .handler(async ({ data }) => {
    return tebex<{ name: string; url: string }[]>(
      `/accounts/${TEBEX_PUBLIC_TOKEN}/baskets/${data.ident}/auth?returnUrl=${encodeURIComponent(data.returnUrl)}`,
    );
  });
