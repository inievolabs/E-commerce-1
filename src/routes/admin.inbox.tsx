import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ContactSubmission, NewsletterSubscriber } from "@/lib/inbox";

export const Route = createFileRoute("/admin/inbox")({
  ssr: false,
  component: AdminInbox,
});

const INBOX_QUERY_KEY = ["admin", "inbox"] as const;

async function fetchInbox(): Promise<{
  contacts: ContactSubmission[];
  newsletters: NewsletterSubscriber[];
}> {
  const res = await fetch("/api/admin/inbox");
  const data = (await res.json()) as {
    ok: boolean;
    error?: string;
    contacts?: ContactSubmission[];
    newsletters?: NewsletterSubscriber[];
  };
  if (!data.ok) throw new Error(data.error ?? "Unable to load inbox.");
  return { contacts: data.contacts ?? [], newsletters: data.newsletters ?? [] };
}

function AdminInbox() {
  const [tab, setTab] = useState<"contact" | "newsletter">("contact");
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: INBOX_QUERY_KEY,
    queryFn: fetchInbox,
    staleTime: 30_000,
  });

  const contacts = data?.contacts ?? [];
  const newsletters = data?.newsletters ?? [];

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.subject?.toLowerCase().includes(q) ?? false) ||
        c.message.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const filteredNewsletters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return newsletters;
    return newsletters.filter(
      (n) => n.email.toLowerCase().includes(q) || (n.source?.toLowerCase().includes(q) ?? false),
    );
  }, [newsletters, search]);

  const newContactCount = contacts.filter((c) => c.status === "new").length;

  const statusMutation = useMutation({
    mutationFn: async ({
      contactId,
      status,
    }: {
      contactId: string;
      status: ContactSubmission["status"];
    }) => {
      const res = await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, status }),
      });
      const result = (await res.json()) as { ok: boolean; error?: string };
      if (!result.ok) throw new Error(result.error ?? "Update failed.");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INBOX_QUERY_KEY });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow">Inbox</p>
        <h1 className="font-serif text-3xl md:text-4xl mt-2">Newsletter &amp; Contact forms</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {contacts.length} contact message{contacts.length === 1 ? "" : "s"} · {newsletters.length}{" "}
          newsletter subscriber{newsletters.length === 1 ? "" : "s"}
          {newContactCount > 0 && (
            <span className="ml-2 text-foreground">· {newContactCount} new</span>
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setTab("contact");
            setSelectedContact(null);
          }}
          className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
            tab === "contact"
              ? "bg-foreground text-background border-foreground"
              : "border-border bg-background hover:bg-secondary"
          }`}
        >
          Contact ({contacts.length})
          {newContactCount > 0 && tab !== "contact" && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground text-background px-1 text-[10px]">
              {newContactCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setTab("newsletter");
            setSelectedContact(null);
          }}
          className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
            tab === "newsletter"
              ? "bg-foreground text-background border-foreground"
              : "border-border bg-background hover:bg-secondary"
          }`}
        >
          Newsletter ({newsletters.length})
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "contact" ? "Search messages…" : "Search subscribers…"}
          className="w-full max-w-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading inbox…</p>}
      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load."}
        </p>
      )}

      {!isLoading && !isError && tab === "contact" && (
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="border border-border bg-background divide-y divide-border max-h-[70vh] overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No contact messages yet.</p>
            ) : (
              filteredContacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedContact(c)}
                  className={`w-full text-left p-4 hover:bg-secondary transition-colors ${
                    selectedContact?.id === c.id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      {c.subject && <p className="text-xs mt-1 truncate">{c.subject}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={c.status} />
                      <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                        {formatDate(c.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border border-border bg-background p-6 min-h-[280px]">
            {!selectedContact ? (
              <p className="text-sm text-muted-foreground">Select a message to read.</p>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-serif text-xl">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-sm text-muted-foreground link-underline"
                    >
                      {selectedContact.email}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(selectedContact.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={selectedContact.status} />
                </div>
                {selectedContact.subject && (
                  <p className="text-sm font-medium mb-3">Subject: {selectedContact.subject}</p>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedContact.status !== "read" && (
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate(
                          { contactId: selectedContact.id, status: "read" },
                          {
                            onSuccess: () =>
                              setSelectedContact((c) => (c ? { ...c, status: "read" } : c)),
                          },
                        )
                      }
                      className="px-3 py-1.5 text-xs uppercase tracking-wider border border-border hover:bg-secondary"
                    >
                      Mark read
                    </button>
                  )}
                  {selectedContact.status !== "archived" && (
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate(
                          { contactId: selectedContact.id, status: "archived" },
                          {
                            onSuccess: () =>
                              setSelectedContact((c) => (c ? { ...c, status: "archived" } : c)),
                          },
                        )
                      }
                      className="px-3 py-1.5 text-xs uppercase tracking-wider border border-border hover:bg-secondary"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !isError && tab === "newsletter" && (
        <div className="border border-border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 font-normal eyebrow">Email</th>
                <th className="p-3 font-normal eyebrow">Source</th>
                <th className="p-3 font-normal eyebrow">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {filteredNewsletters.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-muted-foreground">
                    No newsletter subscribers yet.
                  </td>
                </tr>
              ) : (
                filteredNewsletters.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/50"
                  >
                    <td className="p-3">
                      <a href={`mailto:${n.email}`} className="link-underline">
                        {n.email}
                      </a>
                    </td>
                    <td className="p-3 text-muted-foreground capitalize">{n.source ?? "—"}</td>
                    <td className="p-3 text-muted-foreground tabular-nums">
                      {formatDate(n.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ContactSubmission["status"] }) {
  const styles =
    status === "new"
      ? "bg-foreground text-background"
      : status === "read"
        ? "bg-secondary text-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
