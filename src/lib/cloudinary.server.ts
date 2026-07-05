import { createHash } from "node:crypto";

const UPLOAD_FOLDER = "velinstudio/products";

function readEnv(name: string): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env?.[name]) {
    return import.meta.env[name] as string;
  }
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
  if (typeof globalThis !== "undefined" && (globalThis as any)[name]) {
    return (globalThis as any)[name];
  }
  return undefined;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = readEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readEnv("CLOUDINARY_API_KEY");
  const apiSecret = readEnv("CLOUDINARY_API_SECRET");
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig() !== null;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(sorted + apiSecret)
    .digest("hex");
}

/** Signed server-side upload — API secret never leaves the Worker. */
export async function uploadImageToCloudinary(
  file: string,
  options?: { folder?: string; publicId?: string },
): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const folder = options?.folder ?? UPLOAD_FOLDER;
  const timestamp = Math.round(Date.now() / 1000);

  const signPayload: Record<string, string | number> = {
    folder,
    timestamp,
  };
  if (options?.publicId) signPayload.public_id = options.publicId;

  const signature = signParams(signPayload, config.apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (options?.publicId) formData.append("public_id", options.publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[cloudinary] upload failed", res.status, body);
    throw new Error("Image upload failed. Check Cloudinary credentials and try again.");
  }

  const data = (await res.json()) as CloudinaryUploadResult;
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
  };
}
