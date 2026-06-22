import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Velin Studio" },
      {
        name: "description",
        content:
          "Reach the Velin Studio client services team, or visit our boutiques in Paris and Milan.",
      },
      { property: "og:title", content: "Contact — Velin Studio" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const setF =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-[1200px] px-5 lg:px-10 py-16 lg:py-24">
      <header className="text-center max-w-xl mx-auto">
        <p className="eyebrow">Client services</p>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">Get in touch</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Our team is available Monday through Saturday, 10am – 7pm CET, and replies within one
          business day.
        </p>
      </header>

      <div className="mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20">
        {sent ? (
          <div className="border border-border bg-secondary p-8">
            <p className="eyebrow">Message sent</p>
            <h2 className="mt-3 font-serif text-2xl">Thank you for reaching out.</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We received your message and will reply within one business day.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
              }}
              className="mt-6 eyebrow link-underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (submitting) return;
              setSubmitting(true);
              try {
                const res = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    subject: form.subject || null,
                    message: form.message,
                  }),
                });
                const result = (await res.json()) as { ok: boolean; error?: string };
                if (!result.ok) {
                  toast.error(result.error ?? "Unable to send message.");
                  return;
                }
                setSent(true);
                toast.success("Message sent — we'll be in touch soon.");
              } catch {
                toast.error("Unable to send message. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <Field
                label="First name"
                required
                value={form.firstName}
                onChange={setF("firstName")}
              />
              <Field label="Last name" required value={form.lastName} onChange={setF("lastName")} />
            </div>
            <Field
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={setF("email")}
            />
            <Field label="Subject" value={form.subject} onChange={setF("subject")} />
            <label className="block">
              <span className="block eyebrow mb-2">Message</span>
              <textarea
                rows={6}
                required
                value={form.message}
                onChange={setF("message")}
                className="w-full bg-transparent border-b border-foreground/30 py-3 text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground resize-none"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-foreground text-background px-8 py-4 text-xs tracking-[0.22em] uppercase hover:bg-foreground/90 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send message"}
            </button>
          </form>
        )}

        <aside className="space-y-10">
          <div>
            <p className="eyebrow mb-4">Boutiques</p>
            <ul className="space-y-6">
              {[
                { city: "Paris", addr: "12, rue de Sévigné, 75004" },
                { city: "Milano", addr: "Via della Spiga 18, 20121" },
                { city: "Tokyo", addr: "Aoyama 3-6-12, Minato-ku" },
              ].map((b) => (
                <li key={b.city} className="flex gap-3">
                  <MapPin className="h-4 w-4 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{b.city}</p>
                    <p className="text-sm text-muted-foreground">{b.addr}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Direct</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4" /> clients@velin.studio
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4" /> +33 1 44 78 12 00
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Follow</p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="p-2 border border-border hover:border-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="p-2 border border-border hover:border-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="block eyebrow mb-2">{label}</span>
      <input
        {...props}
        className="w-full bg-transparent border-b border-foreground/30 py-3 text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}
