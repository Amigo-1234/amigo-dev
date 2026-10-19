"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

import { FINE_POINTER, MOTION, useGsap } from "@/lib/gsap";

/*
 * Site-wide motion, driven by data attributes so pages stay server-rendered:
 *
 *   .reveal            fades and rises in when scrolled into view
 *   [data-stagger]     its children rise in one after another
 *   [data-speed]       parallax; the value is the drift in % of its height
 *   [data-drift]       horizontal drift while scrolling (in %)
 *   [data-scramble]    text decodes when it scrolls into view
 *   [data-progress]    a line that draws as its section is scrolled
 *   [data-magnetic]    leans toward the pointer (fine pointers only)
 *   [data-light]       sets --mx/--my for pointer-following light
 *   .spotlight         same, for cards
 *
 * Everything is set up when the browser is idle after a page renders (so it
 * never competes with hydration) and reverted on navigation. Content is visible without JavaScript; elements already on
 * screen are never hidden; reduced motion turns all of it off.
 */
export function MotionLayer() {
  const pathname = usePathname();
  const first = useRef(true);
  const bar = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

        // Route change: a thin accent line sweeps across the top.
        if (!first.current && bar.current) {
          gsap.fromTo(
            bar.current,
            { scaleX: 0, opacity: 1, transformOrigin: "0% 50%" },
            { scaleX: 1, duration: 0.6, ease: "expo.out", onComplete: () => void gsap.to(bar.current, { opacity: 0, duration: 0.4 }) },
          );
        }
        first.current = false;

        const reveals = gsap.utils.toArray<HTMLElement>(".reveal").filter(belowFold);
        gsap.set(reveals, { opacity: 0, y: 36 });
        ScrollTrigger.batch(reveals, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, overwrite: true }),
        });

        for (const group of gsap.utils.toArray<HTMLElement>("[data-stagger]")) {
          if (!belowFold(group)) continue;
          const items = Array.from(group.children);
          gsap.set(items, { opacity: 0, y: 14 });
          ScrollTrigger.create({
            trigger: group,
            start: "top 88%",
            once: true,
            onEnter: () => void gsap.to(items, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.035 }),
          });
        }

        for (const el of gsap.utils.toArray<HTMLElement>("[data-scramble]")) {
          const text = el.textContent ?? "";
          ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            once: true,
            onEnter: () => void gsap.to(el, { duration: 1.1, ease: "none", scrambleText: { text, chars: "01/<>—_#", speed: 0.5, revealDelay: 0.15 } }),
          });
        }

        for (const el of gsap.utils.toArray<HTMLElement>("[data-progress]")) {
          gsap.fromTo(
            el,
            { scaleX: 0, transformOrigin: "0% 50%" },
            { scaleX: 1, ease: "none", scrollTrigger: { trigger: el.closest("section") ?? el, start: "top 65%", end: "bottom 75%", scrub: 0.5 } },
          );
        }

        for (const el of gsap.utils.toArray<HTMLElement>("[data-drift]")) {
          const amount = Number(el.dataset.drift) || 10;
          gsap.fromTo(
            el,
            { xPercent: amount },
            { xPercent: -amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.4 } },
          );
        }
      });

      mm.add(`${MOTION} and (min-width: 768px)`, () => {
        for (const el of gsap.utils.toArray<HTMLElement>("[data-speed]")) {
          const speed = Number(el.dataset.speed) || 0;
          gsap.fromTo(
            el,
            { yPercent: speed },
            { yPercent: -speed, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.6 } },
          );
        }
      });

      mm.add(`${MOTION} and ${FINE_POINTER}`, () => {
        const cleanups: (() => void)[] = [];

        for (const el of gsap.utils.toArray<HTMLElement>("[data-magnetic]")) {
          const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
          const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.28);
            y((e.clientY - (r.top + r.height / 2)) * 0.38);
          };
          const leave = () => {
            x(0);
            y(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        }

        for (const el of gsap.utils.toArray<HTMLElement>("[data-light], .spotlight")) {
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", `${e.clientX - r.left}px`);
            el.style.setProperty("--my", `${e.clientY - r.top}px`);
          };
          el.addEventListener("pointermove", move);
          cleanups.push(() => el.removeEventListener("pointermove", move));
        }

        return () => cleanups.forEach((fn) => fn());
      });


      // Images and fonts change heights after load; keep trigger positions honest.
      // Deferred sections (.defer-render) also change height when they first render.
      const refresh = () => ScrollTrigger.refresh();
      let timer = 0;
      const refreshSoon = () => {
        clearTimeout(timer);
        timer = window.setTimeout(refresh, 150);
      };
      window.addEventListener("load", refresh);
      document.addEventListener("contentvisibilityautostatechange", refreshSoon, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("load", refresh);
        document.removeEventListener("contentvisibilityautostatechange", refreshSoon, true);
      };
    },
    [pathname],
    { defer: true },
  );

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-accent opacity-0"
    />
  );
}
