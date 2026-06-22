import { describe, expect, it } from "vitest";
import { mergeCartItems, mergeWishlistIds } from "@/lib/user-sync";

describe("user-sync", () => {
  it("merges cart items by product id and sums quantities", () => {
    const merged = mergeCartItems(
      [{ productId: "a", qty: 1 }],
      [
        { productId: "a", qty: 2 },
        { productId: "b", qty: 1 },
      ],
    );
    expect(merged).toEqual([
      { productId: "a", qty: 3 },
      { productId: "b", qty: 1 },
    ]);
  });

  it("merges wishlist ids uniquely", () => {
    expect(mergeWishlistIds(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });
});
