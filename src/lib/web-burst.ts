import { useSyncExternalStore } from "react";
import confetti from "canvas-confetti";

/*
 * Confetti, spider style: a burst of tiny spiders and silk beads in the site's
 * red and white. canvas-confetti skips it entirely under reduced motion.
 */
const SPIDER =
  "M0 -6a3 3 0 1 1 0 6a3 3 0 1 1 0-6Zm0 6a5 6 0 1 1 0 12a5 6 0 1 1 0-12ZM-3-2-11-9l1-1 8 6Zm6 0 8-7-1-1-8 6Zm-6 3-11-2v-1.4l11 1.4Zm6 0 11-2v-1.4l-11 1.4Zm-6 3-10 6 .8 1.2L-2 6Zm6 0 10 6-.8 1.2L2 6Zm-5 3-6 10 1.2.8L-1 9Zm4 0 6 10-1.2.8L1 9Z";

let shapes: confetti.Shape[] | null = null;
function spiderShapes() {
  shapes ??= [confetti.shapeFromPath({ path: SPIDER }), "circle"];
  return shapes;
}

function palette() {
  const cs = getComputedStyle(document.documentElement);
  return [cs.getPropertyValue("--accent").trim() || "#ff4545", cs.getPropertyValue("--fg").trim() || "#f3f3f1"];
}

/** The options for a burst from `origin` (0–1 viewport fractions), for ConfettiButton or a direct call. */
export function webBurstOptions(origin?: { x: number; y: number }): confetti.Options {
  return {
    particleCount: 70,
    spread: 80,
    startVelocity: 38,
    gravity: 0.9,
    scalar: 1.3,
    ticks: 160,
    shapes: spiderShapes(),
    colors: palette(),
    disableForReducedMotion: true,
    zIndex: 90,
    ...(origin ? { origin } : {}),
  };
}

export function webBurst(origin?: { x: number; y: number }) {
  return confetti(webBurstOptions(origin));
}

/*
 * The same options as a hook, for components that take them as a prop
 * (ConfettiButton). They read the DOM, so they exist only in the browser and
 * are rebuilt when the theme changes the colours.
 */
let cached: { theme: string; options: confetti.Options } | null = null;
const subscribe = (onChange: () => void) => {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const snapshot = () => {
  const theme = document.documentElement.getAttribute("data-theme") ?? "";
  if (cached?.theme !== theme) cached = { theme, options: webBurstOptions() };
  return cached.options;
};
export function useWebBurstOptions() {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}
