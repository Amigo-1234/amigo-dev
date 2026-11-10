"use client";

import { useEffect } from "react";

/*
 * Every drawn character watches you: the hero's goggles, the spider-bot's
 * lenses and the villains' glares. Anything marked [data-eyes] gets --ex and
 * --ey (each -1 to 1), pointing from its centre to the pointer, and CSS moves
 * its .pupil elements by that much. A tap on a touch screen counts too; after
 * a few seconds without the pointer they look back to the front.
 *
 * One rAF per pointer move, and only for characters on screen. Off with
 * reduced motion.
 */

const REST_MS = 3000;

export function EyeTracker() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let y = 0;
    let raf = 0;
    let rest = 0;

    const look = (reset: boolean) => {
      raf = 0;
      document.querySelectorAll<HTMLElement | SVGElement>("[data-eyes]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return;
        if (reset) {
          el.style.removeProperty("--ex");
          el.style.removeProperty("--ey");
          return;
        }
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        // Full deflection once the pointer is a little way off; close in, they look less far.
        const k = Math.min(1, d / 240) / d;
        el.style.setProperty("--ex", (dx * k).toFixed(3));
        el.style.setProperty("--ey", (dy * k).toFixed(3));
      });
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => look(false));
      clearTimeout(rest);
      rest = window.setTimeout(() => look(true), REST_MS);
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(rest);
    };
  }, []);

  return null;
}
