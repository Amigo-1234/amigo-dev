"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { nav, site } from "@/content/site";
import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";
import { sfx } from "@/lib/sound";

import { openCommandMenu } from "./command-menu";
import { SoundToggle } from "./sound-toggle";
import { openTerminal } from "./terminal-dock";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./brand";
import { SpiderBotArt } from "./spider-bot";

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

  // Close the menu after navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // The menu opens from MenuScript (before hydration too); once React is here, give it sound.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const observer = new MutationObserver(() => sfx(dialog.open ? "open" : "close"));
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-4 w-px" />
      {/* The bar's size never changes; only its background layer fades. */}
      {/* A floating comic panel, not a full-width bar; the "get in touch" sticker sits beside it. */}
      <header ref={headerRef} className="site-header sticky top-0 z-40">
        <div className="nav-wrap">
          <div className="nav-panel">
            <Link href="/" className="nav-logo group">
              <Wordmark narrow />
              {/* On the smallest phones the wordmark's text is hidden; name the link anyway. */}
              <span className="sr-only min-[400px]:hidden">AMIGODEV</span>
              <span className="sr-only">, home</span>
            </Link>

            <p aria-hidden="true" className="nav-tag">
              Your friendly neighbourhood developer
            </p>

            <nav aria-label="Main" className="nav-links">
              <ul>
                {nav.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={active ? "page" : undefined} className="nav-link">
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="nav-tools">
              <button type="button" onClick={openCommandMenu} title="Search (⌘K)" className="hdr-btn hdr-btn--wide">
                <span className="sr-only">Search the site (Control or Command + K)</span>
                <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[1.05rem]">
                  <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
              {/* The terminal, one press away on every page (or the ` key). */}
              <button type="button" onClick={openTerminal} title="Open the terminal (` key)" className="hdr-btn term-launch font-mono text-[0.8125rem]">
                <span aria-hidden="true" className="term-launch__prompt">
                  &gt;_
                </span>
                <span className="sr-only">terminal</span>
              </button>
              <SoundToggle className="hdr-btn" />
              <ThemeToggle className="hdr-btn" />
              {/* Opened by MenuScript (inline in <head>), so it works before hydration. */}
              <button type="button" data-menu-open aria-haspopup="dialog" aria-controls="site-menu" className="hdr-btn hdr-btn--menu">
                <span className="hidden min-[400px]:inline">Menu</span>
                <span className="sr-only min-[400px]:hidden">Menu</span>
                <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                  <path d="M0 3h16v2H0zM0 7h16v2H0zM0 11h16v2H0z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          <Link href="/contact" className="nav-cta">
            <span className="nav-cta__bot" aria-hidden="true">
              <SpiderBotArt line={false} />
            </span>
            <span>Get in touch</span>
          </Link>
        </div>

        <SiteMenu dialogRef={dialogRef} pathname={pathname} />
      </header>
    </>
  );
}

