/*
 * The site's animation language, as plain functions (no GSAP import, so they
 * are cheap to share and easy to test).
 *
 * Drawn things move "on twos": twelve distinct poses a second, as in
 * hand-drawn animation and comic-style film, so they feel inked rather than
 * computer-smooth. The camera (scrolling, parallax) stays smooth. stepped()
 * turns any easing curve into its on-twos version for a tween of a given
 * length: the curve is sampled at 12 frames a second and held between them.
 */

/** Poses per second for drawn motion. */
export const TWOS_FPS = 12;

export type Ease = (progress: number) => number;

/**
 * The on-twos version of `ease` for a tween lasting `duration` seconds.
 * Progress is held at each pose until the next one; the last pose is exactly
 * the end, so the tween always lands where it should.
 */
export function stepped(ease: Ease, duration: number, fps: number = TWOS_FPS): Ease {
  const frames = Math.max(1, Math.round(duration * fps));
  return (p) => {
    if (p >= 1) return ease(1);
    if (p <= 0) return ease(0);
    return ease(Math.floor(p * frames) / frames);
  };
}

/** How far out of register the plates start when something prints in (1 = the full offset in the CSS). */
export const PRINT_OFFSET = 1;
/** How long a print-in lasts, in seconds: a quick slip and snap. */
export const PRINT_DURATION = 0.5;
