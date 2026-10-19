"use client";

import { useEffect, useRef } from "react";

/*
 * GSAP is loaded on demand, after the page has rendered, so it never delays
 * the first paint or competes with hydration on slow phones. useGsap() does
 * what @gsap/react's useGSAP does — runs setup inside a gsap.context scoped to
 * a ref and reverts every tween, ScrollTrigger and matchMedia on unmount or
 * when dependencies change — with the import done lazily.
 */

type GsapModule = typeof import("gsap").gsap;
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type Gsap = { gsap: GsapModule; ScrollTrigger: ScrollTriggerModule };

/** Conditions shared by every animation: motion only when the visitor allows it. */
export const MOTION = "(prefers-reduced-motion: no-preference)";
/** Pointer-driven effects only for a precise pointer that can hover. */
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

let loading: Promise<Gsap> | null = null;

const INTERACTIONS = ["scroll", "wheel", "pointerdown", "pointermove", "keydown", "touchstart"] as const;
let interacted = false;
const waiting = new Set<() => void>();

/**
 * Calls `fn` on the first interaction (or now, if one already happened), in
 * idle time. Returns a canceller.
 *
 * Taps on the header or the menu don't count: loading and setting up scroll
 * animations at that moment would compete with the menu opening.
 */
function onFirstInteraction(fn: () => void): () => void {
  if (interacted) {
    fn();
    return () => {};
  }
  if (waiting.size === 0) {
    const fire = (e: Event) => {
      const target = e.target;
      if (target instanceof Element && target.closest("header, dialog")) return;
      interacted = true;
      INTERACTIONS.forEach((type) => window.removeEventListener(type, fire));
      const callbacks = [...waiting];
      waiting.clear();
      const run = () => callbacks.forEach((cb) => cb());
      // Safari has no requestIdleCallback; fall back to a short timeout there.
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 1500 });
      else setTimeout(run, 50);
    };
    INTERACTIONS.forEach((type) => window.addEventListener(type, fire, { passive: true }));
  }
  waiting.add(fn);
  return () => void waiting.delete(fn);
}

export function loadGsap(): Promise<Gsap> {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/ScrambleTextPlugin")]).then(
    ([core, st, scramble]) => {
      core.gsap.registerPlugin(st.ScrollTrigger, scramble.ScrambleTextPlugin);
      return { gsap: core.gsap, ScrollTrigger: st.ScrollTrigger };
    },
  );
  return loading;
}

type Setup = (lib: Gsap) => void | (() => void);

/**
 * Runs `setup` in a gsap.context once GSAP has loaded. Anything created inside
 * (tweens, timelines, ScrollTriggers, matchMedia) is reverted on cleanup.
 * `when` skips loading entirely when it returns false.
 * `defer` waits until the visitor first interacts (scroll, pointer, key or
 * touch), since deferred effects only matter once someone is exploring.
 */
export function useGsap<T extends Element>(setup: Setup, deps: React.DependencyList, options: { scope?: React.RefObject<T | null>; defer?: boolean; when?: () => boolean } = {}) {
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    if (options.when && !options.when()) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    const start = () =>
      loadGsap().then((lib) => {
        if (cancelled) return;
        const ctx = lib.gsap.context(() => setupRef.current(lib), options.scope?.current ?? undefined);
        revert = () => ctx.revert();
      });

    const cancelWait = options.defer ? onFirstInteraction(() => void start()) : (void start(), () => {});

    return () => {
      cancelled = true;
      cancelWait();
      revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass their own dependency list
  }, deps);
}
