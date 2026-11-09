import "@fontsource/bangers/400.css";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * The comic system's primitives. All server components: they are HTML and
 * CSS (styles in globals.css, "Comic system"), so they cost no JavaScript and
 * read the same without it. Motion is added from outside by MotionLayer
 * through data attributes:
 *
 *   data-print   arrives out of register and snaps into alignment (the comic verb)
 *   data-ink     its SVG strokes draw themselves (the engineering verb)
 *
 * Three identities, three inks: red frames the story (Panel, Caption, Sfx),
 * blueprint blue draws inside it (Blueprint), newsprint white is the text.
 */

type PolyProps<T extends ElementType> = { as?: T; className?: string; children?: ReactNode } & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** A comic panel: an inked frame around one beat of the story. */
export function Panel<T extends ElementType = "div">({
  as,
  tone = "plain",
  className,
  children,
  ...rest
}: PolyProps<T> & { tone?: "plain" | "red" | "blue" | "blueprint" }) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn("panel", tone !== "plain" && `panel--${tone}`, className)} {...rest}>
      {children}
    </Tag>
  );
}

/** The narration box: yellow, inked, set in caps. Use it as a section's eyebrow. */
export function Caption<T extends ElementType = "p">({ as, className, children, ...rest }: PolyProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag className={cn("caption-box", className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Sound-effect lettering, used once per section at most. Decorative by
 * default (hidden from screen readers); pass `spoken` when the word carries
 * meaning.
 */
export function Sfx({ children, className, tilt = -4, spoken = false }: { children: string; className?: string; tilt?: number; spoken?: boolean }) {
  return (
    <span className={cn("sfx", className)} style={{ "--tilt": `${tilt}deg` } as React.CSSProperties} aria-hidden={spoken ? undefined : true}>
      {children}
    </span>
  );
}

/** Ben-Day dots in red or blueprint blue, fading out from one side. Decorative. */
export function Halftone({ tone = "red", from = "right", className }: { tone?: "red" | "blue" | "ink"; from?: "left" | "right" | "top" | "bottom"; className?: string }) {
  return <span aria-hidden="true" className={cn("halftone", `halftone--${tone}`, `halftone--from-${from}`, className)} />;
}

/**
 * Text printed in three plates: the red and blue plates sit a hair out of
 * register behind the black one, as on a comic press. With data-print the
 * plates start far apart and snap together. Drawn with text shadows, so the
 * words exist once for screen readers and wrap normally.
 */
export function Registration<T extends ElementType = "span">({ as, className, children, ...rest }: PolyProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag className={cn("reg", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Drafting paper: a blueprint grid with registration crosshairs in the corners. */
export function Blueprint<T extends ElementType = "div">({ as, className, children, ...rest }: PolyProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn("blueprint", className)} {...rest}>
      <span aria-hidden="true" className="blueprint__marks" />
      {children}
    </Tag>
  );
}
