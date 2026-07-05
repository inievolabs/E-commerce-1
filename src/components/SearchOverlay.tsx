import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/lib/use-catalog";
import { productImageUrl } from "@/lib/cloudinary-image";
import { formatPrice } from "@/lib/cart";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const { data: products = [] } = useCatalog();

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.color.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [q, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="flex items-center justify-end px-5 h-16">
        <button onClick={onClose} aria-label="Close search" className="p-2">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-auto max-w-3xl px-6 pt-10 pb-24">
        <p className="eyebrow mb-6">Search</p>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full bg-transparent border-b border-foreground/40 py-4 text-2xl md:text-4xl font-serif placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground"
        />

        {q.trim() === "" ? (
          <>
            <p className="eyebrow mt-8">Popular</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Shoulder bag", "Weekender", "Cardholder", "Mule"].map((t) => (
                <button
                  key={t}
                  onClick={() => setQ(t)}
                  className="border border-border px-4 py-2 text-xs tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        ) : results.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="font-serif text-2xl">No pieces match "{q}".</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Try a different keyword, or browse the full collection.
            </p>
            <Link to="/shop" onClick={onClose} className="mt-8 inline-block eyebrow link-underline">
              View the shop
            </Link>
          </div>
        ) : (
          <div className="mt-10">
            <p className="eyebrow mb-4">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    onClick={onClose}
                    className="block group"
                  >
                    <div className="aspect-[3/4] bg-muted overflow-hidden">
                      <img
                        src={productImageUrl(p.images[0], "thumb")}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <p className="text-sm">{p.name}</p>
                      <p className="text-sm tabular-nums text-muted-foreground">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
