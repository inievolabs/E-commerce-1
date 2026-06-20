import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { formatPrice, getProductById, useCart } from "@/lib/cart";
import { useAdminStore } from "@/lib/admin-store";

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
  const { addOrder, adjustStock } = useAdminStore();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", address: "", apt: "",
    city: "", postal: "", country: "Bangladesh", phone: "",
  });

  const shippingCost = shipping === "express" ? 25 : 0;
  const total = subtotal + shippingCost;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const order = addOrder({
      customerName: `${form.firstName} ${form.lastName}`.trim() || "Guest",
      customerEmail: form.email,
      shippingAddress: [form.address, form.apt, `${form.city} ${form.postal}`, form.country]
        .filter(Boolean).join("\n"),
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
      subtotal,
      shipping: shippingCost,
      total,
    });
    items.forEach((it) => adjustStock(it.productId, -it.qty));
    clear();
    alert(`Order ${order.id} placed (demo).`);
    navigate({ to: "/" });
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
              <Field label="Phone" type="tel" className="sm:col-span-2" value={form.phone} onChange={setF("phone")} />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-6">Shipping method</h2>
            <div className="space-y-3">
              {[
                { id: "standard", label: "Complimentary express · 2–4 days", price: 0 },
                { id: "express", label: "Priority next-day", price: 25 },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-4 border cursor-pointer ${shipping === m.id ? "border-foreground" : "border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={shipping === m.id}
                      onChange={() => setShipping(m.id)}
                      className="accent-foreground"
                    />
                    <span className="text-sm">{m.label}</span>
                  </div>
                  <span className="text-sm tabular-nums">{m.price === 0 ? "Free" : formatPrice(m.price)}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl mb-6">Payment</h2>
            <div className="space-y-3 mb-6">
              {[
                { id: "card", label: "Credit card" },
                { id: "paypal", label: "PayPal" },
                { id: "applepay", label: "Apple Pay" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-4 border cursor-pointer ${payment === m.id ? "border-foreground" : "border-border"}`}
                >
                  <input
                    type="radio"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="accent-foreground"
                  />
                  <span className="text-sm">{m.label}</span>
                </label>
              ))}
            </div>
            {payment === "card" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Card number" className="sm:col-span-2" placeholder="0000 0000 0000 0000" />
                <Field label="Expiry" placeholder="MM / YY" />
                <Field label="CVC" placeholder="000" />
              </div>
            )}
          </section>

          <button
            type="submit"
            className="w-full bg-foreground text-background py-5 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
          >
            Place order · {formatPrice(total)}
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
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
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
                <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</dd></div>
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
