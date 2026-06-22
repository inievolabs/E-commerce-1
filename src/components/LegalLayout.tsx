import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  updated?: string;
  children: ReactNode;
}

export function LegalLayout({
  eyebrow = "Information",
  title,
  updated = "Updated June 2026",
  children,
}: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 lg:px-10 py-16 lg:py-24">
      <header className="text-center mb-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-4xl md:text-6xl leading-[1.05]">{title}</h1>
        <p className="mt-4 text-xs tracking-[0.22em] uppercase text-muted-foreground">{updated}</p>
      </header>
      <div className="prose-editorial space-y-8 text-foreground/85 leading-[1.85] text-[15px]">
        {children}
      </div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
