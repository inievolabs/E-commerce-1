import { absoluteUrl } from "@/lib/site-url";

export type ImageDeliverySize = "thumb" | "card" | "gallery" | "full";

const WIDTH_BY_SIZE: Record<ImageDeliverySize, number> = {
  thumb: 200,
  card: 800,
  gallery: 1200,
  full: 1600,
};

const UPLOAD_SEGMENT = "/image/upload/";

function hasDeliveryTransform(segment: string): boolean {
  return segment.includes("f_auto") || segment.includes(",w_") || /^[a-z]_/.test(segment);
}

/** Insert Cloudinary delivery transforms (format + quality + optional width). */
export function optimizeImageUrl(url: string, size: ImageDeliverySize = "card"): string {
  if (!url) return url;

  if (!url.startsWith("http")) {
    return absoluteUrl(url);
  }

  if (!url.includes("res.cloudinary.com") || !url.includes(UPLOAD_SEGMENT)) {
    return url;
  }

  const uploadIdx = url.indexOf(UPLOAD_SEGMENT);
  const prefix = url.slice(0, uploadIdx + UPLOAD_SEGMENT.length);
  const rest = url.slice(uploadIdx + UPLOAD_SEGMENT.length);
  const firstSegment = rest.split("/")[0] ?? "";

  if (hasDeliveryTransform(firstSegment)) {
    return url;
  }

  const width = WIDTH_BY_SIZE[size];
  return `${prefix}f_auto,q_auto,w_${width}/${rest}`;
}

export function productImageUrl(url: string, size: ImageDeliverySize = "card"): string {
  return optimizeImageUrl(url, size);
}
