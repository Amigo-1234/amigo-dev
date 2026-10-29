import type { Metadata } from "next";

import { ProjectCard } from "@/components/project-cards";
import { ProjectFilter } from "@/components/project-filter";
import { ProjectShowcase } from "@/components/project-showcase";
import { categories, projects, smallerWork, toCard, toShowcase } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/projects",
  title: "Projects",
  description:
    "Case studies by Muftau Idris (AMIGODEV): a social network, a live campus sports platform, a food ordering system and a bilingual school results platform.",
});

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured);
  const live = projects.filter((p) => p.status.tone === "live").length;
  const building = projects.filter((p) => p.status.tone === "building").length;

  return (
    <div className="shell pt-12 md:pt-20">
      <header className="grid gap-8 border-b border-line pb-12 md:grid-cols-12 md:pb-16">
        <div className="md:col-span-8">
          <p className="label">Index of work · {projects.length} case studies</p>
          <h1 className="mt-6 font-serif text-display">
            Projects<span className="text-accent">.</span>
          </h1>
        </div>
        <div className="self-end md:col-span-4">
          <p className="text-lg leading-relaxed text-fg-muted">
            Applications and websites for schools, a kitchen, a university sports community, a mosque and my own
            products. Each page says what is live, what is still being built and what I did.
          </p>
          <dl className="mt-6 flex gap-6 font-mono text-xs text-fg-subtle">
            <div>
              <dt className="sr-only">Case studies</dt>
              <dd>
                <span className="text-fg">{projects.length}</span> case studies
              </dd>
            </div>
            <div>
              <dt className="sr-only">Live</dt>
              <dd>
                <span className="text-ok">{live}</span> live
              </dd>
            </div>
            <div>
              <dt className="sr-only">In development</dt>
              <dd>
                <span className="text-warn">{building}</span> in development
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section aria-labelledby="featured-heading" className="pt-12 md:pt-16">
        <h2 id="featured-heading" className="label">
          Featured systems
        </h2>
        <div className="mt-8">
          <ProjectShowcase projects={featured.map(toShowcase)} />
        </div>
      </section>

      <section aria-labelledby="all-heading" className="defer-render mt-28 border-t border-line pt-10 md:mt-36">
        <h2 id="all-heading" className="label mb-8">
          Every case study
        </h2>
        <ProjectFilter
          gridId="project-grid"
          categories={categories}
          items={projects.map((p) => ({ categories: p.categories, tone: p.status.tone }))}
        />
        <ul id="project-grid" className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug} data-project data-categories={project.categories.join("|")} data-tone={project.status.tone} className="page-enter">
              <ProjectCard project={toCard(project)} headingLevel={3} />
            </li>
          ))}
        </ul>
        <p id="project-grid-empty" hidden className="mt-12 text-fg-muted">
          No projects match both filters.
        </p>
      </section>

      <section aria-labelledby="smaller-heading" className="defer-render mt-28 border-t border-line pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="smaller-heading" className="label">
            Client websites
          </h2>
          <p className="text-sm text-fg-subtle">Smaller static builds, live on their clients&rsquo; domains.</p>
        </div>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {smallerWork.map((item) => (
            <li key={item.name} className="flex flex-col bg-ink p-6">
              <p className="label">
                {item.sector} · {item.year}
              </p>
              <p className="mt-3 font-serif text-3xl leading-none">{item.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{item.description}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                <p className="font-mono text-xs text-fg-subtle">{item.stack.join(" · ")}</p>
                {item.live ? (
                  <a href={item.live.href} target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-fg">
                    {item.live.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="text-sm text-fg-subtle">No public link</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
