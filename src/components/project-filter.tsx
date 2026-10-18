"use client";

import { useState } from "react";

import type { Category, ProjectCardData } from "@/content/projects";
import { cn } from "@/lib/cn";

import { ProjectCard } from "./project-cards";

type Filter = "All" | Category | "In development";

function matches(project: ProjectCardData, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "In development") return project.status.tone === "building";
  return project.categories.includes(filter);
}

/** Server-rendered grid with client-side filters; without JavaScript every project shows. */
export function ProjectFilter({ projects, categories }: { projects: ProjectCardData[]; categories: Category[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const filters: Filter[] = ["All", ...categories.filter((c) => projects.some((p) => p.categories.includes(c))), "In development"];
  const visible = projects.filter((p) => matches(p, filter));

  return (
    <>
      <div role="group" aria-label="Filter projects" className="-mx-1 flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = projects.filter((p) => matches(p, f)).length;
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

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </p>

      <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project, i) => (
          <li key={project.slug} className="page-enter">
            <ProjectCard project={project} headingLevel={2} priority={i < 3} />
          </li>
        ))}
      </ul>
    </>
  );
}
