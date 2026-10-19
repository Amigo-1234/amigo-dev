import Link from "next/link";

import { nav, site } from "@/content/site";

import { LocalTime } from "./local-time";

export function SiteFooter() {
  return (
    <footer className="defer-render relative mt-24 border-t border-line md:mt-36">
      <div className="shell grid gap-14 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="label">Contact · Sheet ∞</p>
          <p className="mt-5 font-serif text-headline">
            Have something that needs
            <br className="hidden sm:block" /> to <em className="text-accent">work properly</em>?
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Start a conversation
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="link-underline break-all text-sm text-fg-muted hover:text-fg"
            >
              {site.email}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm md:col-span-5 md:justify-items-end">
          <div>
            <p className="label">Index</p>
            <ul className="mt-4 space-y-2.5">
              {[{ href: "/", label: "Home" }, ...nav, { href: "/play", label: "Play DEBUG.EXE" }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline text-fg-muted hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href={site.social.github} target="_blank" rel="noopener noreferrer" className="link-underline text-fg-muted hover:text-fg">
                  GitHub<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline text-fg-muted hover:text-fg">
                  LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="link-underline text-fg-muted hover:text-fg">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.brand}
          </p>
          <p className="font-mono tracking-wide">
            Nigeria · <LocalTime />
          </p>
          <p>
            Set in Instrument Serif, Geist &amp; Geist Mono. Built with Next.js &amp; GSAP.{" "}
            <span className="font-mono tracking-wide" title="Try it on your keyboard">
              ↑↑↓↓←→←→BA
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
