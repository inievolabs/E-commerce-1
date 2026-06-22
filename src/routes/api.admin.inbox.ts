import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { requireAdmin } from "@/lib/admin-customers.server";
import { fetchAdminInbox, updateContactSubmissionStatus } from "@/lib/inbox.server";
import type { ContactSubmissionStatus } from "@/lib/inbox";

export const Route = createFileRoute("/api/admin/inbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const auth = await requireAdmin(request);
          if (!auth.ok) {
            return Response.json({ ok: false, error: auth.error }, { status: auth.status });
          }

          const inbox = await fetchAdminInbox();
          return Response.json({ ok: true, ...inbox });
        } catch (err) {
          console.error("[api/admin/inbox GET]", err);
          return Response.json(
            { ok: false, error: "Unable to load inbox." },
            { status: 500 },
          );
        }
      },
      PATCH: async ({ request }) => {
        try {
          const auth = await requireAdmin(request);
          if (!auth.ok) {
            return Response.json({ ok: false, error: auth.error }, { status: auth.status });
          }

          const body = (await request.json()) as {
            contactId?: string;
            status?: ContactSubmissionStatus;
          };

          if (!body.contactId || !body.status) {
            return Response.json({ ok: false, error: "contactId and status are required." }, { status: 400 });
          }

          const result = await updateContactSubmissionStatus(body.contactId, body.status);
          return Response.json(result, { status: result.ok ? 200 : 400 });
        } catch (err) {
          console.error("[api/admin/inbox PATCH]", err);
          return Response.json(
            { ok: false, error: "Unable to update submission." },
            { status: 500 },
          );
        }
      },
    },
  },
});
