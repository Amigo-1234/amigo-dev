"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { openCommandMenu } from "./command-menu";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./brand";
import { KineticNavigation } from "./kinetic-navigation";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const header = headerRef.current;
    if (!sentinel || !header) return;
    const observer = new IntersectionObserver(([entry]) => header.toggleAttribute("data-scrolled", !entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-4 w-px" />
      <header ref={headerRef} className="site-header sticky top-0 z-40">
        <div className="relative mx-auto flex h-16 max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-7 md:h-[4.5rem] lg:px-10">
          <div aria-hidden="true" className="header-bg" />
          <Link href="/" className="group relative -m-2 flex items-center gap-3 rounded-sm p-2" aria-label="AMIGODEV home">
            <Wordmark />
          </Link>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={openCommandMenu}
              className="hidden h-10 items-center gap-3 rounded-full border border-line pl-4 pr-2 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg sm:inline-flex"
            >
              <span>Search<span className="sr-only"> the site (Control or Command + K)</span></span>
              <kbd aria-hidden="true" className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide text-fg-muted">⌘K</kbd>
            </button>
            <ThemeToggle />
            <KineticNavigation />
          </div>
        </div>
      </header>
    </>
  );
}
