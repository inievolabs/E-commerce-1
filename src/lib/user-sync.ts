import type { CartItem } from "./cart";

export function mergeCartItems(local: CartItem[], remote: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...remote, ...local]) {
    const existing = map.get(item.productId);
    if (existing) {
      map.set(item.productId, {
        ...existing,
        qty: existing.qty + item.qty,
        color: item.color ?? existing.color,
        size: item.size ?? existing.size,
      });
    } else {
      map.set(item.productId, { ...item });
    }
  }
  return Array.from(map.values());
}

export function mergeWishlistIds(local: string[], remote: string[]): string[] {
  return [...new Set([...local, ...remote])];
}
