import Link from "next/link";
import { Fragment } from "react";

import { ArcadeCard } from "@/components/arcade-card";
import { BackIssues, Chapter, Stamp } from "@/components/chapters";
import { Caption, Halftone, Panel, Registration } from "@/components/comic";
import { FourPanels } from "@/components/four-panels";
import { HeroMotion } from "@/components/hero-motion";
import { SpiderWeb } from "@/components/spider-web";
import { SystemExplorer } from "@/components/system-explorer";
import { TerminalLazy } from "@/components/terminal-lazy";
import { ButtonLink, JsonLd, SectionHeading } from "@/components/ui";
import { Highlighter } from "@/components/ui/highlighter";
import { Marquee } from "@/components/ui/marquee";
import { building, buildingAsOf } from "@/content/building";
import { experiments } from "@/content/lab";
import { projects } from "@/content/projects";
import { aiWorkflow, exploring, journey, learning, services, skills } from "@/content/profile";
import { site } from "@/content/site";
import { homePageGraph } from "@/lib/schema";

/*
 * The homepage as Issue #01 of a comic: the cover, the exploded assembly of
 * how I build, the chapters (featured projects) and the back issues (all of
 * them), what's on the press, the four-panel strip, the equipment manifest,
 * the origin story, the terminal, the ground rules, the commissions and the
 * workshop. Every word comes from src/content.
 */
export default function HomePage() {
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <JsonLd data={homePageGraph()} />
      <Cover />
      <StackStrip />
      <SystemSection />

      <section aria-labelledby="work-heading" className="defer-render shell pt-28 md:pt-40">
        <SectionHeading
          index="02"
          label="Selected work"
          id="work-heading"
          title={
            <>
              Software people <em className="text-accent">rely on</em>, not just look at.
            </>
          }
          intro="Four chapters. Schools, a kitchen, a university sports community and a social network, each with real users, real data and rules that have to hold."
        />
        <div className="mt-16 space-y-24 md:mt-24 md:space-y-32">
          {featured.map((project, i) => (
            <Chapter key={project.slug} project={project} index={i} />
          ))}
        </div>

        <div className="mt-28 border-t-2 border-frame pt-12 md:mt-36">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Caption>The archive</Caption>
              <h3 id="archive-heading" data-print className="mt-4 font-serif text-title">
                <Registration>Back issues</Registration>
              </h3>
              <p className="mt-3 max-w-xl text-fg-muted">Every project, each in its own colour. Pick a cover to read the whole story.</p>
            </div>
            <ButtonLink href="/projects" variant="outline">
              All projects
            </ButtonLink>
          </div>
          <div className="mt-10">
            <BackIssues projects={projects} />
          </div>
        </div>
      </section>

      <OnThePress />
      <FourPanels />
      <Capabilities />
      <Journey />
      <Console />
      <WorkingWithAI />
      <Services />
      <Workshop />
    </>
  );
}

