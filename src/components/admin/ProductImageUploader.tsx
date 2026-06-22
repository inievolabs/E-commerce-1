import { useCallback, useRef, useState } from "react";
import { productImageUrl } from "@/lib/cloudinary-image";
import {
  formatMaxImageSizeMb,
  IMAGE_MAX_DIMENSION,
  IMAGE_UPLOAD_CONCURRENCY,
  prepareImageFileForUpload,
  runWithConcurrency,
} from "@/lib/image-upload";
import { uploadMediaImage } from "@/lib/upload-media";

const MAX_IMAGES = 5;

interface ProductImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  maxImages?: number;
}

export function ProductImageUploader({
  value,
  onChange,
  onUploadingChange,
  maxImages = MAX_IMAGES,
}: ProductImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setBusy = useCallback(
    (busy: boolean) => {
      setUploading(busy);
      onUploadingChange?.(busy);
    },
    [onUploadingChange],
  );

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const room = maxImages - value.length;
    if (room <= 0) {
      setError(`Maximum ${maxImages} images per product.`);
      return;
    }

    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;

    const batch = images.slice(0, room);
    setError(null);
    setBusy(true);

    const uploaded: string[] = [];
    try {
      setUploadProgress(`Optimizing ${batch.length} image${batch.length === 1 ? "" : "s"}…`);
      const dataUrls = await Promise.all(batch.map((file) => prepareImageFileForUpload(file)));

      let completed = 0;
      const results = await runWithConcurrency(
        dataUrls,
        IMAGE_UPLOAD_CONCURRENCY,
        async (dataUrl) => {
          const result = await uploadMediaImage(dataUrl);
          completed += 1;
          setUploadProgress(`Uploading ${completed} of ${batch.length}…`);
          return result;
        },
      );

      uploaded.push(...results.map((r) => r.secure_url));
      onChange([...value, ...uploaded]);
    } catch (err) {
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploadProgress(null);
      setBusy(false);
    }
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className="sm:col-span-2">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="eyebrow">Product images</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value.length}/{maxImages}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Add up to {maxImages} photos (max {formatMaxImageSizeMb()} MB each). Images are resized to{" "}
        {IMAGE_MAX_DIMENSION}px, optimized, then stored on Cloudinary.
      </p>

      {value.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          {value.map((src, i) => (
            <li
              key={`${src}-${i}`}
              draggable={!uploading}
              onDragStart={(e) => {
                setDragIdx(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIdx(i);
              }}
              onDragLeave={() => setOverIdx((cur) => (cur === i ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx !== null) move(dragIdx, i);
                setDragIdx(null);
                setOverIdx(null);
              }}
              onDragEnd={() => {
                setDragIdx(null);
                setOverIdx(null);
              }}
              className={`relative border bg-muted aspect-[3/4] transition-all ${
                !uploading ? "cursor-grab active:cursor-grabbing" : ""
              } ${
                overIdx === i && dragIdx !== i
                  ? "border-foreground ring-2 ring-foreground/30"
                  : "border-border"
              } ${dragIdx === i ? "opacity-40" : ""}`}
            >
              <img
                src={productImageUrl(src, "thumb")}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
              />
              <span className="absolute top-1 left-1 bg-background/90 text-foreground text-[10px] tracking-[0.18em] uppercase px-1.5 py-0.5">
                {i + 1}
              </span>
              {i === 0 && (
                <span className="absolute top-1 right-1 bg-foreground text-background text-[10px] tracking-[0.18em] uppercase px-1.5 py-0.5">
                  Cover
                </span>
              )}
              <div className="absolute bottom-1 inset-x-1 flex justify-center gap-1">
                <button
                  type="button"
                  disabled={uploading || i === 0}
                  onClick={() => move(i, i - 1)}
                  className="bg-background/90 hover:bg-background border border-border w-7 h-7 text-xs disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  ‹
                </button>
                <button
                  type="button"
                  disabled={uploading || i === value.length - 1}
                  onClick={() => move(i, i + 1)}
                  className="bg-background/90 hover:bg-background border border-border w-7 h-7 text-xs disabled:opacity-30"
                  aria-label="Move later"
                >
                  ›
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => removeAt(i)}
                  className="bg-background/90 hover:bg-destructive hover:text-destructive-foreground border border-border w-7 h-7 text-xs"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canAddMore && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) void uploadFiles(files);
              e.target.value = "";
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) e.currentTarget.classList.add("border-foreground");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("border-foreground");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-foreground");
              if (!uploading && e.dataTransfer.files.length) {
                void uploadFiles(e.dataTransfer.files);
              }
            }}
            className="border border-dashed border-border bg-secondary/30 px-4 py-8 text-center transition-colors"
          >
            {uploading ? (
              <p className="text-sm text-muted-foreground">{uploadProgress ?? "Uploading…"}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Drag &amp; drop images here, or choose files from your device.
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="border border-foreground px-4 py-2.5 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background"
                >
                  + Add images
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  {maxImages - value.length} slot{maxImages - value.length === 1 ? "" : "s"}{" "}
                  remaining
                </p>
              </>
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
