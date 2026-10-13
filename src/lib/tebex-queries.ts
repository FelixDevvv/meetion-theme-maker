import { queryOptions } from "@tanstack/react-query";
import { getCategories, getPackage, getRecentPayments, getStore } from "./tebex.functions";

export const storeQuery = queryOptions({
  queryKey: ["store", "info"],
  queryFn: () => getStore(),
  staleTime: 5 * 60 * 1000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["store", "categories"],
  queryFn: () => getCategories(),
  staleTime: 60 * 1000,
});

export const packageQuery = (id: number) =>
  queryOptions({
    queryKey: ["store", "package", id],
    queryFn: () => getPackage({ data: { id } }),
    staleTime: 60 * 1000,
  });

export const paymentsQuery = queryOptions({
  queryKey: ["store", "payments"],
  queryFn: () => getRecentPayments(),
  staleTime: 60 * 1000,
});
