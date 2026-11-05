import Link from "next/link";

import { site } from "@/content/site";

import { SiteWordmarkFooter } from "./site-wordmark-footer";

/*
 * The end of every page: a call to start a conversation, then the footer
 * proper, AMIGODEV printed as halftone dots (SiteWordmarkFooter renders the
 * <footer> landmark, so this wrapper is not one).
 */
export function SiteFooter() {
  return (
    <div className="defer-render mt-24 md:mt-36">
      <section aria-labelledby="footer-cta" className="border-t border-line">
        <div className="shell flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <div>
            <p className="label">Contact · Sheet ∞</p>
            <h2 id="footer-cta" className="mt-5 font-serif text-headline">
              Have something that needs
              <br className="hidden sm:block" /> to <em className="text-accent">work properly</em>?
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Start a conversation
              <span aria-hidden="true">→</span>
            </Link>
            <a href={`mailto:${site.email}`} className="link-underline break-all text-sm text-fg-muted hover:text-fg">
              {site.email}
            </a>
          </div>
        </div>
      </section>
      <SiteWordmarkFooter />
    </div>
  );
}
