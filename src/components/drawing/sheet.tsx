import { cn } from "@/lib/cn";

/*
 * The frame of a drawing sheet: a ruled border with zone references along the
 * top edge and a title block along the bottom. Used for the few places that
 * are drawings in their own right (the Lab instruments), not as a card style.
 */
export type TitleField = { label: string; value: React.ReactNode };

export function SheetFrame({
  children,
  fields,
  zones = 4,
  className,
}: {
  children: React.ReactNode;
  /** Title-block cells, read left to right. */
  fields: TitleField[];
  /** Zone references along the top border (1, 2, 3 …). */
  zones?: number;
  className?: string;
}) {
  return (
    <figure className={cn("relative border border-line-strong bg-ink-sunken [--drawing-bg:var(--ink-sunken)]", className)}>
      <div aria-hidden="true" className="flex border-b border-line">
        {Array.from({ length: zones }, (_, i) => (
          <span key={i} className="flex-1 border-l border-line py-1 text-center font-mono text-[0.625rem] text-fg-subtle first:border-l-0">
            {i + 1}
          </span>
        ))}
      </div>
      <div className="relative">{children}</div>
      {/* A 1px gap over a line-coloured background draws the cell rules at every width. */}
      <figcaption className="grid grid-cols-2 gap-px border-t border-line-strong bg-line sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
        {fields.map((f) => (
          <div key={f.label} className="min-w-0 bg-ink-sunken px-3 py-2">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-fg-subtle">{f.label}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-fg">{f.value}</p>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
