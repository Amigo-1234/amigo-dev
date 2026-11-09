"use client";

import { useEffect, useRef } from "react";

/*
 * A small spider on a silk thread in the top corner of the window. The further
 * you scroll, the further it lets itself down; it swings with how fast you
 * scroll and settles when you stop. Poke it and it scurries back up its
 * thread, then drops again a moment later.
 *
 * Decorative only (aria-hidden, no focus stop). Large pointers only: on touch
 * screens it would sit over the content. Hidden with reduced motion and in
 * print.
 */
export function SpiderDrop() {
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rig.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let len = 0; // current thread length, px
    let angle = 0; // swing, degrees
    let av = 0; // angular velocity
    let lastY = window.scrollY;
    let climb = 0; // >0 while scurrying back up, until this time
    let target = 0;

    const tick = (now: number) => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      // It hangs below the header at the top of the page and lets itself down as you read.
      target = now < climb ? 0 : 96 + progress * innerHeight * 0.4;

      // Scroll speed pushes the pendulum; a damped spring brings it back.
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      av += -angle * 0.035 - dy * 0.06;
      av *= 0.9;
      angle = Math.max(-28, Math.min(28, angle + av));

      const speed = now < climb ? 0.2 : 0.08;
      len += (target - len) * speed;

      el.style.setProperty("--len", `${len.toFixed(1)}px`);
      el.style.setProperty("--swing", `${angle.toFixed(2)}deg`);
      el.toggleAttribute("data-climbing", now < climb);

      if (Math.abs(target - len) > 0.3 || Math.abs(av) > 0.02 || Math.abs(angle) > 0.05 || now < climb) {
        raf = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const poke = () => {
      climb = performance.now() + 2600;
      av += 3;
      wake();
    };

    const body = el.querySelector<HTMLElement>("[data-spider]");
    body?.addEventListener("pointerdown", poke);
    addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", wake);
    wake();
    return () => {
      cancelAnimationFrame(raf);
      body?.removeEventListener("pointerdown", poke);
      removeEventListener("scroll", wake);
      removeEventListener("resize", wake);
    };
  }, []);

  return (
    <div ref={rig} aria-hidden="true" className="spider-drop">
      <div className="spider-drop__swing">
        <span className="spider-drop__thread" />
        <svg data-spider viewBox="-32 -30 64 64" className="spider-drop__body">
          {/* Eight legs, each a knee-bent stroke; the two sides mirror. */}
          <g className="spider-drop__legs" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {[
              "M-5 -4 L-15 -16 L-24 -10",
              "M-6 -1 L-18 -8 L-28 0",
              "M-6 2 L-18 6 L-27 14",
              "M-5 5 L-14 14 L-19 25",
            ].map((d, i) => (
              <g key={i} className="spider-drop__leg" style={{ animationDelay: `${i * 70}ms` }}>
                <path d={d} />
                <path d={d} transform="scale(-1 1)" />
              </g>
            ))}
          </g>
          {/* Abdomen, head and a red mark on the back. */}
          <ellipse cx="0" cy="9" rx="8.5" ry="11" fill="currentColor" />
          <circle cx="0" cy="-5" r="6" fill="currentColor" />
          <path d="M0 3 L3 9 L0 15 L-3 9 Z" fill="var(--accent)" />
          <circle cx="-2.2" cy="-7" r="1.1" fill="var(--ink)" />
          <circle cx="2.2" cy="-7" r="1.1" fill="var(--ink)" />
        </svg>
      </div>
    </div>
  );
}