/* Each link's own drawing, shown beside the menu while the link is hovered or focused. */
const g1 = gearGeometry(14, 6);
const g2 = gearGeometry(9, 6);
const DRAWINGS: Record<string, { caption: string; art: React.ReactNode }> = {
  "/": {
    caption: "the cover",
    art: (
      <g>
        <circle cx="100" cy="100" r="52" pathLength={1} />
        <path d="M100 30v140M30 100h140" pathLength={1} />
        <circle cx="100" cy="100" r="22" pathLength={1} />
      </g>
    ),
  },
  "/projects": {
    caption: "chapters",
    art: (
      <g>
        <rect x="24" y="30" width="90" height="70" pathLength={1} />
        <rect x="122" y="30" width="54" height="70" pathLength={1} />
        <rect x="24" y="108" width="54" height="62" pathLength={1} />
        <rect x="86" y="108" width="90" height="62" pathLength={1} />
      </g>
    ),
  },
  "/about": {
    caption: "origin story",
    art: (
      <g>
        <circle cx="30" cy="160" r="6" pathLength={1} />
        <path d="M36 156C70 140 60 96 98 92s40 34 72-58" pathLength={1} />
        <path d="M158 40l12-6 2 13" pathLength={1} />
      </g>
    ),
  },
  "/lab": {
    caption: "the workshop",
    art: (
      <g>
        <path d={compactPath(gearPath(g1, 3))} transform="translate(78 104)" pathLength={1} />
        <path d={compactPath(gearPath(g2, 3))} transform={`translate(${78 + (6 * (14 + 9)) / 2} 104) rotate(20)`} pathLength={1} />
        <circle cx="78" cy="104" r="8" pathLength={1} />
      </g>
    ),
  },
  "/#services": {
    caption: "commissions",
    art: (
      <g>
        <rect x="26" y="88" width="148" height="20" pathLength={1} />
        <path d="M26 108l-10 18h20zM174 108l-10 18h20z" pathLength={1} />
        <path d="M26 150h148M26 142v16M174 142v16M100 60v24M94 76l6 8 6-8" pathLength={1} />
      </g>
    ),
  },
  "/contact": {
    caption: "signal me",
    art: (
      <g>
        <path d="M172 28L28 172M172 28L52 100M172 28L100 172M172 28L28 120M172 28L120 160" pathLength={1} />
        <path d="M70 104q22-6 30 18M58 82q36-10 54 30M110 140q-6-26 24-30" pathLength={1} />
      </g>
    ),
  },
};

function SiteMenu({
  dialogRef,
  pathname,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  pathname: string;
}) {
  // Opening, closing and scroll locking are handled by MenuScript; React only renders.
  // Three print plates (red, blue, black) slam in on twos, a hair out of register; then the links rise.
  const items = [{ href: "/", label: "Home" }, ...nav];
  return (
    <dialog ref={dialogRef} id="site-menu" aria-label="Site menu" className="site-menu">
      <span aria-hidden="true" className="site-menu__plate site-menu__plate--m" />
      <span aria-hidden="true" className="site-menu__plate site-menu__plate--c" />
      <span aria-hidden="true" className="site-menu__plate site-menu__plate--k" />

      <div className="site-menu__inner">
        <div className="mx-auto flex h-16 w-full max-w-[84rem] items-center justify-between px-4 sm:px-7 md:h-[4.5rem] lg:px-10">
          <Wordmark />
          <button type="button" data-menu-close className="site-menu__close inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm">
            Close
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
              <path d="M7.33 0h1.34v16H7.33zM0 7.33h16v1.34H0z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="mx-auto grid w-full max-w-[84rem] flex-1 items-center gap-10 px-4 sm:px-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-10">
          <nav aria-label="Site">
            <ol className="site-menu__list">
              {items.map((item, i) => {
                const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
                return (
                  <li key={item.href} className="site-menu__item" style={{ "--i": i } as React.CSSProperties}>
                    <Link href={item.href} data-menu-close aria-current={active ? "page" : undefined} className="site-menu__link">
                      <span className="site-menu__rise">
                        <span className="site-menu__num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="site-menu__label">{item.label}</span>
                        <span className="site-menu__caption">{DRAWINGS[item.href]?.caption}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div aria-hidden="true" className="site-menu__art hidden lg:block">
            {items.map((item) => (
              <svg key={item.href} viewBox="0 0 200 200" className="site-menu__drawing" data-for={item.href}>
                {DRAWINGS[item.href]?.art}
              </svg>
            ))}
            <span className="site-menu__art-caption">Fig. — hover a chapter</span>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[84rem] flex-wrap items-center gap-x-5 gap-y-3 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-7 lg:px-10">
          <button type="button" data-menu-close onClick={openTerminal} className="term-launch inline-flex items-center gap-1 font-mono text-sm">
            <span aria-hidden="true" className="term-launch__prompt">&gt;_</span> open the terminal
          </button>
          <button type="button" data-menu-close onClick={openCommandMenu} className="text-sm text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg">
            Search the site
          </button>
          <a href={`mailto:${site.email}`} className="text-sm text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg">
            Email me
          </a>
        </div>
      </div>
    </dialog>
  );
}
