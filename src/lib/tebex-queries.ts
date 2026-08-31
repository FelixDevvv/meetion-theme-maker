import { queryOptions } from "@tanstack/react-query";
import { getCategories, getPackage, getStore } from "./tebex.functions";

export const storeQuery = queryOptions({
  queryKey: ["tebex", "store"],
  queryFn: () => getStore(),
  staleTime: 5 * 60 * 1000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["tebex", "categories"],
  queryFn: () => getCategories(),
  staleTime: 60 * 1000,
});

export const packageQuery = (id: number) =>
  queryOptions({
    queryKey: ["tebex", "package", id],
    queryFn: () => getPackage({ data: { id } }),
    staleTime: 60 * 1000,
  });
