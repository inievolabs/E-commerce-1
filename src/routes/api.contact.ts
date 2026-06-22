import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { submitContactForm } from "@/lib/inbox.server";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const result = await submitContactForm(body);
          return Response.json(result, { status: result.ok ? 200 : 400 });
        } catch (err) {
          console.error("[api/contact]", err);
          return Response.json(
            { ok: false, error: "Unable to send your message. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
