import { uploadImageToCloudinary } from "./cloudinary.server";
import { createSupabaseServerClient } from "./supabase-server";

export interface UploadMediaInput {
  file: string;
}

export interface UploadMediaSuccess {
  ok: true;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export interface UploadMediaFailure {
  ok: false;
  error: string;
}

export type UploadMediaResponse = UploadMediaSuccess | UploadMediaFailure;

async function requireAdmin(
  request: Request,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const supabase = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Authentication required.", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Admin access required.", status: 403 };
  }

  return { ok: true };
}

export async function handleMediaUpload(
  request: Request,
  body: unknown,
): Promise<{ response: UploadMediaResponse; status: number }> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return { response: { ok: false, error: auth.error }, status: auth.status };
  }

  const parsed = body as UploadMediaInput;
  if (!parsed?.file || typeof parsed.file !== "string") {
    return {
      response: { ok: false, error: "Missing image data." },
      status: 400,
    };
  }

  if (!parsed.file.startsWith("data:image/")) {
    return {
      response: { ok: false, error: "Invalid image format. Expected a cropped image." },
      status: 400,
    };
  }

  try {
    const result = await uploadImageToCloudinary(parsed.file);
    return {
      response: {
        ok: true,
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
      status: 200,
    };
  } catch (err) {
    console.error("[upload-media]", err);
    const message =
      err instanceof Error ? err.message : "Unable to upload image. Please try again.";
    return { response: { ok: false, error: message }, status: 500 };
  }
}
