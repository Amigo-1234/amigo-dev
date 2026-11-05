import Image from "next/image";
import Link from "next/link";

import type { Shot, StatusTone } from "@/content/projects";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  external?: boolean;
  /** Leans toward the pointer on devices with a fine pointer. */
  magnetic?: boolean;
  className?: string;
};

export function ButtonLink({ href, children, variant = "solid", external, magnetic = variant !== "ghost", className }: ButtonProps) {
  const classes = cn(
    "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-[transform,background-color,border-color,color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5",
    variant === "solid" && "bg-fg text-ink",
    variant === "outline" && "border border-line-strong text-fg hover:border-fg",
    variant === "ghost" && "px-3 text-fg-muted hover:text-fg",
    className,
  );
  const arrow = (
    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
      {external ? "↗" : "→"}
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} data-magnetic={magnetic ? "" : undefined}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
        {arrow}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} data-magnetic={magnetic ? "" : undefined}>
      {children}
      {arrow}
    </Link>
  );
}

/** A numbered section heading, styled like a callout on a drawing. */
export function SectionHeading({
  index,
  label,
  title,
  intro,
  id,
  className,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:gap-10", className)}>
      <div className="flex items-center gap-3 md:col-span-3 md:items-start md:pt-3">
        <span className="font-mono text-xs text-accent">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
        <span className="label">{label}</span>
      </div>
      <div className="md:col-span-9">
        <h2 id={id} className="font-serif text-headline">
          {title}
        </h2>
        {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">{intro}</div>}
      </div>
    </div>
  );
}

const toneStyles: Record<StatusTone, string> = {
  live: "text-ok",
  building: "text-warn",
  concept: "text-fg-subtle",
};

export function StatusPill({ label, tone, className }: { label: string; tone: StatusTone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide",
        toneStyles[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="relative flex size-1.5">
        {tone === "live" && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      <span className="text-fg-muted">{label}</span>
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs text-fg-muted">{children}</span>
  );
}

/** A screenshot in a minimal browser or phone frame. */
export function ShotFrame({
  shot,
  sizes,
  priority,
  className,
  tint,
}: {
  shot: Shot;
  sizes: string;
  priority?: boolean;
  className?: string;
  tint?: string;
}) {
  if (shot.device === "mobile") {
    return (
      <div
        className={cn("relative mx-auto w-full max-w-[17rem] rounded-[2.2rem] border border-line-strong bg-ink-sunken p-2 shadow-[var(--shadow)]", className)}
      >
        <div className="overflow-hidden rounded-[1.7rem]">
          <Image src={shot.image} alt={shot.alt} sizes={sizes} placeholder="blur" priority={priority} className="h-auto w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border border-line-strong bg-ink-sunken shadow-[var(--shadow)]", className)}
      style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-line px-3">
        <span aria-hidden="true" className="size-2 rounded-full bg-line-strong" />
        <span aria-hidden="true" className="size-2 rounded-full bg-line-strong" />
        <span aria-hidden="true" className="size-2 rounded-full bg-line-strong" />
        {tint && <span aria-hidden="true" className="ml-auto h-1 w-10 rounded-full" style={{ background: tint }} />}
      </div>
      <Image src={shot.image} alt={shot.alt} sizes={sizes} placeholder="blur" priority={priority} className="h-auto w-full" />
    </div>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here once "<" is escaped.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
