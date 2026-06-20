import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { useAuth, type Order } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { getProduct } from "@/data/products";
import { formatPrice } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — Velin Studio" },
      { name: "description", content: "Manage your Velin Studio orders, wishlist, addresses and account details." },
      { property: "og:title", content: "My account — Velin Studio" },
      { property: "og:url", content: "/account" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  component: AccountPage,
});

type Tab = "orders" | "wishlist" | "details" | "addresses";

const TABS: { id: Tab; label: string }[] = [
  { id: "orders", label: "My orders" },
  { id: "wishlist", label: "My wishlist" },
  { id: "details", label: "Account details" },
  { id: "addresses", label: "Saved addresses" },
];

function AccountPage() {
  const { user, isAuthenticated, orders, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-5 lg:px-10 py-16 lg:py-24">
      <header className="mb-12">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Bonjour, {user.name}.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
        <nav className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 border-b lg:border-b-0 lg:border-r border-border lg:pr-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap text-left text-xs tracking-[0.22em] uppercase py-3 px-1 lg:px-0 border-b-2 lg:border-b-0 lg:border-l-2 transition-colors ${
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="whitespace-nowrap text-left text-xs tracking-[0.22em] uppercase py-3 px-1 lg:px-0 text-muted-foreground hover:text-foreground mt-4"
          >
            Logout
          </button>
        </nav>

        <section className="min-w-0">
          {tab === "orders" && <OrdersTab orders={orders} />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "details" && <DetailsTab />}
          {tab === "addresses" && <AddressesTab />}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    Delivered: "bg-foreground/5 text-foreground",
    "In transit": "bg-accent/15 text-accent-foreground",
    Processing: "bg-muted text-foreground",
    Cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] tracking-[0.22em] uppercase ${map[status]}`}>
      {status}
    </span>
  );
}

function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 border border-border">
        <Package className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-4 font-serif text-2xl">No orders yet.</p>
        <Link to="/shop" className="mt-6 inline-block eyebrow link-underline">Discover the collection</Link>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border border-y border-border">
      {orders.map((o) => (
        <li key={o.id} className="py-6 grid grid-cols-[64px_1fr_auto] sm:grid-cols-[80px_1fr_auto] gap-5 items-center">
          <div className="aspect-square bg-muted overflow-hidden">
            <img src={o.items[0].image} alt={o.items[0].name} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">Order {o.id}</p>
              <StatusBadge status={o.status} />
            </div>
            <p className="mt-2 font-serif text-lg truncate">{o.items[0].name}{o.items.length > 1 ? ` + ${o.items.length - 1} more` : ""}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Placed {new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="tabular-nums">{formatPrice(o.total)}</p>
            <button
              onClick={() => alert(`Order ${o.id} — demo only.`)}
              className="mt-2 text-[10px] tracking-[0.22em] uppercase link-underline"
            >
              View details
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function WishlistTab() {
  const { ids } = useWishlist();
  const items = ids.map((id) => getProduct(id)).filter(Boolean);
  if (items.length === 0) {
    return (
      <div className="text-center py-20 border border-border">
        <p className="font-serif text-2xl">Your wishlist is empty.</p>
        <p className="mt-3 text-sm text-muted-foreground">Save pieces you love to return to later.</p>
        <Link to="/shop" className="mt-6 inline-block eyebrow link-underline">Browse the shop</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-12">
      {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function DetailsTab() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-md space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        updateUser({ name, email });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
    >
      <label className="block">
        <span className="block eyebrow mb-2">Full name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-foreground/30 py-3 focus:outline-none focus:border-foreground"
        />
      </label>
      <label className="block">
        <span className="block eyebrow mb-2">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border-b border-foreground/30 py-3 focus:outline-none focus:border-foreground"
        />
      </label>
      <button className="bg-foreground text-background px-8 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90">
        Save changes
      </button>
      {saved && <p className="text-xs text-muted-foreground">Saved.</p>}
    </form>
  );
}

function AddressesTab() {
  const { addresses, addAddress, removeAddress } = useAuth();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: "", line1: "", city: "", postalCode: "", country: "" });

  return (
    <div className="space-y-8">
      <ul className="grid sm:grid-cols-2 gap-5">
        {addresses.map((a) => (
          <li key={a.id} className="border border-border p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{a.label}</p>
              {a.isDefault && <span className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Default</span>}
            </div>
            <p className="mt-3 font-serif text-lg">{a.line1}</p>
            <p className="text-sm text-muted-foreground">{a.postalCode} {a.city}</p>
            <p className="text-sm text-muted-foreground">{a.country}</p>
            <button
              onClick={() => removeAddress(a.id)}
              className="mt-4 text-[10px] tracking-[0.22em] uppercase link-underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          className="border border-border p-6 max-w-lg space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            addAddress(draft);
            setDraft({ label: "", line1: "", city: "", postalCode: "", country: "" });
            setAdding(false);
          }}
        >
          {(["label", "line1", "city", "postalCode", "country"] as const).map((k) => (
            <label key={k} className="block">
              <span className="block eyebrow mb-2 capitalize">{k}</span>
              <input
                required
                value={draft[k]}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                className="w-full bg-transparent border-b border-foreground/30 py-2 focus:outline-none focus:border-foreground"
              />
            </label>
          ))}
          <div className="flex gap-2">
            <button className="bg-foreground text-background px-6 py-3 text-xs tracking-[0.22em] uppercase">Save</button>
            <button type="button" onClick={() => setAdding(false)} className="px-6 py-3 text-xs tracking-[0.22em] uppercase border border-border">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="border border-foreground px-8 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          Add address
        </button>
      )}
    </div>
  );
}
