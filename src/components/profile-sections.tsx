import Link from "next/link";

import { Caption, Panel } from "@/components/comic";
import { SystemExplorer } from "@/components/system-explorer";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { projects } from "@/content/projects";
import { aiWorkflow, learning, services, skills } from "@/content/profile";

/*
 * Sections that used to run down the homepage, now on the pages they belong
 * to: how I build (the exploded view), the equipment manifest and working
 * with AI on About; the commissions on Contact. Each takes its section number
 * from the page it sits on. Every word comes from src/content.
 */

/** How I build: the stack as an exploded assembly drawing. */
export function SystemSection({ index }: { index: string }) {
  const projectNames = Object.fromEntries(projects.map((p) => [p.slug, p.name]));
  return (
    <section aria-labelledby="system-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index={index}
        label="How I build · exploded view"
        id="system-heading"
        title={
          <>
            One owner, <em className="text-accent">every layer.</em>
          </>
        }
        intro="The stack as an assembly drawing. Pick a layer to see what I do there and where you can see it. The dashed one at the bottom is where I'm heading next."
      />
      <div className="assembly mt-12 md:mt-16">
        <SystemExplorer projectNames={projectNames} />
      </div>
    </section>
  );
}

/** The equipment manifest: skills as a parts list, each with where it can be seen. */
export function Capabilities({ index }: { index: string }) {
  return (
    <section aria-labelledby="skills-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index={index}
        label="Equipment manifest"
        id="skills-heading"
        title={
          <>
            From the interface <em className="text-accent">to the server</em> it runs on.
          </>
        }
        intro="A parts list, as on a drawing: only what my projects demonstrate, each group naming where you can see it in practice."
      />

      <div className="manifest mt-14" role="list">
        {skills.map((group, i) => (
          <div key={group.title} role="listitem" data-print="panel" className="manifest__row">
            <p className="manifest__item">
              <span className="label">Item</span>
              <span data-scramble className="manifest__no">
                {String(i + 1).padStart(2, "0")}
              </span>
            </p>
            <div className="min-w-0">
              <h3 className="font-serif text-3xl">{group.title}</h3>
              <p className="mt-2 text-fg-muted">{group.blurb}</p>
            </div>
            <ul data-stagger className="manifest__parts">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="manifest__seen">
              <span className="label">Seen in</span> <span>{group.evidence.join(", ")}</span>
            </p>
          </div>
        ))}
      </div>

      <Panel data-print="panel" className="origin-panel--next mt-4 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <p className="label text-accent">Currently learning · still being inked</p>
            <p className="mt-3 font-serif text-3xl">{learning.title}</p>
          </div>
          <p className="text-fg-muted md:col-span-8">{learning.blurb}</p>
        </div>
      </Panel>
    </section>
  );
}

/** Working with AI: what it is used for, and the ground rules. */
export function WorkingWithAI({ index }: { index: string }) {
  return (
    <section aria-labelledby="ai-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index={index}
        label="Working with AI"
        id="ai-heading"
        title={
          <>
            Faster tools. <em className="text-accent">Same standards.</em>
          </>
        }
        intro={aiWorkflow.intro}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
          {aiWorkflow.uses.map((use) => (
            <li key={use.title} className="min-w-0">
              <Panel data-print="panel" className="h-full p-6">
                <h3 className="font-medium text-fg">{use.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{use.body}</p>
              </Panel>
            </li>
          ))}
        </ul>
        <div className="lg:col-span-4">
          <Caption>Ground rules</Caption>
          <ol className="mt-5 space-y-5">
            {aiWorkflow.principles.map((p, i) => (
              <li key={p} className="flex gap-4 border-t-2 border-frame pt-5">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="font-serif text-2xl leading-snug">{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Commissions: what I can build with you. */
export function Services({ index }: { index: string }) {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return (
    <section id="services" aria-labelledby="services-heading" className="defer-render shell scroll-mt-24 pt-28 md:pt-40">
      <SectionHeading
        index={index}
        label="Commissions"
        id="services-heading"
        title={
          <>
            What I can build <em className="text-accent">with you.</em>
          </>
        }
        intro="For businesses, schools and organisations — and for teams looking for a developer who is comfortable from the database to deployment."
      />
      <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <li key={service.title} className="min-w-0">
            <Panel data-print="panel" className="commission flex h-full flex-col p-6 md:p-7">
              <span className="font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-serif text-3xl leading-none">{service.title}</h3>
              <p className="mt-3 text-fg-muted">{service.body}</p>
              <p className="mt-auto pt-6 text-sm">
                <span className="label mr-2">Seen in</span>
                {service.evidence.map((slug, j) => {
                  const project = bySlug.get(slug);
                  if (!project) return null;
                  return (
                    <span key={slug}>
                      {j > 0 && <span className="text-fg-subtle"> · </span>}
                      <Link href={`/projects/${slug}`} className="link-underline text-fg-muted hover:text-fg">
                        {project.name}
                      </Link>
                    </span>
                  );
                })}
              </p>
            </Panel>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <ButtonLink href="/contact">Start a commission</ButtonLink>
      </p>
    </section>
  );
}
