"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { sfx } from "@/lib/sound";

import { WebSlingerArt } from "./web-slinger";

/*
 * The hero as a companion. Sections opt in with data-buddy="what he says";
 * when one scrolls into view, he swings in on a web line from above the
 * screen, settles at the side with a speech balloon, then swings off the
 * other way. Each section speaks once per page view, and he waits his turn
 * if two arrive together. Tap him and he says something else.
 *
 * The rig hangs from a pivot far above the viewport, so the swing is a real
 * pendulum arc; it is animated with the Web Animations API on one transform.
 * Nothing at all happens with reduced motion. The balloon is aria-live, so
 * screen readers hear the line too; the drawing is decorative.
 */

const QUIPS = [
  "Thwip! Nice scrolling.",
  "Hey, eyes on the work, not on me.",
  "I'd shake your hand, but I'm a bit tied up.",
  "Every page here is a real project. No stunt doubles.",
  "Psst… the comic on the Work page turns with ← →.",
  "Hanging around. It's what I do.",
];

const HOLD_MS = 3800;

type Shot = { text: string; side: 1 | -1 };

export function SwingBuddy() {
  const pathname = usePathname();
  const rig = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState<Shot | null>(null);
  const queue = useRef<Shot[]>([]);
  const busy = useRef(false);
  const side = useRef<1 | -1>(1);

  useEffect(() => {
    const el = rig.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let timer = 0;

    // The pendulum: length from the pivot to his hand, and the angles that put him off screen or at rest.
    const geometry = () => {
      const L = innerHeight * 1.05;
      const rest = Math.asin(Math.min(0.9, (innerWidth * 0.3) / L)) * (180 / Math.PI);
      const away = Math.min(80, Math.asin(Math.min(0.99, (innerWidth * 0.75) / L)) * (180 / Math.PI) + 12);
      el.style.setProperty("--L", `${L}px`);
      return { rest, away };
    };

    const play = () => {
      if (busy.current || cancelled) return;
      const next = queue.current.shift();
      if (!next) return;
      busy.current = true;
      const { rest, away } = geometry();
      const s = next.side;
      const r = rest * s;
      sfx("whoosh");
      // A positive rotation swings a hanging figure to the left of its pivot.
      el.dataset.side = s === 1 ? "left" : "right";
      el.style.setProperty("--r", `${r}deg`);
      el.style.visibility = "visible";
      const swingIn = el.animate(
        [
          { transform: `rotate(${-away * s}deg)` },
          { transform: `rotate(${r + 9 * s}deg)`, offset: 0.62 },
          { transform: `rotate(${r - 4 * s}deg)`, offset: 0.82 },
          { transform: `rotate(${r}deg)` },
        ],
        { duration: 1500, easing: "cubic-bezier(0.3, 0.55, 0.4, 1)", fill: "forwards" },
      );
      swingIn.onfinish = () => {
        if (cancelled) return;
        setLine(next);
        timer = window.setTimeout(() => {
          setLine(null);
          const out = el.animate([{ transform: `rotate(${r}deg)` }, { transform: `rotate(${(away + 6) * s}deg)` }], {
            duration: 900,
            easing: "cubic-bezier(0.55, 0, 0.75, 0.4)",
            fill: "forwards",
          });
          out.onfinish = () => {
            el.style.visibility = "hidden";
            busy.current = false;
            timer = window.setTimeout(play, 700);
          };
        }, HOLD_MS);
      };
    };

    // Sections that have something to say.
    const said = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || said.has(e.target)) continue;
          said.add(e.target);
          const text = (e.target as HTMLElement).dataset.buddy;
          if (!text) continue;
          side.current = side.current === 1 ? -1 : 1;
          queue.current.push({ text, side: side.current });
          play();
        }
      },
      { threshold: 0.35 },
    );
    // Let the page render (deferred sections, the intro) before listening.
    const start = window.setTimeout(() => {
      document.querySelectorAll("[data-buddy]").forEach((n) => io.observe(n));
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(start);
      clearTimeout(timer);
      io.disconnect();
      el.getAnimations().forEach((a) => a.cancel());
      el.style.visibility = "hidden";
      queue.current = [];
      busy.current = false;
      setLine(null);
    };
  }, [pathname]);

  // Tapping him while he hangs there: a different line.
  const poke = () => {
    if (!line) return;
    sfx("clank");
    const pool = QUIPS.filter((q) => q !== line.text);
    setLine({ ...line, text: pool[Math.floor(Math.random() * pool.length)] });
  };

  return (
    <div ref={rig} className="buddy" data-side="right" style={{ visibility: "hidden" }}>
      <span className="buddy__line" aria-hidden="true" />
      <button type="button" className="buddy__hero" onClick={poke} tabIndex={-1} aria-hidden="true">
        <WebSlingerArt className="buddy__art" />
      </button>
      <p className="buddy__balloon balloon" aria-live="polite" data-show={line ? "" : undefined}>
        {line?.text}
      </p>
    </div>
  );
}
