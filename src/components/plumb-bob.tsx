"use client";

import { useEffect, useRef } from "react";

import { sfx } from "@/lib/sound";

import { SpiderBotArt } from "./spider-bot";

/*
 * The site's signature: the spider-bot (components/spider-bot.tsx) on a line
 * of silk, hanging from the header in the right margin like a plumb bob: a
 * machine, a spider and a web strand in one object.
 *
 * It lets its line out as you read, so its depth is your place on the page,
 * and the readout beside it says how far you are. It swings with how fast you
 * scroll and settles like a real pendulum (the period grows with the length
 * of line). While the page moves, its legs scuttle; poke it and it clanks,
 * kicks, swings, and climbs its line before dropping back.
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
    let still = 0;

    const tick = (now: number) => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const target = now < haul ? 24 : 96 + progress * innerHeight * 0.4;

      // A pendulum: restoring force falls with length (g/L), scrolling shoves it.
      const k = 2.2 / Math.max(60, len) ** 0.5;
      const dy = window.scrollY - lastY;
      if (dy !== 0) {
        el.classList.add("is-crawling");
        clearTimeout(still);
        still = window.setTimeout(() => el.classList.remove("is-crawling"), 180);
      }
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
      el.classList.remove("is-poked");
      void el.offsetWidth;
      el.classList.add("is-poked");
      wake();
    };

    const bob = el.querySelector<HTMLElement>("[data-bob]");
    bob?.addEventListener("pointerdown", poke);
    addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", wake);
    wake();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(still);
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
        <span data-bob className="plumb__bob">
          <SpiderBotArt line={false} className="h-full w-full" />
        </span>
      </div>
    </div>
  );
}
