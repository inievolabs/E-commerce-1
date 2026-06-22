import type { OrderStatusLabel } from "@/lib/order-status";
import { ORDER_STATUS_FLOW, orderStatusBadgeClass, orderStatusStepIndex } from "@/lib/order-status";

export function OrderStatusBadge({ status }: { status: OrderStatusLabel }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-[10px] tracking-[0.22em] uppercase ${orderStatusBadgeClass(status)}`}
    >
      {status}
    </span>
  );
}

export function OrderStatusTimeline({ status }: { status: OrderStatusLabel }) {
  if (status === "Cancelled") {
    return (
      <p className="text-sm text-destructive border border-destructive/20 bg-destructive/5 px-4 py-3">
        This order was cancelled.
      </p>
    );
  }

  const current = orderStatusStepIndex(status);

  return (
    <ol className="space-y-0">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const upcoming = index > current;

        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                  done
                    ? "border-foreground bg-foreground text-background"
                    : active
                      ? "border-foreground bg-background text-foreground"
                      : "border-border bg-background text-muted-foreground"
                }`}
                aria-hidden
              >
                {done ? "✓" : index + 1}
              </span>
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <span
                  className={`my-1 w-px flex-1 min-h-6 ${done ? "bg-foreground" : "bg-border"}`}
                  aria-hidden
                />
              )}
            </div>
            <div className={`pb-6 ${upcoming ? "text-muted-foreground" : "text-foreground"}`}>
              <p className={`text-sm ${active ? "font-medium" : ""}`}>{step}</p>
              {active && (
                <p className="text-xs text-muted-foreground mt-0.5">Current status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
