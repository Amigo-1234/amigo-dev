import Image from "next/image";
import Link from "next/link";

import type { Project, ProjectCardData } from "@/content/projects";
import { cn } from "@/lib/cn";

import { ShotFrame, StatusPill } from "./ui";

/** Used where a project has no public screenshots. Never imitates a UI. */
function NoScreenshot({ project, className }: { project: Pick<Project, "name" | "kind" | "tint">; className?: string }) {
  return (
    <div
      className={cn("ticks relative grid aspect-[16/10] place-items-center overflow-hidden rounded-xl border border-line bg-ink-sunken", className)}
    >
      <div className="grid-paper absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute -bottom-1/3 left-1/2 size-[70%] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: project.tint }}
      />
      <div className="relative px-6 text-center">
        <p className="font-serif text-4xl italic text-fg sm:text-5xl">{project.name}</p>
        <p className="label mt-4">{project.kind} · no public screenshots</p>
      </div>
    </div>
  );
}

/** A glass label that slides in over a project image on hover. */
function HoverChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="glass pointer-events-none absolute left-4 top-12 inline-flex translate-y-2 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-fg opacity-0 transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100"
    >
      {children} <span className="text-accent">→</span>
    </span>
  );
}

/** Large alternating feature used on the home page. */
export function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const [primary, secondary] = [project.shots.find((s) => s.device === "desktop"), project.shots.find((s) => s.device === "mobile")];
  const flip = index % 2 === 1;

  return (
    <article className="reveal group relative grid items-center gap-8 md:grid-cols-12 md:gap-12">
      <Link
        href={`/projects/${project.slug}`}
        className={cn("relative block md:col-span-7", flip && "md:order-2")}
        aria-label={`${project.name} case study`}
        tabIndex={-1}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[2rem] opacity-0 blur-3xl md:-inset-6 transition-opacity duration-700 group-hover:opacity-20"
          style={{ background: project.tint }}
        />
        <div data-speed="4">
          {primary ? (
            <ShotFrame
              shot={primary}
              tint={project.tint}
              sizes="(min-width: 1024px) 760px, (min-width: 768px) 58vw, 100vw"
              className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1"
            />
          ) : (
            <NoScreenshot project={project} />
          )}
        </div>
        <HoverChip>Open case study</HoverChip>
        {secondary && (
          <div
            data-speed="-14"
            className={cn(
              "absolute -bottom-8 hidden w-[24%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 sm:block",
              flip ? "-left-4" : "-right-4",
            )}
          >
            <ShotFrame shot={secondary} sizes="200px" className="max-w-none rounded-[1.4rem] p-1 [&>div]:rounded-[1.1rem]" />
          </div>
        )}
      </Link>

      <div className={cn("md:col-span-5", flip && "md:order-1")}>
        <div className="flex flex-wrap items-center gap-3">
          <span data-scramble className="font-mono text-xs text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <StatusPill label={project.status.label} tone={project.status.tone} />
        </div>
        <h3 className="mt-5 font-serif text-title">
          <Link href={`/projects/${project.slug}`} className="link-underline">
            {project.name}
          </Link>
        </h3>
        {project.client && <p className="mt-2 text-sm text-fg-subtle">For {project.client}</p>}
        <p className="mt-4 text-lg leading-relaxed text-fg-muted">{project.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-xs text-fg-subtle">
          {project.stack.slice(0, 5).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <Link
          href={`/projects/${project.slug}`}
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-fg"
        >
          <span className="link-underline">Read the case study</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

/** Compact card used in grids. */
export function ProjectCard({
  project,
  headingLevel = 3,
  priority = false,
}: {
  project: ProjectCardData;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const shot = project.cover;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-xl">
        {shot ? (
          <div className="overflow-hidden rounded-xl border border-line bg-ink-sunken">
            <Image
              src={shot.image}
              alt={shot.alt}
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              placeholder="blur"
              priority={priority}
              className="aspect-[16/10] h-auto w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <NoScreenshot project={project} className="[&_p:first-child]:text-3xl" />
        )}
        <HoverChip>View</HoverChip>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label">{project.categories.join(" · ")}</p>
          <StatusPill label={project.status.label} tone={project.status.tone} />
        </div>
        <Heading className="mt-3 font-serif text-3xl">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
            <span className="link-underline">{project.name}</span>
          </Link>
        </Heading>
        <p className="mt-1.5 text-sm text-fg-subtle">{project.kind}</p>
        <p className="mt-3 text-fg-muted">{project.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="Technologies">
          {project.stack.slice(0, 4).map((s) => (
            <li key={s} className="rounded-full border border-line px-2 py-0.5 text-[0.6875rem] text-fg-muted">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
