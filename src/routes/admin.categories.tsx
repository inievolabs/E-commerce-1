import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminStore, type CategoryDef, type Category } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  component: AdminCategories,
});

function AdminCategories() {
  const { categories, products, upsertCategory, deleteCategory } = useAdminStore();
  const [editing, setEditing] = useState<CategoryDef | null>(null);

  const countByCat = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">Categories</h1>
        </div>
        <button
          onClick={() => setEditing({ id: "" as Category, label: "", description: "" })}
          className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
        >
          + New category
        </button>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-background border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl">{c.label}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{c.id}</p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {countByCat[c.id] ?? 0} products
              </span>
            </div>
            {c.description && <p className="text-sm text-muted-foreground mt-3">{c.description}</p>}
            <div className="mt-4 flex gap-4">
              <button onClick={() => setEditing(c)} className="eyebrow link-underline">
                Edit
              </button>
              <button
                onClick={() => {
                  if ((countByCat[c.id] ?? 0) > 0) {
                    alert("Reassign products before deleting this category.");
                    return;
                  }
                  if (confirm(`Delete category "${c.label}"?`)) deleteCategory(c.id);
                }}
                className="eyebrow text-destructive link-underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <CategoryEditor
          initial={editing}
          existingIds={categories.map((c) => c.id)}
          onClose={() => setEditing(null)}
          onSave={(c) => {
            upsertCategory(c);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryEditor({
  initial,
  existingIds,
  onClose,
  onSave,
}: {
  initial: CategoryDef;
  existingIds: string[];
  onClose: () => void;
  onSave: (c: CategoryDef) => void;
}) {
  const [c, setC] = useState<CategoryDef>(initial);
  const isNew = !initial.id;
  return (
    <div
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full grid place-items-center p-4">
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => {
            e.preventDefault();
            if (!c.id || !c.label) return;
            if (isNew && existingIds.includes(c.id)) {
              alert("That category ID already exists.");
              return;
            }
            onSave(c);
          }}
          className="bg-background border border-border w-full max-w-md p-6"
        >
          <h2 className="font-serif text-2xl mb-6">{isNew ? "New category" : "Edit category"}</h2>
          <label className="block mb-4">
            <span className="eyebrow block mb-2">ID (slug)</span>
            <input
              value={c.id}
              onChange={(e) =>
                setC((s) => ({
                  ...s,
                  id: e.target.value.toLowerCase().replace(/\s+/g, "-") as Category,
                }))
              }
              disabled={!isNew}
              required
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground font-mono disabled:opacity-50"
            />
          </label>
          <label className="block mb-4">
            <span className="eyebrow block mb-2">Label</span>
            <input
              value={c.label}
              onChange={(e) => setC((s) => ({ ...s, label: e.target.value }))}
              required
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block mb-6">
            <span className="eyebrow block mb-2">Description</span>
            <textarea
              rows={3}
              value={c.description ?? ""}
              onChange={(e) => setC((s) => ({ ...s, description: e.target.value }))}
              className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-foreground px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground hover:text-background"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
