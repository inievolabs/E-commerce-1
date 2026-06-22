/** Max file size before client-side optimization (5 MB). */
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;

/** Longest edge after resize — keeps Cloudinary storage lean. */
export const IMAGE_MAX_DIMENSION = 1600;

/** JPEG quality for all product uploads (consistent look). */
export const IMAGE_JPEG_QUALITY = 0.88;

/** Concurrent Cloudinary uploads during a batch. */
export const IMAGE_UPLOAD_CONCURRENCY = 2;

export function formatMaxImageSizeMb(): number {
  return MAX_IMAGE_FILE_BYTES / (1024 * 1024);
}

export function assertImageFileSize(file: File): void {
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    throw new Error(
      `"${file.name}" is too large (max ${formatMaxImageSizeMb()} MB). Choose a smaller file or compress it first.`,
    );
  }
}

/** Read a local image file as a data URL. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

/** Downscale before upload to keep Cloudinary requests fast. */
export function resizeImageDataUrl(
  src: string,
  maxDim = IMAGE_MAX_DIMENSION,
  quality = IMAGE_JPEG_QUALITY,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Invalid image file."));
    img.src = src;
  });
}

export async function prepareImageFileForUpload(file: File): Promise<string> {
  assertImageFileSize(file);
  const dataUrl = await readFileAsDataUrl(file);
  return resizeImageDataUrl(dataUrl);
}

export async function normalizeImageDataUrl(dataUrl: string): Promise<string> {
  return resizeImageDataUrl(dataUrl);
}

/** Run async work with a fixed concurrency limit. */
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
