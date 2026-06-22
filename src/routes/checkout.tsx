import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { formatPrice, useCart } from "@/lib/cart";
import { productImageUrl } from "@/lib/cloudinary-image";
import { useAuth } from "@/lib/auth";
import { useCatalogLookup } from "@/lib/use-catalog";
import type { PlaceOrderResponse } from "@/lib/place-order";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Velin Studio" },
      { name: "description", content: "Complete your Velin Studio order." },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { getProductById } = useCatalogLookup();
  const { user, addresses, addressesLoading, refreshOrders } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autofillDoneRef = useRef(false);
  const [form, setForm] = useState({
    email: user?.email ?? "",
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    address: "",
    apt: "",
    city: "",
    postal: "",
    country: "Bangladesh",
    phone: "",
  });

  useEffect(() => {
    if (autofillDoneRef.current || addressesLoading) return;
    if (!user) return;

    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

    setForm((prev) => ({
      ...prev,
      email: user.email ?? prev.email,
      firstName: user.name?.split(" ")[0] ?? prev.firstName,
      lastName: user.name?.split(" ").slice(1).join(" ") ?? prev.lastName,
      ...(defaultAddr
        ? {
            address: defaultAddr.line1,
            city: defaultAddr.city,
            postal: defaultAddr.postalCode,
            country: defaultAddr.country,
          }
        : {}),
    }));

    autofillDoneRef.current = true;
  }, [user, addresses, addressesLoading]);

  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    setSubmitting(true);
    setError(null);

    const customerName = `${form.firstName} ${form.lastName}`.trim();
    const shippingAddress = [form.address, form.apt, `${form.city} ${form.postal}`, form.country]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail: form.email,
          customerPhone: form.phone,
          shippingAddress,
          subtotal,
          shipping: shippingCost,
          total,
          userId: user?.id ?? null,
          items: items.map((it) => {
            const p = getProductById(it.productId);
            return {
              productId: it.productId,
              name: p?.name ?? it.productId,
              price: p?.price ?? 0,
              qty: it.qty,
              color: it.color,
              size: it.size,
            };
          }),
        }),
      });

      const result = (await res.json()) as PlaceOrderResponse;
      if (!result.ok) {
        setError(result.error);
        return;
      }

      clear();
      refreshOrders();
      navigate({ to: "/order-confirmation", search: { orderId: result.orderId } });
    } catch {
      setError("Unable to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-[1500px] px-5 lg:px-10 py-12 lg:py-20">
      <header className="mb-12">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Complete your order</h1>
      </header>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20">
        <form className="space-y-12" onSubmit={onSubmit}>
          <section>
            <h2 className="font-serif text-2xl mb-6">Contact</h2>
            <Field label="Email" type="email" placeholder="you@example.com" required value={form.email} onChange={setF("email")} />
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-6">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" required value={form.firstName} onChange={setF("firstName")} />
              <Field label="Last name" required value={form.lastName} onChange={setF("lastName")} />
              <Field label="Address" className="sm:col-span-2" required value={form.address} onChange={setF("address")} />
              <Field label="Apartment, suite (optional)" className="sm:col-span-2" value={form.apt} onChange={setF("apt")} />
              <Field label="City" required value={form.city} onChange={setF("city")} />
              <Field label="Postal code" required value={form.postal} onChange={setF("postal")} />
              <Field label="Country" className="sm:col-span-2" required value={form.country} onChange={setF("country")} />
              <Field label="Phone" type="tel" className="sm:col-span-2" required value={form.phone} onChange={setF("phone")} />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-6">Payment</h2>
            <div className="border border-foreground p-4">
              <p className="text-sm font-medium">Cash on delivery (COD)</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Pay when your order arrives. No card or online payment required.
              </p>
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full bg-foreground text-background py-5 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="lg:sticky lg:top-28 self-start bg-secondary p-8">
          <p className="eyebrow mb-6">Order summary</p>
          {items.length === 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">Your bag is empty.</p>
              <Link to="/shop" className="mt-4 inline-block eyebrow link-underline">Continue shopping</Link>
            </div>
          ) : (
            <>
              <ul className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {items.map((it) => {
                  const p = getProductById(it.productId);
                  if (!p) return null;
                  return (
                    <li key={it.productId} className="flex gap-3">
                      <div className="relative w-16 h-20 bg-muted overflow-hidden shrink-0">
                        <img
                          src={productImageUrl(p.images[0], "thumb")}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] h-4 w-4 grid place-items-center rounded-full">{it.qty}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{it.color ?? p.color}</p>
                      </div>
                      <p className="text-sm tabular-nums">{formatPrice(p.price * it.qty)}</p>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">Free</dd></div>
              </dl>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-base">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block eyebrow mb-2">{label}</span>
      <input
        {...props}
        className="w-full bg-transparent border-b border-foreground/30 py-3 text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}
