import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminStore, type PostCategory } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/post-categories")({
  component: PostCategoriesPage,
});

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function PostCategoriesPage() {
  const { postCategories, posts, upsertPostCategory, deletePostCategory } = useAdminStore();
  const [editing, setEditing] = useState<PostCategory | null>(null);

  const counts = postCategories.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = posts.filter((p) => p.categoryId === c.id).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Posts</p>
          <h1 className="font-serif text-3xl mt-1">Post categories</h1>
        </div>
        <button
          onClick={() =>
            setEditing({ id: "", label: "", description: "" })
          }
          className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase"
        >
          New category
        </button>
      </div>

      <div className="border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Posts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {postCategories.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{c.label}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                <td className="px-4 py-3 text-right tabular-nums">{counts[c.id] ?? 0}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <button onClick={() => setEditing(c)} className="eyebrow link-underline">Edit</button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${c.label}"? Posts in this category will be unassigned visually.`)) {
                        deletePostCategory(c.id);
                      }
                    }}
                    className="eyebrow link-underline text-destructive"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {postCategories.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <Form
            initial={editing}
            isNew={!postCategories.some((c) => c.id === editing.id)}
            onCancel={() => setEditing(null)}
            onSave={(c) => {
              const final: PostCategory = { ...c, id: c.id || slug(c.label) };
              if (!final.id || !final.label) return;
              upsertPostCategory(final);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-background w-full max-w-lg border border-border" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Form({
  initial, isNew, onSave, onCancel,
}: {
  initial: PostCategory;
  isNew: boolean;
  onSave: (c: PostCategory) => void;
  onCancel: () => void;
}) {
  const [c, setC] = useState<PostCategory>(initial);
  return (
    <form
      className="p-6 space-y-4"
      onSubmit={(e) => { e.preventDefault(); onSave(c); }}
    >
      <h2 className="font-serif text-2xl">{isNew ? "New category" : "Edit category"}</h2>
      <label className="block">
        <span className="eyebrow block mb-2">Label</span>
        <input
          required
          value={c.label}
          onChange={(e) => setC({ ...c, label: e.target.value })}
          className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
        />
      </label>
      <label className="block">
        <span className="eyebrow block mb-2">Slug</span>
        <input
          value={c.id}
          disabled={!isNew}
          placeholder="auto-generated from label"
          onChange={(e) => setC({ ...c, id: slug(e.target.value) })}
          className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-foreground"
        />
      </label>
      <label className="block">
        <span className="eyebrow block mb-2">Description</span>
        <textarea
          rows={3}
          value={c.description ?? ""}
          onChange={(e) => setC({ ...c, description: e.target.value })}
          className="w-full bg-transparent border border-foreground/20 p-2 text-sm focus:outline-none focus:border-foreground"
        />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs tracking-[0.22em] uppercase border border-border">Cancel</button>
        <button type="submit" className="px-4 py-2 text-xs tracking-[0.22em] uppercase bg-foreground text-background">Save</button>
      </div>
    </form>
  );
}
