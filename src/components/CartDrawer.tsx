import { Link } from "@tanstack/react-router";
import { X, Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import { formatPrice, useCart } from "@/lib/cart";
import { productImageUrl } from "@/lib/cloudinary-image";
import { useCatalogLookup } from "@/lib/use-catalog";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, subtotal, catalogLoading } = useCart();
  const { getProductById } = useCatalogLookup();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity duration-500 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:max-w-md bg-background shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <p className="eyebrow">Your bag ({items.length})</p>
          <button onClick={close} aria-label="Close" className="p-2 -mr-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {catalogLoading && items.length > 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Loading bag…
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-4">
              <p className="font-serif text-2xl">Your bag is empty</p>
              <p className="text-sm text-muted-foreground">Begin with our newest arrivals.</p>
              <Link
                to="/shop"
                onClick={close}
                className="mt-4 inline-flex items-center justify-center bg-foreground text-background px-6 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
              >
                Discover
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((it) => {
                const p = getProductById(it.productId);
                if (!p) return null;
                return (
                  <li key={it.productId} className="p-6 flex gap-4">
                    <Link to="/product/$id" params={{ id: p.id }} onClick={close} className="shrink-0">
                      <img
                        src={productImageUrl(p.images[0], "thumb")}
                        alt={p.name}
                        className="w-20 h-24 object-cover bg-muted"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3">
                        <Link to="/product/$id" params={{ id: p.id }} onClick={close} className="text-sm truncate">
                          {p.name}
                        </Link>
                        <p className="text-sm tabular-nums">{formatPrice(p.price * it.qty)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{it.color ?? p.color}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="inline-flex items-center border border-border">
                          <button onClick={() => setQty(p.id, it.qty - 1)} className="p-2" aria-label="Decrease">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-xs tabular-nums">{it.qty}</span>
                          <button onClick={() => setQty(p.id, it.qty + 1)} className="p-2" aria-label="Increase">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(p.id)}
                          className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={close}
              className="block text-center bg-foreground text-background px-6 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={close}
              className="block text-center border border-foreground px-6 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              View bag
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
