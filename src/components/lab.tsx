import Link from "next/link";

import type { Experiment } from "@/content/lab";
import { cn } from "@/lib/cn";

// The game's beetle, drawn as SVG squares (same art as the sprite).
const BEETLE = ["..k...k..", "...k.k...", ".rrrrrrr.", "rrwrrrwrr", ".rrrrrrr.", "k.rrrrr.k", ".k.....k."];
const BEETLE_COLOURS: Record<string, string> = { k: "#6f6e69", r: "#ff5d6c", w: "#ecebe6" };

export function Beetle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 9 7" aria-hidden="true" className={cn("[image-rendering:pixelated]", className)} shapeRendering="crispEdges">
      {BEETLE.flatMap((row, y) =>
        [...row].map((ch, x) => (BEETLE_COLOURS[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={BEETLE_COLOURS[ch]} /> : null)),
      )}
    </svg>
  );
}

/** A small, static emblem for each experiment. Decorative; never pretends to be the live UI. */
export function LabGlyph({ slug }: { slug: string }) {
  switch (slug) {
    case "debug-exe":
      return (
        <span className="relative grid size-full place-items-center bg-[#0b0b0c]">
          <span className="game-scanlines absolute inset-0" />
          <Beetle className="w-14 transition-transform duration-500 group-hover:-translate-y-1.5" />
        </span>
      );
    case "prayer-times":
      return (
        <svg viewBox="0 0 120 64" aria-hidden="true" className="w-[78%] text-fg">
          <path d="M8 56 Q60 -8 112 56" fill="none" stroke="currentColor" strokeOpacity=".25" strokeDasharray="2 4" />
          {[8, 26, 60, 84, 100, 112].map((x, i) => {
            const t = (x - 8) / 104;
            const y = 56 - 4 * 32 * t * (1 - t);
            return <circle key={x} cx={x} cy={y} r={i === 3 ? 5 : 3} className={i === 3 ? "fill-accent" : "fill-current opacity-60"} />;
          })}
          <line x1="0" y1="56" x2="120" y2="56" stroke="currentColor" strokeOpacity=".2" />
        </svg>
      );
    case "result-sheet":
      return (
        <span className="grid w-[72%] grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 font-mono text-[0.6875rem] text-fg-muted">
          {[
            ["Qur'an", "85", "A"],
            ["العربية", "74", "A"],
            ["Maths", "63", "B"],
          ].map(([s, n, g]) => (
            <span key={s} className="contents">
              <span className="truncate">{s}</span>
              <span className="text-right text-fg">{n}</span>
              <span className="text-accent">{g}</span>
            </span>
          ))}
          <span className="col-span-3 mt-1 h-px bg-line-strong" />
          <span>Position</span>
          <span className="col-span-2 text-right text-fg">2nd of 5</span>
        </span>
      );
    case "match-clock":
      return (
        <span className="text-center">
          <span className="block font-serif text-5xl leading-none tabular-nums">
            45<span className="text-accent">+2&prime;</span>
          </span>
          <span className="mt-2 block font-mono text-[0.6875rem] tracking-wide text-fg-subtle">47:12 · 2ND HALF NEXT</span>
        </span>
      );
    default:
      return null;
  }
}

export function ExperimentCard({ experiment, className }: { experiment: Experiment; className?: string }) {
  return (
    <article className={cn("group relative flex flex-col rounded-2xl border border-line bg-ink-raised p-2 transition-colors hover:border-line-strong", className)}>
      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-xl border border-line bg-ink-sunken">
        <div aria-hidden="true" className="grid-paper absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="relative grid size-full place-items-center">
          <LabGlyph slug={experiment.slug} />
        </div>
        <span className="absolute left-3 top-3 rounded-full border border-line bg-ink/80 px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-fg-muted">
          {experiment.code}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <p className="label flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-ok" aria-hidden="true" />
          {experiment.kind} · works in your browser
        </p>
        <h3 className="mt-3 font-serif text-3xl leading-none">
          <Link href={experiment.href} className="after:absolute after:inset-0 after:rounded-2xl after:content-['']">
            <span className="link-underline">{experiment.title}</span>
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{experiment.summary}</p>
        <p className="mt-auto pt-5 font-mono text-[0.6875rem] text-fg-subtle">
          {experiment.origin ? <>From {experiment.origin.project}</> : <>Built for this site</>} · {experiment.tech.slice(0, 2).join(" · ")}
        </p>
      </div>
    </article>
  );
}

/** Shared frame for an experiment page: breadcrumb, title, origin, the widget, then how it works. */
export function ExperimentPage({ experiment, children }: { experiment: Experiment; children: React.ReactNode }) {
  return (
    <div className="shell pt-8 md:pt-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-fg-subtle">
          <li>
            <Link href="/lab" className="link-underline hover:text-fg">
              Lab
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-fg-muted">
            {experiment.title}
          </li>
        </ol>
      </nav>

      <header className="mt-8 grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="label">
            {experiment.code} · {experiment.kind}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.75rem,1.6rem+4.2vw,5.5rem)] leading-[0.95]">{experiment.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">{experiment.summary}</p>
        </div>
        {experiment.origin && (
          <p className="text-sm text-fg-muted md:col-span-4 md:text-right">
            Logic from{" "}
            <Link href={`/projects/${experiment.origin.slug}`} className="link-underline text-fg">
              {experiment.origin.project}
            </Link>
            <br />
            <a href={experiment.origin.source} target="_blank" rel="noopener noreferrer" className="link-underline font-mono text-xs">
              {experiment.origin.file} ↗<span className="sr-only"> (source on GitHub, opens in a new tab)</span>
            </a>
          </p>
        )}
      </header>

      <div className="mt-10 md:mt-14">{children}</div>

      <section aria-labelledby="how-heading" className="mt-16 grid gap-6 border-t border-line pt-10 md:mt-24 md:grid-cols-12">
        <h2 id="how-heading" className="label md:col-span-3">
          How it works
        </h2>
        <ul className="space-y-4 md:col-span-9">
          {experiment.notes.map((note) => (
            <li key={note} className="flex gap-3 text-fg-muted">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-16 text-sm text-fg-subtle">
        <Link href="/lab" className="link-underline text-fg">
          ← Back to the Lab
        </Link>
      </p>
    </div>
  );
}
