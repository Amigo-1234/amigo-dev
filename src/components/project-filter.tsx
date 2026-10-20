"use client";

import { useEffect, useState } from "react";

import type { Category, StatusTone } from "@/content/projects";
import { cn } from "@/lib/cn";

type Filter = "All" | Category;
type Status = "Any status" | "Live" | "In development" | "Concept";
const statuses: Status[] = ["Any status", "Live", "In development", "Concept"];
const tones: Record<Exclude<Status, "Any status">, StatusTone> = { Live: "live", "In development": "building", Concept: "concept" };

type Item = { categories: string[]; tone: StatusTone };

function matches(item: Item, filter: Filter, status: Status) {
  return (filter === "All" || item.categories.includes(filter)) && (status === "Any status" || item.tone === tones[status]);
}

/*
 * Filter buttons for a server-rendered grid. The cards themselves are not
 * React client components (nothing to hydrate); this only toggles `hidden`
 * on the grid's items, read from their data attributes. Without JavaScript
 * every project shows.
 */
export function ProjectFilter({ items, categories, gridId }: { items: Item[]; categories: Category[]; gridId: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [status, setStatus] = useState<Status>("Any status");
  const filters: Filter[] = ["All", ...categories.filter((c) => items.some((p) => p.categories.includes(c)))];
  const visible = items.filter((p) => matches(p, filter, status)).length;

  useEffect(() => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.querySelectorAll<HTMLElement>("[data-project]").forEach((el) => {
      const item = { categories: (el.dataset.categories ?? "").split("|"), tone: el.dataset.tone as StatusTone };
      el.hidden = !matches(item, filter, status);
    });
    const empty = document.getElementById(`${gridId}-empty`);
    if (empty) empty.hidden = visible > 0;
  }, [filter, status, gridId, visible]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label="Filter projects by category" className="-mx-1 flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = items.filter((p) => matches(p, f, status)).length;
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                active ? "border-fg bg-fg text-ink" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {f}
              <span className={cn("font-mono text-xs", active ? "text-ink/60" : "text-fg-subtle")}>{count}</span>
            </button>
          );
        })}
      </div>
      <div role="group" aria-label="Filter projects by status" className="flex flex-wrap gap-1 self-start rounded-full border border-line p-1">
        {statuses.map((st) => (
          <button
            key={st}
            type="button"
            aria-pressed={status === st}
            onClick={() => setStatus(st)}
            className={cn("h-8 rounded-full px-3 text-xs transition-colors", status === st ? "bg-surface-strong text-fg" : "text-fg-muted hover:text-fg")}
          >
            {st}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible} of {items.length} projects
      </p>
    </div>
  );
}
