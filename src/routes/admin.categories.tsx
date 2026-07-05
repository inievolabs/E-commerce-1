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
          <h1 className="font-serif text-3xl md:text-4xl mt-1.5">Categories</h1>
        </div>
        <button
          onClick={() => setEditing({ id: "" as Category, label: "", description: "" })}
          className="bg-foreground text-background px-5 py-3 text-[10px] tracking-[0.22em] uppercase font-semibold hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
        >
          + New category
        </button>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-background border border-border p-6 transition-all duration-350 hover:shadow-md hover:-translate-y-0.5 group relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-serif text-2xl text-foreground group-hover:text-[#c9a96e] transition-colors truncate">{c.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-1.5 tracking-wider uppercase">{c.id}</p>
              </div>
              <span className="text-[9px] font-sans font-semibold px-2 py-0.5 uppercase tracking-wider bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20 rounded-sm shrink-0">
                {countByCat[c.id] ?? 0} items
              </span>
            </div>
            {c.description && <p className="text-xs text-muted-foreground mt-4 line-clamp-2 leading-relaxed">{c.description}</p>}
            <div className="mt-6 flex gap-4 border-t border-black/5 pt-4">
              <button onClick={() => setEditing(c)} className="eyebrow link-underline mr-1 cursor-pointer font-semibold text-foreground/75 hover:text-foreground">
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
                className="eyebrow text-destructive link-underline cursor-pointer font-semibold"
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
      <div className="min-h-full flex items-start justify-center p-0 sm:p-4">
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
          className="bg-[#f5f2ed] w-full min-h-screen sm:min-h-0 sm:max-w-md p-6 sm:my-8 border border-[#0d0c0b]/10 shadow-2xl relative"
        >
          <h2 className="font-serif text-2xl mb-6 font-medium text-foreground">{isNew ? "New Category" : "Edit Category"}</h2>
          
          <div className="space-y-4 mb-6">
            <label className="block">
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
                className="w-full bg-background border border-border px-3.5 py-2.5 text-xs focus:outline-none focus:border-foreground font-mono disabled:opacity-50 transition-colors uppercase tracking-wider"
              />
            </label>
            
            <label className="block">
              <span className="eyebrow block mb-2">Label</span>
              <input
                value={c.label}
                onChange={(e) => setC((s) => ({ ...s, label: e.target.value }))}
                required
                className="w-full bg-background border border-border px-3.5 py-2.5 text-xs focus:outline-none focus:border-foreground transition-colors"
              />
            </label>
            
            <label className="block">
              <span className="eyebrow block mb-2">Description</span>
              <textarea
                rows={4}
                value={c.description ?? ""}
                onChange={(e) => setC((s) => ({ ...s, description: e.target.value }))}
                className="w-full bg-background border border-border p-3.5 text-xs focus:outline-none focus:border-foreground transition-colors resize-none leading-relaxed"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-black/5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#0d0c0b]/15 bg-background px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase font-semibold hover:bg-[#0d0c0b] hover:text-white transition-all cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-foreground text-background px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase font-semibold hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
