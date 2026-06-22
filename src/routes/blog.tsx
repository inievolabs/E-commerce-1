import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAdminStore } from "@/lib/admin-store";

type BlogSearch = {
  category?: string;
  tag?: string;
  q?: string;
};

export const Route = createFileRoute("/blog")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    tag: typeof search.tag === "string" ? search.tag : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Journal — Velin Studio" },
      { name: "description", content: "Notes, style, and craft from the Velin atelier." },
      { property: "og:title", content: "Journal — Velin Studio" },
      { property: "og:description", content: "Notes, style, and craft from the Velin atelier." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { posts, postCategories } = useAdminStore();
  const { category, tag, q } = Route.useSearch();

  const published = useMemo(
    () =>
      posts
        .filter((p) => p.published)
        .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [posts],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    published.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [published]);

  const filtered = useMemo(() => {
    return published.filter((p) => {
      if (category && p.categoryId !== category) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (q) {
        const needle = q.toLowerCase();
        if (
          !p.title.toLowerCase().includes(needle) &&
          !p.excerpt.toLowerCase().includes(needle) &&
          !p.tags.some((t) => t.toLowerCase().includes(needle))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [published, category, tag, q]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-16 pb-10">
        <p className="eyebrow">Velin Journal</p>
        <h1 className="font-serif text-4xl md:text-5xl mt-3">Notes from the atelier</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Stories, style guides, and craft notes from our studio.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 lg:px-8 pb-6 space-y-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="eyebrow mr-2">Category:</span>
          <Link
            to="/blog"
            search={(prev: BlogSearch) => ({ ...prev, category: undefined })}
            className={`text-xs uppercase tracking-wider px-3 py-1.5 border ${!category ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
          >
            All
          </Link>
          {postCategories.map((c) => (
            <Link
              key={c.id}
              to="/blog"
              search={(prev: BlogSearch) => ({ ...prev, category: c.id })}
              className={`text-xs uppercase tracking-wider px-3 py-1.5 border ${category === c.id ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="eyebrow mr-2">Tag:</span>
            {tag && (
              <Link
                to="/blog"
                search={(prev: BlogSearch) => ({ ...prev, tag: undefined })}
                className="text-[10px] uppercase tracking-wider px-2 py-1 border border-border hover:bg-secondary"
              >
                Clear ×
              </Link>
            )}
            {allTags.map((t) => (
              <Link
                key={t}
                to="/blog"
                search={(prev: BlogSearch) => ({ ...prev, tag: prev.tag === t ? undefined : t })}
                className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${tag === t ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const value = String(fd.get("q") ?? "").trim();
            const url = new URL(window.location.href);
            if (value) url.searchParams.set("q", value);
            else url.searchParams.delete("q");
            window.history.replaceState({}, "", url.toString());
            // trigger navigation via reload-free update; simpler: full reload
            window.location.href = url.toString();
          }}
          className="flex gap-2 max-w-md"
        >
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search posts..."
            className="flex-1 bg-transparent border-b border-foreground/30 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="text-xs tracking-[0.22em] uppercase px-3 border border-border"
          >
            Search
          </button>
        </form>

        <div className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 lg:px-8 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((p) => {
          const cat = postCategories.find((c) => c.id === p.categoryId);
          return (
            <article key={p.id} className="group">
              {p.cover && (
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={p.cover}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
              )}
              <div className="mt-4">
                {cat && (
                  <Link
                    to="/blog"
                    search={(prev: BlogSearch) => ({ ...prev, category: cat.id })}
                    className="eyebrow link-underline"
                  >
                    {cat.label}
                  </Link>
                )}
                <h2 className="font-serif text-2xl mt-2 leading-snug">{p.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {p.tags.map((t) => (
                    <Link
                      key={t}
                      to="/blog"
                      search={(prev: BlogSearch) => ({ ...prev, tag: t })}
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-secondary border border-border hover:bg-foreground hover:text-background"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(p.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {p.author}
                </p>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-16">
            No posts match these filters.{" "}
            <Link to="/blog" search={{}} className="link-underline">
              Clear filters
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
