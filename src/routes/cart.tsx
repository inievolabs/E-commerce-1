import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { formatPrice, getProductById, useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Velin Studio" },
      { name: "description", content: "Review the pieces in your bag before checkout." },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-[1200px] px-5 lg:px-10 py-12 lg:py-20">
      <header className="mb-12">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Your bag</h1>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-24 border-y border-border">
          <p className="font-serif text-3xl">Your bag is empty.</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center bg-foreground text-background px-8 py-4 text-xs tracking-[0.22em] uppercase"
          >
            Discover the collection
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 lg:gap-20">
          <ul className="divide-y divide-border border-y border-border">
            {items.map((it) => {
              const p = getProductById(it.productId);
              if (!p) return null;
              return (
                <li key={it.productId} className="py-6 flex gap-5">
                  <Link to="/product/$id" params={{ id: p.id }} className="shrink-0">
                    <img src={p.images[0]} alt={p.name} className="w-24 h-32 object-cover bg-muted" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-4">
                      <Link to="/product/$id" params={{ id: p.id }} className="font-serif text-xl">
                        {p.name}
                      </Link>
                      <p className="text-sm tabular-nums">{formatPrice(p.price * it.qty)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {it.color ?? p.color} {it.size ? `· ${it.size}` : ""}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={() => setQty(p.id, it.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                        <span className="px-3 text-xs tabular-nums">{it.qty}</span>
                        <button onClick={() => setQty(p.id, it.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button
                        onClick={() => remove(p.id)}
                        className="inline-flex items-center gap-1 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="lg:sticky lg:top-28 self-start bg-secondary p-8">
            <p className="eyebrow">Order summary</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between text-muted-foreground"><dt>Shipping</dt><dd>Complimentary</dd></div>
              <div className="flex justify-between text-muted-foreground"><dt>Taxes</dt><dd>Calculated at checkout</dd></div>
            </dl>
            <div className="mt-6 pt-6 border-t border-border flex justify-between text-base">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-8 block text-center bg-foreground text-background py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
            >
              Proceed to checkout
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-xs tracking-widest uppercase link-underline">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
