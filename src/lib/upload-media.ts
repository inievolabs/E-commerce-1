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

/** Upload a cropped image (data URL) to Cloudinary via the server API. */
export async function uploadMediaImage(file: string): Promise<UploadMediaSuccess> {
  const res = await fetch("/api/upload-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ file }),
  });

  const data = (await res.json()) as UploadMediaResponse;
  if (!data.ok) {
    throw new Error(data.error || "Upload failed.");
  }
  return data;
}
