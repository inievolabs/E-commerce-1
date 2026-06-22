import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

const searchSchema = z.object({
  orderId: z.string().min(1),
});

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: searchSchema,
  head: ({ search }) => ({
    meta: [
      { title: "Order confirmed — Velin Studio" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/order-confirmation" }],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { orderId } = Route.useSearch();

  return (
    <div className="mx-auto max-w-lg px-5 py-20 lg:py-28 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-foreground" />
      <p className="eyebrow mt-8">Order confirmed</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Thank you.</h1>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Your order <span className="font-mono text-foreground">{orderId}</span> has been placed.
        We will contact you to confirm delivery. Payment is due on delivery (COD).
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center bg-foreground text-background px-8 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
        >
          Continue shopping
        </Link>
        <Link
          to="/account"
          className="inline-flex items-center justify-center border border-foreground px-8 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          View account
        </Link>
      </div>
    </div>
  );
}