function Cover() {
  const lines: React.ReactNode[] = ["Engineering ideas", "into systems", <>that <em className="text-accent">hold up.</em></>];
  return (
    <HeroMotion className="cover relative isolate overflow-hidden">
      <SpiderWeb className="spider-web absolute inset-0 -z-10" />
      <Halftone tone="red" from="right" className="cover__dots absolute -z-10" />
      <div
        aria-hidden="true"
        className="glow-drift absolute -top-40 right-[-10%] -z-10 size-[42rem] rounded-full bg-accent opacity-[0.08] blur-[120px]"
      />

      <div className="shell grid items-center gap-10 pb-10 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-14">
        <div className="lg:col-span-9">
          <p data-hero className="flex flex-wrap items-center gap-3">
            <Caption as="span">AMIGODEV · Issue #01</Caption>
            <span className="label">
              <span className="text-fg">{site.name}</span> · <span data-hero-label>{site.role}</span>
            </span>
          </p>

          <h1 id="hero-title" className="reg mt-6 font-serif text-display sm:mt-8">
            {lines.map((line, i) => (
              // Each line is masked so it can rise from below its own baseline. The " "
              // after it keeps words apart in the raw HTML text; it has no visual effect.
              <Fragment key={i}>
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  <span data-hero data-hero-line className="block origin-bottom-left">
                    {line}
                  </span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>

          <p data-hero data-hero-fade className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-fg-muted sm:mt-8 md:text-xl">
            I build{" "}
            <Highlighter action="underline" color="var(--accent)" strokeWidth={2} iterations={2} padding={1}>
              modern web applications
            </Highlighter>
            , design the{" "}
            <Highlighter action="highlight" color="var(--accent-soft)" padding={2}>
              databases and permissions
            </Highlighter>{" "}
            behind them, deploy them and keep them running — for schools, businesses and communities in Nigeria.
          </p>

          <div data-hero data-hero-fade className="mt-7 grid grid-cols-1 gap-2.5 min-[375px]:grid-cols-[1.2fr_1fr] sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <ButtonLink href="/projects" className="whitespace-nowrap px-4 sm:px-6">
              Explore my work
            </ButtonLink>
            <ButtonLink href="/about" variant="outline" className="whitespace-nowrap px-4 sm:px-6">
              About me
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" className="justify-self-start px-0 min-[375px]:col-span-2 sm:px-3">
              Get in touch
            </ButtonLink>
            {site.resume && (
              <ButtonLink href={site.resume} variant="ghost" external>
                Résumé
              </ButtonLink>
            )}
          </div>
        </div>
      </div>

      {/* The cover's credits, as on the front of an issue (and the title block of a drawing). */}
      <div className="shell pb-6 pt-2">
        <dl data-hero data-hero-fade className="cover-credits">
          {[
            ["Written & built by", site.name],
            ["Disciplines", site.disciplines.join(" · ")],
            ["Studying", "Mechanical Engineering, EKSU"],
            ["Next issue", site.direction],
          ].map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </HeroMotion>
  );
}

/** Everything in the toolbox on two slow belts, running opposite ways: the caption tape. */
function StackStrip() {
  const items = [...new Set(skills.flatMap((g) => g.items))];
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)];
  return (
    <section aria-label="Tools and skills" className="caption-tape relative mt-6 py-2.5 [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {rows.map((row, r) => (
        <Marquee key={r} aria-hidden="true" reverse={r === 1} pauseOnHover className="[--duration:60s] [--gap:0.75rem] motion-reduce:[&>div]:animate-none">
          {row.map((item) => (
            <span key={item} className="flex items-center gap-3 whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-fg-muted">
              <span aria-hidden="true" className="size-1 rotate-45 bg-accent" />
              {item}
            </span>
          ))}
        </Marquee>
      ))}
    </section>
  );
}

