import { site } from "@/content/site";
import { cn } from "@/lib/cn";

/*
 * The AMIGODEV monogram: an A and a D sharing one stem. The A's leg leans
 * into the stem, the D's bowl closes it, and the crossbar runs through both
 * letters like a datum line on a drawing. 48-unit grid.
 */
export const MONOGRAM_INK = "M3.5 43 19.5 5h8a17 19 0 0 1 0 38h-8V19.25L9.5 43ZM25.5 11h2a11 13 0 0 1 0 26h-2Z";
export const MONOGRAM_BAR = "M17.08 25H34.5v5.5H14.76Z";

export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("monogram", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path fill="currentColor" fillRule="evenodd" d={MONOGRAM_INK} />
      <path className="monogram-bar" fill="var(--accent)" d={MONOGRAM_BAR} />
    </svg>
  );
}

/** Monogram plus the AMIGODEV wordmark and the owner's name. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Monogram className="size-8 text-fg" />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[0.9375rem] font-semibold tracking-[0.16em] text-fg">
          AMIGO<span className="text-accent">DEV</span>
        </span>
        {!compact && (
          <span className="mt-1 hidden font-mono text-[0.625rem] tracking-[0.14em] text-fg-subtle uppercase xs:block">{site.name}</span>
        )}
      </span>
    </span>
  );
}
