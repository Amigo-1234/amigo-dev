"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

/*
 * The tab list for the featured-projects showcase (WAI-ARIA tabs: arrow keys
 * move between tabs, Home/End jump). The panels are server-rendered; this
 * only flips their `data-inactive` attribute (hidden by CSS when JavaScript
 * runs), so they cost nothing to hydrate and an inactive panel's lazy images
 * load only when it is opened.
 */
export function ShowcaseTabs({ id, tabs }: { id: string; tabs: { name: string; categories: string }[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const show = (i: number, focus = false) => {
    const next = (i + tabs.length) % tabs.length;
    setActive(next);
    tabs.forEach((_, j) => {
      const panel = document.getElementById(`${id}-panel-${j}`);
      panel?.toggleAttribute("data-inactive", j !== next);
    });
    if (focus) refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: tabs.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      show(keys[e.key], true);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Featured projects"
      onKeyDown={onKeyDown}
      className="js-only -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-line lg:pb-0"
    >
      {tabs.map((t, i) => {
        const selected = i === active;
        return (
          <button
            key={t.name}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={selected}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => show(i)}
            className={cn(
              "relative shrink-0 rounded-full border px-4 py-2.5 text-left transition-colors lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-0 lg:py-5",
              selected ? "border-fg bg-fg text-ink lg:bg-transparent lg:text-fg" : "border-line text-fg-muted hover:text-fg",
            )}
          >
            <span className="flex items-center gap-4">
              <span className={cn("hidden font-mono text-xs lg:inline", selected ? "text-accent" : "text-fg-subtle")}>{String(i + 1).padStart(2, "0")}</span>
              <span className="whitespace-nowrap text-sm font-medium lg:font-serif lg:text-3xl lg:font-normal">{t.name}</span>
            </span>
            <span className="mt-2 hidden pl-9 text-sm text-fg-muted lg:block">{t.categories}</span>
            <span
              aria-hidden="true"
              className={cn(
                "absolute bottom-[-1px] left-0 hidden h-px bg-accent transition-[width] duration-700 ease-[var(--ease-out-expo)] lg:block",
                selected ? "w-full" : "w-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
