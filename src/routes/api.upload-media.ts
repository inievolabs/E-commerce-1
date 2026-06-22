import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { handleMediaUpload } from "@/lib/upload-media.server";

export const Route = createFileRoute("/api/upload-media")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { response, status } = await handleMediaUpload(request, body);
          return Response.json(response, { status });
        } catch (err) {
          console.error("[api/upload-media]", err);
          return Response.json(
            { ok: false, error: "Unable to upload image. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});
