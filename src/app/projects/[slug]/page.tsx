import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, ShotFrame, StatusPill, Tag } from "@/components/ui";
import { getAdjacentProject, getProject, projects } from "@/content/projects";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.name} — case study`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", title, description: project.summary, url: `/projects/${project.slug}` },
    twitter: { title, description: project.summary },
  };
}

function Section({ n, title, children, id }: { n: number; title: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="reveal grid gap-6 border-t border-line pt-10 md:grid-cols-12 md:gap-10 md:pt-14">
      <div className="md:col-span-4">
        <p className="font-mono text-xs text-accent">{String(n).padStart(2, "0")}</p>
        <h2 id={id} className="mt-3 font-serif text-[2.25rem] leading-none">
          {title}
        </h2>
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getAdjacentProject(project.slug);
  const [lead, ...gallery] = project.shots;
  const desktopGallery = gallery.filter((s) => s.device === "desktop");
  const mobileGallery = gallery.filter((s) => s.device === "mobile");

  let n = 0;
  const step = () => ++n;

  return (
    <article style={{ "--tint": project.tint } as React.CSSProperties}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.name,
          description: project.summary,
          url: `${site.url}/projects/${project.slug}`,
          author: { "@type": "Person", name: site.name, url: site.url },
          keywords: project.stack.join(", "),
          ...(project.links.live ? { sameAs: project.links.live.href } : {}),
        }}
      />

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
        </div>
      </header>

      {lead && (
        <figure className="shell mt-14 md:mt-20">
          <ShotFrame shot={lead} tint={project.tint} priority sizes="(min-width: 1344px) 1264px, 100vw" />
          <figcaption className="mt-3 text-sm text-fg-subtle">{lead.caption}</figcaption>
        </figure>
      )}

      <div className="shell mt-20 space-y-20 md:mt-28 md:space-y-28">
        <Section n={step()} title="Overview" id="overview">
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

        <Section n={step()} title="The problem" id="problem">
          <div className="prose-case">
            {project.problem.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        <Section n={step()} title="Approach" id="approach">
          <div className="prose-case">
            {project.approach.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        <Section n={step()} title="Architecture" id="architecture">
          <dl className="border-t border-line">
            {project.architecture.map((a) => (
              <div key={a.label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="label pt-1 text-fg">{a.label}</dt>
                <dd className="text-fg-muted">{a.detail}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section n={step()} title="Key features" id="features">
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
          <section aria-label="Screenshots" className="reveal space-y-10">
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

        <Section n={step()} title="Challenges" id="challenges">
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

        <Section n={step()} title="Where it stands" id="status">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="label text-ok">Built</p>
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
                <p className="label text-warn">Planned or in progress</p>
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

      <nav aria-label="Next project" className="shell mt-28 md:mt-40">
        <Link href={`/projects/${next.slug}`} className="group block border-t border-line pt-10">
          <span className="label">Next project</span>
          <span className="mt-4 flex items-end justify-between gap-6">
            <span className="font-serif text-headline transition-colors group-hover:text-accent">{next.name}</span>
            <span aria-hidden="true" className="mb-3 text-3xl transition-transform duration-500 group-hover:translate-x-2">
              →
            </span>
          </span>
          <span className="mt-3 block max-w-xl text-fg-muted">{next.summary}</span>
        </Link>
      </nav>
    </article>
  );
}
