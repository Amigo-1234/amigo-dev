"use client";

import { useEffect, useRef } from "react";

/*
 * Things hanging on silk swing when the page scrolls. This wrapper runs one
 * damped pendulum (scrolling shoves it, gravity brings it back) and publishes
 * its angle as --sw, in degrees, on its own element. Anything inside can use
 * it: `rotate: calc(var(--sw) * 1deg * var(--k, 1))`, each with its own --k so
 * long strands swing wide and short ones barely move.
 *
 * It sleeps when nothing is moving, and does nothing at all with reduced motion.
 */
export function SwingRig({ className, children, ...rest }: React.ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let angle = 0;
    let av = 0;
    let lastY = window.scrollY;
    let onScreen = true;

    const tick = () => {
      raf = 0;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      av += -angle * 0.035 - Math.max(-60, Math.min(60, dy)) * 0.045;
      av *= 0.955;
      angle = Math.max(-26, Math.min(26, angle + av));
      el.style.setProperty("--sw", angle.toFixed(2));
      if (onScreen && (Math.abs(av) > 0.01 || Math.abs(angle) > 0.03)) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && onScreen) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      lastY = window.scrollY;
      wake();
    });
    io.observe(el);
    addEventListener("scroll", wake, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("scroll", wake);
    };
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
