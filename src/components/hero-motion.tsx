"use client";

import { useRef } from "react";

import { MOTION, useGsap } from "@/lib/gsap";

/*
 * Choreographs the hero. Server-rendered children mark their parts with
 * data attributes; this only adds motion. Until it runs, CSS keeps [data-hero]
 * parts hidden (JavaScript visitors on large screens only) with a 2.5s
 * fallback; on phones, without JavaScript or with reduced motion, everything
 * is simply visible.
 */
export function HeroMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useRef<HTMLElement>(null);

  useGsap(
    ({ gsap }) => {
      const root = document.documentElement;
      const mm = gsap.matchMedia();

      // Large screens only: on phones the hero is shown at once, so slow
      // networks never wait for this script before seeing the page.
      mm.add(`${MOTION} and (min-width: 1024px)`, () => {
        const q = gsap.utils.selector(scope);
        const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } });

        // Set every starting state first, then hand control from CSS to GSAP.
        gsap.set(q("[data-hero]"), { opacity: 1 });
        gsap.set(q("[data-hero-line]"), { yPercent: 110, rotate: 2.5 });
        gsap.set(q("[data-hero-fade]"), { opacity: 0, y: 24 });
        gsap.set(q("[data-hero-portrait]"), { opacity: 0, y: 28, scale: 0.97 });
        root.classList.add("gsap");

        const label = q("[data-hero-label]")[0];
        if (label) {
          tl.to(label, { duration: 1, ease: "none", scrambleText: { text: label.textContent ?? "", chars: "01/<>—_", speed: 0.6 } }, 0);
        }
        tl.to(q("[data-hero-line]"), { yPercent: 0, rotate: 0, stagger: 0.1, duration: 1.3 }, 0.1)
          .to(q("[data-hero-portrait]"), { opacity: 1, y: 0, scale: 1, duration: 1.4 }, 0.35)
          .to(q("[data-hero-fade]"), { opacity: 1, y: 0, stagger: 0.09 }, 0.55);
      });

      return () => root.classList.remove("gsap");
    },
    [],
    // Don't even load GSAP for the hero on phones or with reduced motion.
    { scope, when: () => window.matchMedia(`${MOTION} and (min-width: 1024px)`).matches },
  );

  return (
    <section ref={scope} aria-labelledby="hero-title" className={className}>
      {children}
    </section>
  );
}
