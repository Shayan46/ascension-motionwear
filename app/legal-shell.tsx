import type { ReactNode } from "react";

export function LegalShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1ea]">
      <nav className="flex min-h-20 items-center justify-between border-b border-white/15 px-5 py-4 md:px-12">
        <a href="/" className="text-sm font-semibold tracking-[0.22em]">ASCENSION</a>
        <a href="/" className="text-xs uppercase tracking-[0.16em] text-white/60 transition hover:text-white">Back to shop</a>
      </nav>
      <article className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-12 md:py-20 lg:grid-cols-[.65fr_1.35fr]">
        <header className="lg:sticky lg:top-12 lg:self-start">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">{eyebrow}</p>
          <h1 className="mt-5 text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[.82] tracking-[-.065em]">{title}</h1>
          <p className="mt-6 text-sm text-white/45">Last updated {updated}</p>
        </header>
        <div className="legal-copy border-t border-white/15 pt-8 lg:border-t-0 lg:border-l lg:pl-12">{children}</div>
      </article>
      <footer className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 px-5 py-8 text-xs uppercase tracking-[0.14em] text-white/45 md:px-12">
        <a href="/privacy" className="hover:text-white">Privacy</a>
        <a href="/terms" className="hover:text-white">Terms</a>
        <a href="/account" className="hover:text-white">Account</a>
      </footer>
    </main>
  );
}
