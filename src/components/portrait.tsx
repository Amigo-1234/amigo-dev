import Image from "next/image";

import { site } from "@/content/site";
import { cn } from "@/lib/cn";

import { Monogram } from "./brand";
import { LocalTime } from "./local-time";

/*
 * An editorial portrait. There is no card around it: the photograph sits on
 * the drawing sheet with registration marks outside its corners, a figure
 * number along its edge, warm light behind it and a lower edge that fades
 * into the page so it reads as part of the layout. A soft highlight follows
 * the pointer on devices with a mouse ([data-light], driven by MotionLayer).
 *
 * When no portrait is configured (site.portrait is null), a branded panel
 * takes its place, so the layout never depends on the photo.
 */
export function Portrait({
  priority = false,
  sizes,
  caption = true,
  className,
}: {
  /** Preload the image. Only for portraits visible on load at every width. */
  priority?: boolean;
  /** The rendered width at each breakpoint, for responsive image selection. */
  sizes: string;
  caption?: boolean;
  className?: string;
}) {
  const portrait = site.portrait;

  return (
    <figure data-portrait className={cn("relative isolate", className)}>
      {/* Warm light behind the photograph, picking up the lamps in the shot */}
      <div aria-hidden="true" className="absolute inset-x-[8%] top-[6%] bottom-[18%] -z-10 rounded-full bg-accent opacity-[0.16] blur-3xl" />

      <div className="relative">
        <div aria-hidden="true" className="ticks pointer-events-none absolute -inset-2.5 sm:-inset-3.5" />
        <div data-light className="portrait-photo relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-ink-sunken">
          {portrait ? (
            <>
              <Image
                src={portrait.image}
                alt={portrait.alt}
                fill
                priority={priority}
                placeholder="blur"
                sizes={sizes}
                className="object-cover"
                style={{ objectPosition: portrait.focus }}
              />
              <div aria-hidden="true" className="portrait-light pointer-events-none absolute inset-0" />
            </>
          ) : (
            <PortraitFallback />
          )}
        </div>
        <p
          aria-hidden="true"
          className="absolute -right-7 top-1 hidden whitespace-nowrap font-mono text-[0.625rem] tracking-[0.18em] text-fg-subtle [writing-mode:vertical-rl] sm:block"
        >
          FIG. 01 — {site.brand}
        </p>
      </div>

      {caption && (
        <figcaption className="relative mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
          <span>
            <span className="block font-serif text-xl leading-none text-fg">{site.name}</span>
            <span className="mt-1.5 block text-xs text-fg-muted">Full-stack developer · {site.brand}</span>
          </span>
          <span className="shrink-0 text-right font-mono text-[0.625rem] tracking-wide text-fg-muted">
            <span className="block">Nigeria</span>
            <LocalTime />
          </span>
        </figcaption>
      )}
    </figure>
  );
}

/** Small portrait for compact layouts (the mobile hero). */
export function PortraitThumb({ className }: { className?: string }) {
  const portrait = site.portrait;
  return (
    <span className={cn("relative block aspect-[4/5] shrink-0 overflow-hidden rounded-xl bg-ink-sunken", className)}>
      {portrait ? (
        <Image
          src={portrait.image}
          alt={portrait.alt}
          fill
          placeholder="blur"
          sizes="88px"
          loading="eager"
          fetchPriority="high"
          className="object-cover"
          style={{ objectPosition: portrait.focus }}
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="grid-paper absolute inset-0" />
          <Monogram className="relative w-1/2 text-fg" />
        </span>
      )}
    </span>
  );
}

/** Branded panel shown until a portrait is supplied. Decorative only. */
function PortraitFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="grid-paper absolute inset-0 opacity-90" />
      <div className="absolute inset-x-0 top-[18%] mx-auto size-[70%] rounded-full bg-accent opacity-25 blur-3xl" />
      {/* A single sweep of light on load (skipped with reduced motion) */}
      <div className="portrait-sweep absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <Monogram className="w-[46%] text-fg drop-shadow-[0_12px_30px_rgb(242_107_58/0.25)]" />
      </div>
      <p className="label absolute inset-x-0 bottom-5 text-center">AMIGODEV · Fig. 01</p>
    </div>
  );
}
