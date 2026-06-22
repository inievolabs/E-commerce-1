import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/data/products";
import { fetchCatalogProducts } from "./catalog";
import { CATALOG_QUERY_KEY } from "./admin-types";

export function useCatalog() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalogProducts,
    staleTime: 60_000,
  });
}

/** Catalog lookup map for cart, wishlist, search, etc. */
export function useCatalogLookup() {
  const query = useCatalog();
  const map = useMemo(
    () => new Map((query.data ?? []).map((p) => [p.id, p] as const)),
    [query.data],
  );
  return {
    ...query,
    products: query.data ?? [],
    getProductById: (id: string): Product | undefined => map.get(id),
  };
}
