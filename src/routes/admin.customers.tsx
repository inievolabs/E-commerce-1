import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAdminCustomers } from "@/lib/admin-customers";
import { ADMIN_QUERY_KEYS, type Customer } from "@/lib/admin-types";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/admin/customers")({
  ssr: false,
  component: AdminCustomers,
});

function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "registered" | "guest">("all");
  const [selected, setSelected] = useState<Customer | null>(null);

  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ADMIN_QUERY_KEYS.customers,
    queryFn: fetchAdminCustomers,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter === "registered" && c.type !== "registered") return false;
      if (filter === "guest" && c.type !== "guest") return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [customers, search, filter]);

  const totals = useMemo(() => {
    const registered = customers.filter((c) => c.type === "registered").length;
    const guests = customers.filter((c) => c.type === "guest").length;
    const withOrders = customers.filter((c) => c.orderCount > 0).length;
    return { registered, guests, withOrders, all: customers.length };
  }, [customers]);

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow">CRM</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-2">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totals.all} total · {totals.registered} registered · {totals.guests} guest checkout
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["all", `All (${totals.all})`],
            ["registered", `Registered (${totals.registered})`],
            ["guest", `Guest (${totals.guests})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
              filter === id
                ? "bg-foreground text-background border-foreground"
                : "border-border bg-background hover:bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="w-full sm:w-96 bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground py-12 text-center">Loading customers…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive py-12 text-center">
          {error instanceof Error ? error.message : "Failed to load customers."}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="bg-background border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Orders</th>
                <th className="px-4 py-3 font-medium text-right">Spent</th>
                <th className="px-4 py-3 font-medium">Last order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    {c.registeredAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Joined{" "}
                        {new Date(c.registeredAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{c.email}</p>
                    {c.phone && <p className="text-xs text-muted-foreground mt-0.5">{c.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={c.type} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.lastOrderAt
                      ? new Date(c.lastOrderAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(c)} className="eyebrow link-underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function TypeBadge({ type }: { type: Customer["type"] }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider ${
        type === "registered"
          ? "bg-foreground/5 text-foreground"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {type}
    </span>
  );
}

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border w-full max-w-2xl p-6 lg:p-8 my-8"
        >
          <header className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="eyebrow">Customer</p>
                <TypeBadge type={customer.type} />
              </div>
              <h2 className="font-serif text-2xl">{customer.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{customer.email}</p>
              {customer.phone && (
                <p className="text-sm text-muted-foreground mt-0.5">{customer.phone}</p>
              )}
            </div>
            <button type="button" onClick={onClose} className="eyebrow link-underline">
              Close
            </button>
          </header>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground mb-1">Orders</dt>
              <dd className="font-medium tabular-nums">{customer.orderCount}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground mb-1">Total spent</dt>
              <dd className="font-medium tabular-nums">{formatPrice(customer.totalSpent)}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground mb-1">Addresses</dt>
              <dd className="font-medium tabular-nums">{customer.addressCount}</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground mb-1">Member since</dt>
              <dd className="font-medium">
                {customer.registeredAt
                  ? new Date(customer.registeredAt).toLocaleDateString("en-GB")
                  : customer.lastOrderAt
                    ? `Guest · first order ${new Date(customer.lastOrderAt).toLocaleDateString("en-GB")}`
                    : "Guest"}
              </dd>
            </div>
          </dl>

          {customer.addresses.length > 0 && (
            <section className="mb-8">
              <h3 className="eyebrow mb-3">Saved addresses</h3>
              <ul className="space-y-3">
                {customer.addresses.map((a) => (
                  <li key={a.id} className="border border-border p-4 text-sm">
                    <p className="eyebrow text-muted-foreground">{a.label}</p>
                    <p className="mt-1">{a.line1}</p>
                    <p className="text-muted-foreground">
                      {a.postalCode} {a.city}, {a.country}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="eyebrow mb-3">Order history</h3>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {customer.orders.map((o) => (
                  <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-mono">{o.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.createdAt).toLocaleString()} · {o.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular-nums">{formatPrice(o.total)}</p>
                      <Link
                        to="/admin/orders"
                        className="text-[10px] tracking-[0.2em] uppercase link-underline"
                      >
                        In orders
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