function SystemSection() {
  const projectNames = Object.fromEntries(projects.map((p) => [p.slug, p.name]));
  return (
    <section aria-labelledby="system-heading" className="defer-render shell pt-20 md:pt-36">
      <SectionHeading
        index="01"
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

function OnThePress() {
  return (
    <section aria-labelledby="building-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index="03"
        label="On the press"
        id="building-heading"
        title={
          <>
            On the bench <em className="text-accent">right now.</em>
          </>
        }
        intro={`Three projects with real commits in the past fortnight, as of ${buildingAsOf}. What changed, and what comes next.`}
      />
      <ol className="mt-14 grid gap-3 md:mt-20 lg:grid-cols-3">
        {building.map((item, i) => (
          <li key={item.slug} className="min-w-0">
            <Panel data-print="panel" className="group relative flex h-full flex-col p-6 md:p-7" style={{ "--i": i } as React.CSSProperties}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] tracking-wide text-fg-muted">
                  <span aria-hidden="true" className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-50 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-ok" />
                  </span>
                  {item.evidence}
                </p>
                <Stamp tone="building" label={`Last commit ${item.lastCommit}`} />
              </div>
              <h3 className="mt-6 font-serif text-4xl leading-none">
                <Link href={`/projects/${item.slug}`} className="after:absolute after:inset-0 after:content-['']">
                  <span className="link-underline">{item.name}</span>
                </Link>
              </h3>
              <p className="mt-4 leading-relaxed text-fg-muted">{item.now}</p>
              <p className="mt-auto border-t border-line pt-4 text-sm text-fg">
                <span className="label mr-2 text-accent">Next issue</span>
                {item.next}
              </p>
            </Panel>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Capabilities() {
  return (
    <section aria-labelledby="skills-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index="04"
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

function Journey() {
  return (
    <section aria-labelledby="journey-heading" className="defer-render relative mt-28 border-y-2 border-frame bg-ink-sunken py-24 md:mt-40 md:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12">
        {/* The heading holds still while the four panels of the origin story pass it. */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Caption>05 · Origin story</Caption>
            <h2 id="journey-heading" data-print className="mt-6 font-serif text-headline">
              <Registration>
                An engineer&apos;s path <em className="text-accent">into software.</em>
              </Registration>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-muted">
              A progression of interests and skills, not a list of titles. The degree is still in progress, and DevOps is
              where I&apos;m heading.
            </p>
            <p className="mt-6 text-sm text-fg-subtle">
              The full story is on the{" "}
              <Link href="/about" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
                about page
              </Link>
              .
            </p>
          </div>
        </div>
        <ol className="grid gap-4 lg:col-span-8">
          {journey.map((step, i) => {
            const last = i === journey.length - 1;
            return (
              <li key={step.stage}>
                <Panel data-print="panel" tone={last ? "plain" : i % 2 ? "blue" : "red"} className={`origin-panel ${last ? "origin-panel--next" : ""}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs text-fg-subtle">Panel {String(i + 1).padStart(2, "0")}</span>
                    <span className={`label ${last ? "text-accent" : ""}`}>{step.state}</span>
                  </div>
                  <h3 className={`mt-6 font-serif text-[2.4rem] leading-none ${last ? "text-accent" : ""}`}>{step.stage}</h3>
                  <p className="mt-4 max-w-xl text-fg-muted">{step.detail}</p>
                </Panel>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Console() {
  return (
    <section aria-labelledby="console-heading" className="defer-render shell pt-28 md:pt-40">
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <Caption>06 · The terminal</Caption>
          <h2 id="console-heading" data-print className="mt-6 font-serif text-headline">
            <Registration>
              Prefer the <em className="text-accent">command line?</em>
            </Registration>
          </h2>
        </div>
        <div className="lg:col-span-7">
          <p className="max-w-xl text-lg leading-relaxed text-fg-muted">
            So do I. Ask it about my projects, what I&apos;m building right now and what each one runs on, or open a case
            study without touching the mouse. It follows you around the site: press{" "}
            <kbd className="rounded border border-line-strong px-1.5 font-mono text-sm text-fg">`</kbd> on any page, or use
            the <span className="font-mono text-fg">&gt;_ terminal</span> button in the header. There are a few things in
            there I didn&apos;t list.
          </p>
        </div>
      </div>
      <div className="relative isolate mt-10">
        <Halftone tone="blue" from="left" className="absolute -left-4 -top-6 -z-10 h-40 w-64" />
        <TerminalLazy />
      </div>
    </section>
  );
}

function WorkingWithAI() {
  return (
    <section aria-labelledby="ai-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index="07"
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

function Services() {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return (
    <section id="services" aria-labelledby="services-heading" className="defer-render shell scroll-mt-24 pt-28 md:pt-40">
      <SectionHeading
        index="08"
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

/** The workshop: the Lab's instruments and pieces, the game, and what's being tried out next. */
function Workshop() {
  const instruments = experiments.filter((e) => e.family === "instrument");
  const pieces = experiments.filter((e) => e.origin);
  return (
    <section aria-labelledby="workshop-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index="09"
        label="The workshop"
        id="workshop-heading"
        title={
          <>
            Things I&apos;m reading, testing and <em className="text-accent">breaking on purpose.</em>
          </>
        }
        intro="The Lab: engineering instruments with real calculations and stated assumptions, working pieces lifted from real projects, and a game."
      />
      <div className="mt-14 grid gap-3 lg:grid-cols-12">
        <Panel data-print="panel" tone="blueprint" className="p-6 md:p-8 lg:col-span-7">
          <p className="label text-blueprint">Instruments</p>
          <ul className="mt-4 divide-y divide-line">
            {instruments.map((e) => (
              <li key={e.slug}>
                <Link href={e.href} className="group flex items-baseline justify-between gap-4 py-3">
                  <span>
                    <span className="mr-3 font-mono text-[0.6875rem] text-fg-subtle">{e.code}</span>
                    <span className="font-serif text-2xl group-hover:text-accent">{e.title}</span>
                  </span>
                  <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="label mt-8">From real projects</p>
          <ul className="mt-3 space-y-1.5">
            {pieces.map((e) => (
              <li key={e.slug}>
                <Link href={e.href} className="flex items-baseline justify-between gap-3 text-sm text-fg-muted hover:text-fg">
                  <span>
                    <span className="mr-2 font-mono text-[0.6875rem] text-fg-subtle">{e.code}</span>
                    {e.title}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[0.6875rem] text-fg-subtle sm:inline">{e.origin!.project}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/lab" className="link-underline mt-6 inline-block text-sm text-fg">
            Open the Lab →
          </Link>
        </Panel>
        <div className="grid gap-3 lg:col-span-5">
          <ArcadeCard />
          <Panel data-print="panel" className="p-6">
            <p className="label">Currently exploring</p>
            <ul className="mt-4 space-y-4">
              {exploring.map((item) => (
                <li key={item.title}>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  );
}
