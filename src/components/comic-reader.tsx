"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { sfx } from "@/lib/sound";

/*
 * The projects comic: one page at a time, turned like paper.
 *
 * The pages are server-rendered (ComicPage, in the projects route) and all of
 * them are in the HTML. Without JavaScript they simply stack, so every word
 * is readable and every anchor works. With JavaScript, CSS hides all but the
 * open page (html.js [data-inactive]) and this component turns them: buttons,
 * the dog-ear on each page, ← and → keys while the book is on screen, a swipe
 * on touch screens, and the URL hash (/projects#amigo-world opens that page).
 *
 * Like ShowcaseTabs, it only flips attributes on the server's markup, so the
 * pages cost nothing to hydrate.
 */

type PageInfo = { id: string; label: string };

const TURN_MS = 720;

export function ComicReader({ pages, children }: { pages: PageInfo[]; children: React.ReactNode }) {
  const book = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const busy = useRef(false);
  const [announce, setAnnounce] = useState("");

  const el = (i: number) => document.getElementById(pages[i].id);

  const turn = useCallback(
    (to: number, opts: { focus?: boolean; scroll?: boolean; hash?: boolean } = {}) => {
      const { focus = true, scroll = true, hash = true } = opts;
      const from = currentRef.current;
      if (to < 0 || to >= pages.length || to === from || busy.current) return;
      const out = document.getElementById(pages[from].id);
      const into = document.getElementById(pages[to].id);
      if (!out || !into) return;

      const forward = to > from;
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      currentRef.current = to;
      setCurrent(to);
      setAnnounce(`Page ${to + 1} of ${pages.length}: ${pages[to].label}`);
      if (hash) history.replaceState(null, "", to === 0 ? location.pathname + location.search : `#${pages[to].id}`);

      into.removeAttribute("data-inactive");
      if (still) {
        out.setAttribute("data-inactive", "");
      } else {
        // The outgoing page lifts off the flow; forward, it turns away on top;
        // back, the incoming page turns in over it.
        busy.current = true;
        sfx("whoosh");
        out.classList.add("is-under", forward ? "is-turning-away" : "is-waiting");
        if (!forward) into.classList.add("is-turning-in");
        window.setTimeout(() => {
          out.setAttribute("data-inactive", "");
          out.classList.remove("is-under", "is-turning-away", "is-waiting");
          into.classList.remove("is-turning-in");
          busy.current = false;
        }, TURN_MS);
      }

      const top = book.current?.getBoundingClientRect().top ?? 0;
      if (scroll && top < 0) book.current?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
      if (focus) into.focus({ preventScroll: true });
    },
    [pages],
  );

  // Open the page named in the hash, on arrival and whenever it changes (contents links).
  useEffect(() => {
    const fromHash = (first: boolean) => {
      const id = decodeURIComponent(location.hash.slice(1));
      const i = pages.findIndex((p) => p.id === id);
      if (i < 0) return;
      if (first) {
        // Arriving on a page: show it straight away, no turn.
        el(currentRef.current)?.setAttribute("data-inactive", "");
        el(i)?.removeAttribute("data-inactive");
        currentRef.current = i;
        setCurrent(i);
        book.current?.scrollIntoView({ block: "start" });
      } else {
        turn(i, { hash: false });
      }
    };
    fromHash(true);
    const onHash = () => fromHash(false);
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, turn]);

  // Keys (only while the book is on screen), dog-ears and swipes.
  useEffect(() => {
    const root = book.current;
    if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable], [role=dialog], [role=tablist]")) return;
      const r = root.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight - 80) return;
      if (e.key === "ArrowRight") turn(currentRef.current + 1, { focus: false });
      else if (e.key === "ArrowLeft") turn(currentRef.current - 1, { focus: false });
      else return;
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-turn]");
      if (!btn) return;
      turn(currentRef.current + (btn.dataset.turn === "prev" ? -1 : 1));
    };
    let x0 = 0;
    let y0 = 0;
    const onStart = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      // Leave sideways-scrolling things (code, tables) alone.
      if ((e.target as HTMLElement).closest("pre, table, [data-no-swipe]")) return;
      turn(currentRef.current + (dx < 0 ? 1 : -1), { focus: false });
    };
    addEventListener("keydown", onKey);
    root.addEventListener("click", onClick);
    root.addEventListener("touchstart", onStart, { passive: true });
    root.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchend", onEnd);
    };
  }, [turn]);

  const n = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div className="reader">
      <div ref={book} className="book" data-buddy="Welcome to the comic! Turn pages with ← → or a swipe.">
        {children}
      </div>

      {/* The reader's controls: only meaningful with JavaScript. */}
      <nav aria-label="Comic pages" className="reader-bar js-only">
        <button type="button" className="reader-bar__btn" onClick={() => turn(current - 1)} disabled={current === 0} aria-label="Previous page">
          <span aria-hidden="true">←</span>
        </button>
        <ol className="reader-bar__pages">
          {pages.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className="reader-bar__dot"
                aria-current={i === current ? "page" : undefined}
                aria-label={`Page ${i + 1}: ${p.label}`}
                title={p.label}
                onClick={() => turn(i)}
              >
                {n(i)}
              </button>
            </li>
          ))}
        </ol>
        <p className="reader-bar__now" aria-hidden="true">
          <span className="text-fg">{n(current)}</span>/{n(pages.length - 1)} · {pages[current].label}
        </p>
        <button
          type="button"
          className="reader-bar__btn reader-bar__btn--next"
          onClick={() => turn(current + 1)}
          disabled={current === pages.length - 1}
          aria-label="Next page"
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
