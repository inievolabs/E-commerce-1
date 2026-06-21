import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAdminStore, type Post } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/posts")({
  component: PostsPage,
});

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const blankPost = (): Post => ({
  id: "",
  title: "",
  excerpt: "",
  body: "",
  cover: "",
  categoryId: "",
  tags: [],
  author: "Velin Studio",
  published: true,
  publishedAt: new Date().toISOString(),
});

function PostsPage() {
  const { posts, postCategories, upsertPost, deletePost } = useAdminStore();
  const [editing, setEditing] = useState<Post | null>(null);
  const [filter, setFilter] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (catFilter !== "all" && p.categoryId !== catFilter) return false;
      if (filter) {
        const q = filter.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [posts, filter, catFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="font-serif text-3xl mt-1">Posts</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/blog" className="eyebrow link-underline">View blog →</Link>
          <button
            onClick={() => setEditing(blankPost())}
            className="bg-foreground text-background px-5 py-3 text-xs tracking-[0.22em] uppercase"
          >
            New post
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search title or tag..."
          className="bg-background border border-border px-3 py-2 text-sm w-64"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {postCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="border border-border bg-background overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const cat = postCategories.find((c) => c.id === p.categoryId);
              return (
                <tr key={p.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{p.id}</div>
                  </td>
                  <td className="px-4 py-3">{cat?.label ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-secondary border border-border">{t}</span>
                      ))}
                      {p.tags.length === 0 && <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${p.published ? "bg-foreground text-background" : "bg-secondary border border-border"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(p.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="eyebrow link-underline">Edit</button>
                    <button
                      onClick={() => { if (confirm(`Delete "${p.title}"?`)) deletePost(p.id); }}
                      className="eyebrow link-underline text-destructive"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No posts match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <PostEditor
          initial={editing}
          isNew={!posts.some((p) => p.id === editing.id)}
          onCancel={() => setEditing(null)}
          onSave={(p) => {
            const final: Post = { ...p, id: p.id || slug(p.title) };
            if (!final.id || !final.title || !final.categoryId) return;
            upsertPost(final);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function PostEditor({
  initial, isNew, onSave, onCancel,
}: {
  initial: Post;
  isNew: boolean;
  onSave: (p: Post) => void;
  onCancel: () => void;
}) {
  const { postCategories } = useAdminStore();
  const [p, setP] = useState<Post>(initial);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || p.tags.includes(t)) { setTagInput(""); return; }
    setP({ ...p, tags: [...p.tags, t] });
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 grid place-items-center p-4 overflow-y-auto" onClick={onCancel}>
      <form
        className="bg-background w-full max-w-3xl border border-border p-6 space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(p); }}
      >
        <h2 className="font-serif text-2xl">{isNew ? "New post" : "Edit post"}</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="eyebrow block mb-2">Title</span>
            <input
              required
              value={p.title}
              onChange={(e) => setP({ ...p, title: e.target.value })}
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Slug</span>
            <input
              value={p.id}
              disabled={!isNew}
              placeholder="auto-generated"
              onChange={(e) => setP({ ...p, id: slug(e.target.value) })}
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Category</span>
            <select
              required
              value={p.categoryId}
              onChange={(e) => setP({ ...p, categoryId: e.target.value })}
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            >
              <option value="">Choose…</option>
              {postCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Author</span>
            <input
              value={p.author}
              onChange={(e) => setP({ ...p, author: e.target.value })}
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block">
            <span className="eyebrow block mb-2">Published date</span>
            <input
              type="date"
              value={p.publishedAt.slice(0, 10)}
              onChange={(e) => setP({ ...p, publishedAt: new Date(e.target.value).toISOString() })}
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="eyebrow block mb-2">Cover image URL</span>
            <input
              value={p.cover ?? ""}
              onChange={(e) => setP({ ...p, cover: e.target.value })}
              className="w-full bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="eyebrow block mb-2">Excerpt</span>
            <textarea
              rows={2}
              value={p.excerpt}
              onChange={(e) => setP({ ...p, excerpt: e.target.value })}
              className="w-full bg-transparent border border-foreground/20 p-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="eyebrow block mb-2">Body</span>
            <textarea
              rows={6}
              value={p.body}
              onChange={(e) => setP({ ...p, body: e.target.value })}
              className="w-full bg-transparent border border-foreground/20 p-2 text-sm focus:outline-none focus:border-foreground"
            />
          </label>
        </div>

        <div>
          <span className="eyebrow block mb-2">Tags</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {p.tags.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setP({ ...p, tags: p.tags.filter((x) => x !== t) })}
                className="text-[10px] uppercase tracking-wider px-2 py-1 bg-secondary border border-border hover:bg-destructive hover:text-background"
                title="Remove tag"
              >
                {t} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
              }}
              placeholder="Add tag and press Enter"
              className="flex-1 bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
            />
            <button type="button" onClick={addTag} className="text-xs tracking-[0.22em] uppercase px-3 border border-border">Add</button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={p.published}
            onChange={(e) => setP({ ...p, published: e.target.checked })}
          />
          Published (visible on /blog)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-xs tracking-[0.22em] uppercase border border-border">Cancel</button>
          <button type="submit" className="px-4 py-2 text-xs tracking-[0.22em] uppercase bg-foreground text-background">Save</button>
        </div>
      </form>
    </div>
  );
}
