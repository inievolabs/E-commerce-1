import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { OrderStatusBadge, OrderStatusTimeline } from "@/components/OrderStatus";
import { useAuth } from "@/lib/auth";
import { productImageUrl } from "@/lib/cloudinary-image";
import { formatPrice } from "@/lib/cart";
import { useCatalogLookup } from "@/lib/use-catalog";

export const Route = createFileRoute("/account/orders/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderId} — Velin Studio` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `/account/orders/${params.orderId}` }],
  }),
  component: AccountOrderDetailPage,
});

function AccountOrderDetailPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isReady, orders, ordersLoading } = useAuth();
  const { getProductById } = useCatalogLookup();

  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: `/account/orders/${orderId}` } });
    }
  }, [isReady, isAuthenticated, navigate, orderId]);

  if (!isReady || ordersLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center text-sm text-muted-foreground">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="font-serif text-2xl">Order not found</p>
        <p className="mt-3 text-sm text-muted-foreground">
          This order may belong to another account or no longer exists.
        </p>
        <Link to="/account" className="mt-8 inline-block eyebrow link-underline">
          Back to account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 lg:px-10 py-16 lg:py-24">
      <Link
        to="/account"
        className="inline-flex items-center gap-2 eyebrow text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <p className="eyebrow">Order</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-mono">{order.id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placed{" "}
          {new Date(order.date).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </header>

      <section className="mb-10 border border-border p-6">
        <h2 className="eyebrow mb-5">Delivery status</h2>
        <OrderStatusTimeline status={order.status} />
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Items</h2>
        <ul className="divide-y divide-border border-y border-border">
          {order.items.map((item, i) => {
            const cover = getProductById(item.productId)?.images[0];
            return (
              <li key={i} className="py-4 flex gap-4 items-center">
                <div className="w-16 h-20 shrink-0 bg-muted overflow-hidden">
                  <img
                    src={cover ? productImageUrl(cover, "thumb") : "/pwa/icon-192.png"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {item.productId ? (
                    <Link
                      to="/product/$id"
                      params={{ id: item.productId }}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium">{item.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Qty {item.qty}
                    {item.color ? ` · ${item.color}` : ""}
                    {item.size ? ` · Size ${item.size}` : ""}
                  </p>
                </div>
                <p className="text-sm tabular-nums shrink-0">{formatPrice(item.price * item.qty)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid sm:grid-cols-2 gap-8 mb-10">
        <section>
          <h2 className="eyebrow mb-3">Ship to</h2>
          <p className="text-sm whitespace-pre-line leading-relaxed">{order.shippingAddress}</p>
          {order.customerPhone && (
            <p className="text-sm text-muted-foreground mt-2">{order.customerPhone}</p>
          )}
        </section>
        <section>
          <h2 className="eyebrow mb-3">Payment</h2>
          <p className="text-sm capitalize">
            {order.paymentMethod === "cod" ? "Cash on delivery (COD)" : order.paymentMethod}
          </p>
        </section>
      </div>

      <dl className="border-t border-border pt-6 space-y-2 text-sm max-w-sm ml-auto">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">
            {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-base pt-2 border-t border-border font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
