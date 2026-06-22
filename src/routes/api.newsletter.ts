import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { subscribeNewsletter } from "@/lib/inbox.server";

export const Route = createFileRoute("/api/newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const result = await subscribeNewsletter(body);
          return Response.json(result, { status: result.ok ? 200 : 400 });
        } catch (err) {
          console.error("[api/newsletter]", err);
          return Response.json(
            { ok: false, error: "Unable to subscribe. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
