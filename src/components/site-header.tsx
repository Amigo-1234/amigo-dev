"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";

import { openCommandMenu } from "./command-menu";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./brand";

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Scroll state without a scroll handler: when a marker at the very top of
  // the page leaves the viewport, the header gets [data-scrolled]. Only CSS
  // reacts to it (opacity and colour), so scrolling never re-renders React or
  // triggers layout.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const header = headerRef.current;
    if (!sentinel || !header) return;
    const observer = new IntersectionObserver(([entry]) => header.toggleAttribute("data-scrolled", !entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu after navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-4 w-px" />
      {/* The bar's size never changes; only its background layer fades. */}
      <header ref={headerRef} className="site-header sticky top-0 z-40">
        <div className="relative mx-auto flex h-16 max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-7 md:h-[4.5rem] lg:px-10">
          <div aria-hidden="true" className="header-bg" />
          <Link href="/" className="group relative -m-2 flex items-center gap-3 rounded-sm p-2">
            <Wordmark />
            <span className="sr-only">, home</span>
          </Link>

          <nav aria-label="Main" className="relative hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                      active ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    <span className="roll">
                      <span>{item.label}</span>
                      <span aria-hidden="true">{item.label}</span>
                    </span>
                    {active && <span aria-hidden="true" className="absolute inset-x-3.5 bottom-0.5 h-px bg-accent" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

          <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandMenu}
            className="hidden h-10 items-center gap-3 rounded-full border border-line pl-4 pr-2 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg sm:inline-flex"
          >
            <span>
              Search<span className="sr-only"> the site (Control or Command + K)</span>
            </span>
            <kbd aria-hidden="true" className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide text-fg-muted">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.showModal();
              // iOS keeps scrolling the page behind a modal; lock it while open.
              document.documentElement.classList.add("menu-open");
            }}
            aria-haspopup="dialog"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg transition-colors hover:border-line-strong md:hidden"
          >
            Menu
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
              <path d="M2 5.5h12M2 10.5h12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          </div>
        </div>

        <MobileMenu dialogRef={dialogRef} pathname={pathname} />
      </header>
    </>
  );
}

function MobileMenu({
  dialogRef,
  pathname,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  pathname: string;
}) {
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-label="Site menu"
      onClose={() => document.documentElement.classList.remove("menu-open")}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-fg backdrop:bg-ink/60 open:flex open:flex-col md:hidden [&[open]]:animate-[page-enter_0.45s_var(--ease-out-expo)_both]"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="grid-paper pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="shell relative flex h-16 items-center justify-between">
        <Wordmark />
        <button
          type="button"
          onClick={close}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"
        >
          Close
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile" className="shell relative flex flex-1 flex-col justify-center">
        <ol className="space-y-1">
          {[{ href: "/", label: "Home" }, ...nav].map((item, i) => {
            const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
            return (
              <li key={item.href} className="rise" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className="flex items-baseline gap-4 border-b border-line py-3"
                >
                  <span className="label w-6">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("font-serif text-5xl leading-none", active ? "italic text-accent" : "text-fg")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="shell relative flex items-center justify-between gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <button
          type="button"
          onClick={() => {
            close();
            openCommandMenu();
          }}
          className="text-sm text-fg-muted underline decoration-line-strong underline-offset-4"
        >
          Search the site
        </button>
        <a href={`mailto:${site.email}`} className="text-sm text-fg-muted underline decoration-line-strong underline-offset-4">
          Email me
        </a>
      </div>
    </dialog>
  );
}
