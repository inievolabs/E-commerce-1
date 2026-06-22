import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useAdminStore, type MediaItem } from "@/lib/admin-store";
import { productImageUrl } from "@/lib/cloudinary-image";
import {
  assertImageFileSize,
  formatMaxImageSizeMb,
  normalizeImageDataUrl,
} from "@/lib/image-upload";
import { uploadMediaImage } from "@/lib/upload-media";

export const Route = createFileRoute("/admin/media")({
  ssr: false,
  component: AdminMedia,
});

const ASPECTS: { label: string; value: number }[] = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
];

interface PendingFile {
  name: string;
  src: string;
}

function AdminMedia() {
  const {
    media,
    products,
    addMedia,
    deleteMedia,
    renameMedia,
    setMediaProducts,
    setProductImages,
  } = useAdminStore();
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [tab, setTab] = useState<"library" | "galleries">("library");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      assertImageFileSize(file);
    } catch (err) {
      alert(err instanceof Error ? err.message : "File is too large.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPending({ name: file.name, src: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const usageByMedia = useMemo(() => {
    const map = new Map<string, string[]>();
    media.forEach((m) => map.set(m.id, m.productIds));
    return map;
  }, [media]);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">Library</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">Media</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {media.length} {media.length === 1 ? "asset" : "assets"} · Upload, crop, and link to
            products
          </p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
          >
            + Upload image
          </button>
        </div>
      </header>

      <div className="flex gap-1 mb-6 border-b border-border">
        {(["library", "galleries"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs tracking-[0.22em] uppercase border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "library" ? "Library" : "Product galleries"}
          </button>
        ))}
      </div>

      {tab === "library" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="mb-6 border border-dashed border-border bg-background px-6 py-8 text-center text-sm text-muted-foreground"
        >
          Drag &amp; drop an image here (max {formatMaxImageSizeMb()} MB), or use Upload to add to
          your library.
        </div>
      )}

      {tab === "galleries" && <GalleriesPanel products={products} onReorder={setProductImages} />}

      {tab === "library" &&
        (media.length === 0 ? (
          <div className="bg-background border border-border p-12 text-center text-sm text-muted-foreground">
            No media yet. Upload your first image to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((m) => {
              const linked = usageByMedia.get(m.id) ?? [];
              return (
                <div key={m.id} className="bg-background border border-border group">
                  <button
                    onClick={() => setEditing(m)}
                    className="block w-full aspect-square bg-muted overflow-hidden"
                  >
                    <img
                      src={productImageUrl(m.url, "card")}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="p-3">
                    <p className="text-sm truncate font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.width}×{m.height} · {linked.length} linked
                    </p>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => setEditing(m)} className="eyebrow link-underline">
                        Manage
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Delete this image? It will be removed from any linked products.",
                            )
                          ) {
                            deleteMedia(m.id);
                          }
                        }}
                        className="eyebrow text-destructive link-underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {pending && (
        <CropDialog
          file={pending}
          products={products}
          onClose={() => setPending(null)}
          onSave={async ({ dataUrl, width, height, name, productIds }) => {
            const uploaded = await uploadMediaImage(dataUrl);
            addMedia({
              url: uploaded.secure_url,
              width: uploaded.width ?? width,
              height: uploaded.height ?? height,
              name,
              productIds,
            });
            setPending(null);
          }}
        />
      )}

      {editing && (
        <ManageDialog
          item={editing}
          products={products}
          onClose={() => setEditing(null)}
          onRename={(name) => renameMedia(editing.id, name)}
          onSaveLinks={(ids) => {
            setMediaProducts(editing.id, ids);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* ─── Crop dialog ─── */

function CropDialog({
  file,
  products,
  onClose,
  onSave,
}: {
  file: PendingFile;
  products: { id: string; name: string }[];
  onClose: () => void;
  onSave: (out: {
    dataUrl: string;
    width: number;
    height: number;
    name: string;
    productIds: string[];
  }) => Promise<void>;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number>(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [name, setName] = useState(file.name);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => setPixels(areaPixels), []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const out = await renderCrop(file.src, pixels);
      const dataUrl = await normalizeImageDataUrl(out.dataUrl);
      await onSave({ ...out, dataUrl, name, productIds: selected });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border w-full max-w-4xl p-6 lg:p-8"
        >
          <header className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Crop &amp; upload</h2>
            <button onClick={onClose} className="eyebrow link-underline">
              Close
            </button>
          </header>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div>
              <div className="relative w-full aspect-square bg-muted overflow-hidden">
                <Cropper
                  image={file.src}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect === 0 ? undefined : aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  restrictPosition={false}
                />
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => setAspect(a.value)}
                      className={`px-3 py-1.5 text-xs tracking-[0.18em] uppercase border ${
                        aspect === a.value
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 text-xs">
                  <span className="eyebrow w-16">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block">
                <span className="eyebrow block mb-2">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </label>

              <div className="mt-5">
                <p className="eyebrow mb-2">Link to products</p>
                <div className="max-h-72 overflow-y-auto border border-border divide-y divide-border">
                  {products.length === 0 && (
                    <p className="p-3 text-xs text-muted-foreground">No products available.</p>
                  )}
                  {products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Linked products will have this image appended to their gallery.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 mt-8">
            {error && <p className="w-full text-sm text-destructive text-right">{error}</p>}
            <button
              onClick={onClose}
              disabled={saving}
              className="border border-foreground px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-50"
            >
              {saving ? "Uploading…" : "Save to library"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Manage / link dialog ─── */

function ManageDialog({
  item,
  products,
  onClose,
  onRename,
  onSaveLinks,
}: {
  item: MediaItem;
  products: { id: string; name: string }[];
  onClose: () => void;
  onRename: (name: string) => void;
  onSaveLinks: (ids: string[]) => void;
}) {
  const [name, setName] = useState(item.name);
  const [selected, setSelected] = useState<string[]>(item.productIds);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border w-full max-w-3xl p-6 lg:p-8"
        >
          <header className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Manage media</h2>
            <button onClick={onClose} className="eyebrow link-underline">
              Close
            </button>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted aspect-square overflow-hidden">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <label className="block">
                <span className="eyebrow block mb-2">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => name !== item.name && onRename(name)}
                  className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                {item.width}×{item.height} · added {new Date(item.createdAt).toLocaleDateString()}
              </p>

              <div className="mt-5">
                <p className="eyebrow mb-2">Linked products</p>
                <div className="max-h-72 overflow-y-auto border border-border divide-y divide-border">
                  {products.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggle(p.id)}
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="border border-foreground px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaveLinks(selected)}
              className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
            >
              Save links
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Galleries: drag-to-reorder per product ─── */

function GalleriesPanel({
  products,
  onReorder,
}: {
  products: { id: string; name: string; images: string[] }[];
  onReorder: (id: string, images: string[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(products[0]?.id ?? null);
  const withImages = products.filter((p) => p.images.length > 0);

  if (withImages.length === 0) {
    return (
      <div className="bg-background border border-border p-12 text-center text-sm text-muted-foreground">
        No product galleries yet. Add images to products from the Library tab or Products page.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border divide-y divide-border">
      {withImages.map((p) => {
        const open = openId === p.id;
        return (
          <div key={p.id}>
            <button
              onClick={() => setOpenId(open ? null : p.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={productImageUrl(p.images[0], "thumb")}
                  alt=""
                  className="w-10 h-12 object-cover bg-muted"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.images.length} images</p>
                </div>
              </div>
              <span className="eyebrow text-muted-foreground">{open ? "Hide" : "Reorder"}</span>
            </button>
            {open && (
              <div className="px-4 pb-4">
                <GalleryReorder images={p.images} onChange={(next) => onReorder(p.id, next)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GalleryReorder({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= images.length) return;
    const next = images.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <>
      <p className="text-xs text-muted-foreground mb-3">
        Drag tiles to reorder. The first image is used as the product's primary thumbnail.
      </p>
      <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((src, i) => (
          <li
            key={`${src}-${i}`}
            draggable
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
            className={`relative border bg-muted aspect-[3/4] cursor-grab active:cursor-grabbing transition-all ${
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
            <div className="absolute bottom-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                className="bg-background/90 hover:bg-background border border-border w-6 h-6 text-xs disabled:opacity-30"
                aria-label="Move left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === images.length - 1}
                className="bg-background/90 hover:bg-background border border-border w-6 h-6 text-xs disabled:opacity-30"
                aria-label="Move right"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="bg-background/90 hover:bg-destructive hover:text-destructive-foreground border border-border w-6 h-6 text-xs"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ─── helpers ─── */

function renderCrop(
  src: string,
  pixels: Area | null,
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const area = pixels ?? { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight };
      const w = Math.max(1, Math.round(area.width));
      const h = Math.max(1, Math.round(area.height));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      resolve({ dataUrl, width: w, height: h });
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
