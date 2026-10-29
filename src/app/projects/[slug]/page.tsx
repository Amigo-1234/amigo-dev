import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { JsonLd, ShotFrame, StatusPill, Tag } from "@/components/ui";
import { getAdjacentProject, getPreviousProject, getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import { contentUpdated } from "@/content/updated";
import { pageMetadata } from "@/lib/metadata";
import { caseStudyGraph } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    path: `/projects/${project.slug}`,
    title: `${project.name} — case study`,
    description: project.summary,
    openGraph: { type: "article" },
    ownImage: true,
  });
}

function Section({ n, title, children, id }: { n: number; title: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="defer-render reveal grid gap-6 border-t border-line pt-10 md:grid-cols-12 md:gap-10 md:pt-14">
      <div className="md:col-span-4">
        <p className="font-mono text-xs text-accent">{String(n).padStart(2, "0")}</p>
        <h2 id={id} className="mt-3 scroll-mt-28 font-serif text-[2.25rem] leading-none">
          {title}
        </h2>
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

const reviewed = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
  new Date(`${contentUpdated.caseStudies}T00:00:00Z`),
);

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getAdjacentProject(project.slug);
  const [lead, ...gallery] = project.shots;
  const desktopGallery = gallery.filter((s) => s.device === "desktop");
  const mobileGallery = gallery.filter((s) => s.device === "mobile");

  const sections = [
    { id: "challenge", title: "The challenge" },
    { id: "solution", title: "The solution" },
    { id: "decisions", title: "Engineering decisions" },
    { id: "architecture", title: "Architecture" },
    { id: "features", title: "Key features" },
    { id: "challenges", title: "Technical challenges" },
    ...(project.timeline ? [{ id: "evolution", title: "Evolution" }] : []),
    { id: "outcome", title: "Outcome" },
  ];
  const title = (id: string) => sections.find((x) => x.id === id)!.title;
  const step = (id: string) => sections.findIndex((x) => x.id === id) + 1;
  const previous = getPreviousProject(project.slug);

  return (
    <article style={{ "--tint": project.tint } as React.CSSProperties}>
      <JsonLd data={caseStudyGraph(project)} />

      <header className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="grid-paper fade-edges absolute inset-0 -z-10" />
        <div
          aria-hidden="true"
          className="absolute top-40 left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
          style={{ background: project.tint }}
        />
        <div className="shell pt-10 md:pt-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-fg-subtle">
              <li>
                <Link href="/projects" className="link-underline hover:text-fg">
                  Projects
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-fg-muted">
                {project.name}
              </li>
            </ol>
          </nav>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <StatusPill label={project.status.label} tone={project.status.tone} />
            <span className="label">{project.kind}</span>
          </div>
          <h1 className="rise mt-6 font-serif text-display">{project.name}</h1>
          <p className="rise mt-8 max-w-3xl text-xl leading-relaxed text-fg-muted md:text-2xl" style={{ "--i": 1 } as React.CSSProperties}>
            {project.intro}
          </p>
          <p className="rise mt-6 text-sm text-fg-muted" style={{ "--i": 1 } as React.CSSProperties}>
            Case study by{" "}
            <Link href="/about" rel="author" className="link-underline text-fg">
              {site.name}
            </Link>{" "}
            ({site.brand}) · Reviewed against the project&rsquo;s repository on{" "}
            <time dateTime={contentUpdated.caseStudies}>{reviewed}</time>
          </p>

          <dl className="rise mt-12 grid border border-line text-sm sm:grid-cols-2 lg:grid-cols-4" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="border-b border-line p-4 sm:border-r lg:border-b-0">
              <dt className="label">My role</dt>
              <dd className="mt-2 text-fg">{project.role}</dd>
            </div>
            <div className="border-b border-line p-4 lg:border-b-0 lg:border-r">
              <dt className="label">{project.client ? "Client" : "Type"}</dt>
              <dd className="mt-2 text-fg">{project.client ?? project.kind}</dd>
            </div>
            <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
              <dt className="label">Category</dt>
              <dd className="mt-2 text-fg">{project.categories.join(", ")}</dd>
            </div>
            <div className="p-4">
              <dt className="label">Links</dt>
              <dd className="mt-2 flex flex-col gap-1.5">
                {project.links.live && (
                  <a href={project.links.live.href} target="_blank" rel="noopener noreferrer" className="link-underline w-fit text-fg">
                    {project.links.live.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                {project.links.source && (
                  <a href={project.links.source} target="_blank" rel="noopener noreferrer" className="link-underline w-fit text-fg">
                    Source on GitHub ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                {!project.links.live && !project.links.source && <span className="text-fg-muted">Not public</span>}
              </dd>
            </div>
          </dl>

          {project.facts.length > 0 && (
            <dl className="rise mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4" style={{ "--i": 3 } as React.CSSProperties}>
              {project.facts.map((f) => (
                <div key={f.label} className="bg-ink px-4 py-4">
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span className="block font-serif text-4xl leading-none text-fg">{f.value}</span>
                    <span className="mt-2 block text-xs text-fg-muted">{f.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <nav aria-label="On this page" className="mt-8 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="inline-flex h-9 shrink-0 items-center rounded-full border border-line px-3.5 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {lead && (
        <figure className="shell mt-14 md:mt-20">
          <ShotFrame shot={lead} tint={project.tint} priority sizes="(min-width: 1344px) 1264px, 100vw" />
          <figcaption className="mt-3 text-sm text-fg-subtle">{lead.caption}</figcaption>
        </figure>
      )}

      <div className="shell mt-20 space-y-20 md:mt-28 md:space-y-28">
        <Section n={step("challenge")} title={title("challenge")} id="challenge">
          <div className="prose-case">
            {project.problem.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        <Section n={step("solution")} title={title("solution")} id="solution">
          <div className="prose-case">
            {project.overview.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
            {project.stack.map((s) => (
              <li key={s}>
                <Tag>{s}</Tag>
              </li>
            ))}
          </ul>
        </Section>

        <Section n={step("decisions")} title={title("decisions")} id="decisions">
          <div className="prose-case">
            {project.approach.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        <Section n={step("architecture")} title={title("architecture")} id="architecture">
          {project.diagram && (
            <div className="mb-10">
              <ArchitectureDiagram diagram={project.diagram} tint={project.tint} />
            </div>
          )}
          <dl className="border-t border-line">
            {project.architecture.map((a) => (
              <div key={a.label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="label pt-1 text-fg">{a.label}</dt>
                <dd className="text-fg-muted">{a.detail}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section n={step("features")} title={title("features")} id="features">
          <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {project.features.map((f) => (
              <li key={f.title} className="bg-ink p-6">
                <h3 className="font-medium text-fg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {(desktopGallery.length > 0 || mobileGallery.length > 0) && (
          <section aria-label="Screenshots" className="defer-render reveal space-y-10">
            {desktopGallery.map((shot) => (
              <figure key={shot.alt}>
                <ShotFrame shot={shot} tint={project.tint} sizes="(min-width: 1344px) 1264px, 100vw" />
                <figcaption className="mt-3 text-sm text-fg-subtle">{shot.caption}</figcaption>
              </figure>
            ))}
            {mobileGallery.length > 0 && (
              <div className="ticks grid gap-10 rounded-xl border border-line bg-ink-sunken px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
                {mobileGallery.map((shot) => (
                  <figure key={shot.alt}>
                    <ShotFrame shot={shot} sizes="272px" />
                    <figcaption className="mx-auto mt-4 max-w-[17rem] text-center text-sm text-fg-subtle">{shot.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        )}

        <Section n={step("challenges")} title={title("challenges")} id="challenges">
          <ol className="space-y-6">
            {project.challenges.map((c) => (
              <li key={c.title} className="rounded-xl border border-line p-6 md:p-8">
                <h3 className="font-serif text-2xl">{c.title}</h3>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="label">Problem</p>
                    <p className="mt-2 text-fg-muted">{c.problem}</p>
                  </div>
                  <div>
                    <p className="label text-accent">What I did</p>
                    <p className="mt-2 text-fg-muted">{c.solution}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {project.timeline && (
          <Section n={step("evolution")} title={title("evolution")} id="evolution">
            <ol className="relative ml-1 border-l border-line">
              {project.timeline.map((t, i) => {
                const last = i === project.timeline!.length - 1;
                return (
                  <li key={t.title} className="relative pb-10 pl-7 last:pb-0 md:pl-10">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[5px] top-1.5 size-2.5 rounded-full ${last ? "bg-accent" : "bg-fg"}`}
                    />
                    <p className="label">{t.date}</p>
                    <h3 className="mt-2 font-serif text-2xl">{t.title}</h3>
                    <p className="mt-2 max-w-2xl text-fg-muted">{t.body}</p>
                  </li>
                );
              })}
            </ol>
          </Section>
        )}

        <Section n={step("outcome")} title={title("outcome")} id="outcome">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="label text-ok">Delivered</p>
              <ul className="mt-4 space-y-3">
                {project.state.done.map((d) => (
                  <li key={d} className="flex gap-3 text-fg-muted">
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ok" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            {project.state.next && (
              <div>
                <p className="label text-warn">Next, or in progress</p>
                <ul className="mt-4 space-y-3">
                  {project.state.next.map((d) => (
                    <li key={d} className="flex gap-3 text-fg-muted">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full border border-warn" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {project.state.note && <p className="mt-8 border-l-2 border-accent pl-4 text-fg">{project.state.note}</p>}
        </Section>
      </div>

      <nav aria-label="More projects" className="defer-render shell mt-28 md:mt-40">
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {[
            { p: previous, label: "Previous project", arrow: "←" },
            { p: next, label: "Next project", arrow: "→" },
          ].map(({ p, label, arrow }) => (
            <Link key={label} href={`/projects/${p.slug}`} className="group block bg-ink p-6 md:p-8">
              <span className="label">{label}</span>
              <span className={`mt-4 flex items-end justify-between gap-6 ${arrow === "←" ? "flex-row-reverse" : ""}`}>
                <span className="font-serif text-4xl transition-colors group-hover:text-accent md:text-5xl">{p.name}</span>
                <span aria-hidden="true" className="mb-2 text-2xl transition-transform duration-500 group-hover:translate-x-1">
                  {arrow}
                </span>
              </span>
              <span className="mt-3 block text-sm text-fg-muted">{p.summary}</span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center">
          <Link href="/projects" className="link-underline text-sm text-fg">
            All projects
          </Link>
          <span aria-hidden="true" className="mx-3 text-fg-subtle">
            ·
          </span>
          <Link href="/contact" className="link-underline text-sm text-fg">
            Discuss a similar project
          </Link>
        </p>
      </nav>
    </article>
  );
}
