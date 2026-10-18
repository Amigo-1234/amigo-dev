import type { Metadata } from "next";

import { SearchButton } from "@/components/search-button";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="grid-paper fade-edges absolute inset-0 -z-10" />
      <div className="shell grid min-h-[70vh] items-center gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label">Error 404 · Sheet missing</p>
          <h1 className="mt-6 font-serif text-display">
            This drawing <em className="text-accent">doesn&apos;t exist.</em>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-fg-muted">
            The page may have moved when this site was rebuilt, or the link has a typo. Everything that used to live
            here is still a click away.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/">Back to the start</ButtonLink>
            <ButtonLink href="/projects" variant="outline">
              See the projects
            </ButtonLink>
            <SearchButton className="px-3 text-sm text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg">
              Search the site
            </SearchButton>
          </div>
        </div>

        <svg viewBox="0 0 320 240" aria-hidden="true" className="w-full max-w-md text-fg lg:col-span-5">
          <g fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M40 180 L160 110 L280 180 L160 250 Z" opacity="0.25" />
            <path d="M40 120 L160 50 L250 102" />
            <path d="M262 109 L280 120 L160 190 L40 120" />
            <path d="M40 120 v14 M160 190 v14 M280 120 v14" opacity="0.5" />
            <path d="M40 134 L160 204 L280 134" opacity="0.5" />
          </g>
          <g stroke="var(--accent)" strokeWidth="1.25">
            <path d="M246 92 l20 20 M266 92 l-20 20" />
          </g>
          <g fill="var(--fg-subtle)" fontFamily="var(--font-geist-mono), monospace" fontSize="10" letterSpacing="0.12em">
            <text x="40" y="30">DETAIL A — NOT FOUND</text>
            <text x="200" y="232">SCALE 1:404</text>
          </g>
        </svg>
      </div>
    </section>
  );
}
