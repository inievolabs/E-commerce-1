import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { placeCodOrder } from "@/lib/place-order.server";

export const Route = createFileRoute("/api/orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const supabase = createSupabaseServerClient(request);
          const {
            data: { user },
          } = await supabase.auth.getUser();

          const result = await placeCodOrder(body, {
            userId: user?.id ?? null,
          });

          return Response.json(result, { status: result.ok ? 200 : 400 });
        } catch (err) {
          console.error("[api/orders]", err);
          return Response.json(
            { ok: false, error: "Unable to place order. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
