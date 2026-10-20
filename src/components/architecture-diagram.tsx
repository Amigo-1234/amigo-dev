import type { Diagram } from "@/content/projects";

/*
 * A layered system diagram drawn with HTML, not an image: tiers stack top to
 * bottom with labelled connectors between them, so it reflows on a phone,
 * follows the theme and reads as an ordered list to a screen reader.
 */
export function ArchitectureDiagram({ diagram, tint }: { diagram: Diagram; tint: string }) {
  return (
    <figure className="ticks relative rounded-xl border border-line bg-ink-sunken p-4 sm:p-8">
      <div aria-hidden="true" className="grid-paper pointer-events-none absolute inset-0 opacity-60" />
      <ol className="relative">
        {diagram.tiers.map((tier, i) => (
          <li key={tier.label}>
            <div className="grid gap-3 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-6">
              <p className="label text-fg">{tier.label}</p>
              <ul className="flex flex-wrap gap-2">
                {tier.nodes.map((node) => (
                  <li
                    key={node}
                    className="rounded-lg border border-line-strong bg-ink-raised px-3 py-2 text-sm text-fg shadow-[var(--shadow)]"
                    style={i === 0 ? { borderColor: `color-mix(in oklab, ${tint} 55%, transparent)` } : undefined}
                  >
                    {node}
                  </li>
                ))}
              </ul>
            </div>
            {tier.link && (
              <div className="flex items-center gap-3 py-3 sm:ml-[10.5rem]" aria-label={`connects via ${tier.link}`}>
                <span aria-hidden="true" className="relative ml-4 block h-8 w-px bg-line-strong">
                  <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-line-strong" />
                </span>
                <span className="font-mono text-[0.6875rem] tracking-wide text-accent">{tier.link}</span>
              </div>
            )}
            {!tier.link && i < diagram.tiers.length - 1 && <div className="h-4" />}
          </li>
        ))}
      </ol>
      <figcaption className="relative mt-6 border-t border-line pt-4 text-sm text-fg-subtle">{diagram.caption}</figcaption>
    </figure>
  );
}
