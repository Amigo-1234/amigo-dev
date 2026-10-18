import Image from "next/image";

import { site } from "@/content/site";
import { cn } from "@/lib/cn";

import { Monogram } from "./brand";
import { LocalTime } from "./local-time";

/*
 * The portrait, presented like a figure on a drawing sheet: an offset back
 * plate, a warm glow, a frame with registration marks and glass captions.
 * The light inside the frame follows the pointer (set by the motion layer
 * through --mx/--my); on touch devices it stays still.
 */
export function Portrait({
  variant = "hero",
  priority = false,
  className,
}: {
  variant?: "hero" | "about";
  priority?: boolean;
  className?: string;
}) {
  const portrait = site.portrait;
  const sizes = variant === "hero" ? "(min-width: 1024px) 34vw, (min-width: 640px) 60vw, 90vw" : "(min-width: 1024px) 30vw, 90vw";

  return (
    <figure className={cn("relative isolate", className)} data-portrait>
      {/* Back plate, offset like a second sheet */}
      <div
        aria-hidden="true"
        data-portrait-plate
        className="ticks absolute inset-0 translate-x-3 -translate-y-3 rounded-[1.75rem] border border-line sm:translate-x-5 sm:-translate-y-5"
      />
      {/* Warm light behind the frame */}
      <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-full bg-accent opacity-[0.12] blur-3xl sm:-inset-8" />

      <div
        data-portrait-frame
        data-light
        className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-line-strong bg-ink-sunken shadow-[var(--shadow)]"
      >
        {portrait ? (
          <Image
            data-portrait-image
            src={portrait.image}
            alt={portrait.alt}
            fill
            priority={priority}
            placeholder="blur"
            sizes={sizes}
            className="object-cover"
            style={{ objectPosition: portrait.focus }}
          />
        ) : (
          <div className="grid-paper absolute inset-0 grid place-items-center">
            <div className="text-center">
              <Monogram className="mx-auto size-24 text-fg opacity-90" />
              <p className="label mt-6">Portrait coming soon</p>
            </div>
          </div>
        )}

        {/* Grade for caption legibility, then a soft light that follows the pointer */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light"
          style={{ background: "radial-gradient(28rem circle at var(--mx, 30%) var(--my, 20%), rgb(255 236 220 / 0.55), transparent 60%)" }}
        />
        <div aria-hidden="true" className="ticks pointer-events-none absolute inset-3 rounded-[1.25rem] [--tick:rgb(255_255_255/0.45)]" />

        <div data-portrait-chip className="glass absolute left-4 top-4 rounded-full px-3 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-fg uppercase">
          Fig. {variant === "hero" ? "01" : "02"} — M. Idris
        </div>

        <figcaption
          data-portrait-chip
          className="glass absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 rounded-2xl px-4 py-3"
        >
          <span>
            <span className="block font-serif text-2xl leading-none text-fg">{site.name}</span>
            <span className="mt-1.5 block text-xs text-fg-muted">Full-stack developer · Engineering student</span>
          </span>
          <span className="shrink-0 text-right font-mono text-[0.625rem] tracking-wide text-fg-muted">
            <span className="block">Nigeria</span>
            <LocalTime />
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
