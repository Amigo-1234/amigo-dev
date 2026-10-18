import Image from "next/image";

import { site } from "@/content/site";
import { cn } from "@/lib/cn";

import { Monogram } from "./brand";
import { LocalTime } from "./local-time";

/*
 * An editorial portrait card: the photo sits inside a thin glass frame with a
 * caption strip, warm light behind it and registration marks on the corners.
 * When no portrait is configured (site.portrait is null), a branded card takes
 * its place, so the layout never depends on the photo.
 */
export function Portrait({
  priority = false,
  size = "md",
  className,
}: {
  priority?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const portrait = site.portrait;

  return (
    <figure data-portrait className={cn("relative isolate", className)}>
      {/* Warm light behind the card */}
      <div aria-hidden="true" className="absolute -inset-2 -z-10 rounded-[2rem] bg-accent opacity-[0.14] blur-2xl sm:-inset-6 sm:blur-3xl" />

      <div className="glass rounded-[1.6rem] p-1.5">
        <div
          data-light
          className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-ink-sunken"
        >
          {portrait ? (
            <>
              <Image
                src={portrait.image}
                alt={portrait.alt}
                fill
                priority={priority}
                placeholder="blur"
                sizes={size === "sm" ? "(min-width: 1024px) 18rem, 60vw" : "(min-width: 1024px) 22rem, 80vw"}
                className="object-cover"
                style={{ objectPosition: portrait.focus }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
                style={{ background: "radial-gradient(24rem circle at var(--mx, 30%) var(--my, 18%), rgb(255 236 220 / 0.55), transparent 60%)" }}
              />
            </>
          ) : (
            <PortraitFallback />
          )}
          <div aria-hidden="true" className="ticks pointer-events-none absolute inset-2.5 rounded-[0.9rem] [--tick:rgb(255_255_255/0.35)]" />
        </div>

        <figcaption className="flex items-end justify-between gap-3 px-3 pb-2 pt-3">
          <span>
            <span className="block font-serif text-xl leading-none text-fg">{site.name}</span>
            <span className="mt-1.5 block text-xs text-fg-muted">Full-stack developer</span>
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

/** Branded card shown until a portrait is supplied. Decorative only. */
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
