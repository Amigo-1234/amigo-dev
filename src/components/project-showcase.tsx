import Image from "next/image";
import Link from "next/link";

import type { ShowcaseData } from "@/content/projects";
import { ShowcaseTabs } from "./showcase-tabs";
import { StatusPill } from "./ui";

/*
 * Featured projects: server-rendered panels with a small client tab list
 * (ShowcaseTabs) that only switches which panel is shown. Without JavaScript
 * the tab list is hidden and every panel is shown in turn.
 */
export function ProjectShowcase({ projects }: { projects: ShowcaseData[] }) {
  const id = "showcase";
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div className="min-w-0 lg:col-span-4">
        <ShowcaseTabs id={id} tabs={projects.map((p) => ({ name: p.name, categories: p.categories.join(" · ") }))} />
      </div>
      <div className="min-w-0 space-y-24 lg:col-span-8">
      {projects.map((p, i) => (
        <div
          key={p.slug}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          data-inactive={i !== 0 ? "" : undefined}
          className="showcase-panel page-enter"
        >
          <h3 className="js-hide mb-6 font-serif text-4xl">{p.name}</h3>
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[2rem] opacity-15 blur-3xl" style={{ background: p.tint }} />
            {p.cover && (
              <div className="overflow-hidden rounded-xl border border-line-strong bg-ink-sunken shadow-[var(--shadow)]">
                <div className="flex h-7 items-center gap-1.5 border-b border-line px-3">
                  <span aria-hidden="true" className="size-2 rounded-full bg-line-strong" />
                  <span aria-hidden="true" className="size-2 rounded-full bg-line-strong" />
                  <span aria-hidden="true" className="size-2 rounded-full bg-line-strong" />
                  <span aria-hidden="true" className="ml-auto h-1 w-10 rounded-full" style={{ background: p.tint }} />
                </div>
                <Image
                  src={p.cover.image}
                  alt={p.cover.alt}
                  sizes="(min-width: 1024px) 820px, 100vw"
                  placeholder="blur"
                  priority={i === 0}
                  className="h-auto w-full"
                />
              </div>
            )}
            {p.phone && (
              <div className="absolute -bottom-6 right-3 hidden w-[22%] rounded-[1.6rem] border border-line-strong bg-ink-sunken p-1.5 shadow-[var(--shadow)] sm:block">
                <Image src={p.phone.image} alt={p.phone.alt} sizes="180px" placeholder="blur" className="h-auto w-full rounded-[1.2rem]" />
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill label={p.status.label} tone={p.status.tone} />
                <span className="label">{p.kind}</span>
              </div>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-fg-muted">{p.summary}</p>
            </div>
            <Link
              href={`/projects/${p.slug}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fg px-6 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-accent-fg"
            >
              Read the case study <span aria-hidden="true">→</span>
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {p.facts.map((f) => (
              <div key={f.label} className="bg-ink p-4">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="block font-serif text-3xl leading-none">{f.value}</span>
                  <span className="mt-1.5 block text-xs text-fg-muted">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
            {p.stack.slice(0, 8).map((s) => (
              <li key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-fg-muted">
                {s}
              </li>
            ))}
          </ul>
        </div>
      ))}
      </div>
    </div>
  );
}
