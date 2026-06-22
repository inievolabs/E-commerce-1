import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { fetchAdminCustomers, requireAdmin } from "@/lib/admin-customers.server";

export const Route = createFileRoute("/api/admin/customers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const auth = await requireAdmin(request);
          if (!auth.ok) {
            return Response.json({ ok: false, error: auth.error }, { status: auth.status });
          }

          const customers = await fetchAdminCustomers();
          return Response.json({ ok: true, customers });
        } catch (err) {
          console.error("[api/admin/customers]", err);
          return Response.json(
            { ok: false, error: "Unable to load customers. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
