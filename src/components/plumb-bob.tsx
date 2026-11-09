"use client";

import { useEffect, useRef } from "react";

import { sfx } from "@/lib/sound";

/*
 * The site's signature: a plumb bob on a line of silk, hanging from the
 * header in the right margin. A drafting weight (the oldest way to find true
 * vertical) on a web strand: engineering and the web in one object.
 *
 * It lets its line out as you read, so its depth is your place on the page,
 * and the readout beside it says how far you are. It swings with how fast you
 * scroll and settles like a real pendulum (the period grows with the length
 * of line). Poke it and it rings like steel on a rule, swings, and is hauled
 * up its line before dropping back.
 *
 * Decorative (aria-hidden, no focus stop). Large pointers only, since on a
 * phone it would sit over the text. Hidden with reduced motion and in print.
 */
export function PlumbBob() {
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rig.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const readout = el.querySelector<HTMLElement>("[data-readout]");

    let raf = 0;
    let len = 0; // line paid out, px
    let angle = 0; // degrees
    let av = 0; // angular velocity, degrees per frame
    let lastY = window.scrollY;
    let haul = 0; // hauled up until this time
    let shown = -1;

    const tick = (now: number) => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const target = now < haul ? 24 : 96 + progress * innerHeight * 0.4;

      // A pendulum: restoring force falls with length (g/L), scrolling shoves it.
      const k = 2.2 / Math.max(60, len) ** 0.5;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      av += -angle * k * 0.12 - dy * 0.05;
      av *= 0.94;
      angle = Math.max(-24, Math.min(24, angle + av));
      len += (target - len) * (now < haul ? 0.22 : 0.08);

      el.style.setProperty("--len", `${len.toFixed(1)}px`);
      el.style.setProperty("--swing", `${angle.toFixed(2)}deg`);
      const pct = Math.round(progress * 100);
      if (readout && pct !== shown) {
        shown = pct;
        readout.textContent = `${String(pct).padStart(2, "0")}%`;
      }

      if (Math.abs(target - len) > 0.3 || Math.abs(av) > 0.01 || Math.abs(angle) > 0.04 || now < haul) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const poke = () => {
      sfx("clank");
      av += 4.5;
      haul = performance.now() + 2200;
      wake();
    };

    const bob = el.querySelector<HTMLElement>("[data-bob]");
    bob?.addEventListener("pointerdown", poke);
    addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", wake);
    wake();
    return () => {
      cancelAnimationFrame(raf);
      bob?.removeEventListener("pointerdown", poke);
      removeEventListener("scroll", wake);
      removeEventListener("resize", wake);
    };
  }, []);

  return (
    <div ref={rig} aria-hidden="true" className="plumb">
      <div className="plumb__swing">
        <span className="plumb__line" />
        <span className="plumb__readout" data-readout>
          00%
        </span>
        <svg data-bob viewBox="-14 -6 28 48" className="plumb__bob">
          {/* The knot on the silk, the cap, and the turned steel body tapering to a point. */}
          <circle cx="0" cy="-2.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect x="-5" y="0" width="10" height="5" rx="1" fill="var(--blueprint)" />
          <path d="M-9 6h18l-2 14L0 40l-7-20z" fill="currentColor" />
          <path d="M-9 6h18M-8 11h16" stroke="var(--ink)" strokeWidth="1" />
          <path d="M3 8l-1 12" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
