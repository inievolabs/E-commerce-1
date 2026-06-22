import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlist } from "@/lib/wishlist";
import { useCatalogLookup } from "@/lib/use-catalog";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Velin Studio" },
      { name: "description", content: "The pieces you've saved from the Velin Studio collection." },
      { property: "og:title", content: "Wishlist — Velin Studio" },
      { property: "og:url", content: "/wishlist" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids, clear } = useWishlist();
  const { getProductById, isLoading } = useCatalogLookup();
  const items = ids.map((id) => getProductById(id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-12 lg:py-20">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Saved</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Your wishlist</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {items.length === 0 ? "Nothing saved yet." : `${items.length} piece${items.length === 1 ? "" : "s"} saved.`}
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={clear} className="text-xs tracking-[0.22em] uppercase link-underline">
            Clear wishlist
          </button>
        )}
      </header>

      {isLoading && ids.length > 0 ? (
        <p className="text-sm text-muted-foreground">Loading saved pieces…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-24 border-y border-border">
          <p className="font-serif text-3xl">Begin curating your own edit.</p>
          <p className="mt-3 text-sm text-muted-foreground">Tap the heart on any piece to save it here.</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center bg-foreground text-background px-8 py-4 text-xs tracking-[0.22em] uppercase"
          >
            Discover the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12 lg:gap-x-8">
          {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
