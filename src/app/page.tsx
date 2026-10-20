import Link from "next/link";

import { ArcadeCard } from "@/components/arcade-card";
import { HeroMotion } from "@/components/hero-motion";
import { Portrait, PortraitThumb } from "@/components/portrait";
import { FeaturedProject, ProjectCard } from "@/components/project-cards";
import { SystemExplorer } from "@/components/system-explorer";
import { TerminalLazy } from "@/components/terminal-lazy";
import { ButtonLink, JsonLd, SectionHeading } from "@/components/ui";
import { building, buildingAsOf } from "@/content/building";
import { experiments } from "@/content/lab";
import { projects, toCard } from "@/content/projects";
import { aiWorkflow, exploring, journey, learning, services, skills } from "@/content/profile";
import { site } from "@/content/site";

export default function HomePage() {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          alternateName: site.brand,
          url: site.url,
          jobTitle: "Full-Stack Developer",
          description: site.description,
          email: `mailto:${site.email}`,
          sameAs: [site.social.github, site.social.linkedin],
          ...(site.portrait ? { image: `${site.url}${site.portrait.image.src}` } : {}),
          affiliation: { "@type": "CollegeOrUniversity", name: "Ekiti State University" },
          knowsAbout: ["Web development", "Next.js", "TypeScript", "PostgreSQL", "Supabase", "Firebase", "Vercel"],
        }}
      />
      <Hero />
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
          intro="Schools, a kitchen, a university sports community and a social network. Each one has real users, real data and rules that have to hold."
        />
        <div className="mt-16 space-y-24 md:mt-24 md:space-y-36">
          {featured.map((project, i) => (
            <FeaturedProject key={project.slug} project={project} index={i} />
          ))}
        </div>

        <div className="mt-28 border-t border-line pt-12 md:mt-36">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h3 className="font-serif text-title">More work</h3>
            <ButtonLink href="/projects" variant="outline">
              All projects
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((project) => (
              <div key={project.slug} className="reveal">
                <ProjectCard project={toCard(project)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CurrentlyBuilding />
      <Interlude />
      <Capabilities />
      <Journey />
      <Console />
      <WorkingWithAI />
      <Services />
      <Exploring />
    </>
  );
}

function Hero() {
  const lines: React.ReactNode[] = ["Engineering ideas", "into systems", <>that <em className="text-accent">hold up.</em></>];
  return (
    <HeroMotion className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="grid-paper fade-edges absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="glow-drift absolute -top-40 right-[-10%] -z-10 size-[42rem] rounded-full bg-accent opacity-[0.07] blur-[120px]"
      />

      <div className="shell grid items-center gap-10 pb-10 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-16">
        <div className="lg:col-span-8">
          {/* Phones and tablets: a compact byline with the portrait, instead of a large photo */}
          <div data-hero className="flex items-center gap-3.5 lg:hidden">
            <PortraitThumb className="w-[3.25rem] ring-1 ring-line" />
            <p className="min-w-0">
              <span className="block font-serif text-[1.375rem] leading-none text-fg">{site.name}</span>
              <span className="label mt-1.5 block">{site.role}</span>
            </p>
          </div>
          <p data-hero className="label hidden flex-wrap items-center gap-x-3 gap-y-1 lg:flex">
            <span className="text-fg">{site.name}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            <span data-hero-label>{site.role}</span>
          </p>

          <h1 id="hero-title" className="mt-5 font-serif text-display sm:mt-7">
            {lines.map((line, i) => (
              // Each line is masked so it can rise from below its own baseline.
              <span key={i} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span data-hero data-hero-line className="block origin-bottom-left">
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p data-hero data-hero-fade className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-fg-muted sm:mt-8 md:text-xl">
            I build modern web applications, design the databases and permissions behind them, deploy them and keep them
            running — for schools, businesses and communities in Nigeria.
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

        {/* Large screens: the editorial portrait beside the headline. Not preloaded,
            so phones (where it is hidden) never download it. */}
        <div data-hero data-hero-portrait className="hidden w-full max-w-[19rem] justify-self-end pr-7 lg:col-span-4 lg:block">
          <Portrait sizes="(min-width: 1024px) 19rem, 1px" />
        </div>
      </div>

      {/* Title block, as on an engineering drawing */}
      <div className="shell pb-6 pt-4 lg:pt-0">
        <dl data-hero data-hero-fade className="grid grid-cols-2 border border-line text-[0.8125rem] sm:text-sm md:grid-cols-4">
          {[
            ["Discipline", site.disciplines.join(" · ")],
            ["Studying", "Mechanical Engineering, EKSU"],
            ["Stack", "Next.js · TypeScript · PostgreSQL"],
            ["Direction", site.direction],
          ].map(([term, value], i) => (
            <div
              key={term}
              className={`border-line px-3 py-2.5 sm:px-4 sm:py-3.5 ${i % 2 === 0 ? "border-r" : "md:border-r"} ${i < 2 ? "border-b md:border-b-0" : ""} ${i === 3 ? "md:border-r-0" : ""}`}
            >
              <dt className="label">{term}</dt>
              <dd className="mt-1 text-fg sm:mt-1.5">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </HeroMotion>
  );
}

function SystemSection() {
  const projectNames = Object.fromEntries(projects.map((p) => [p.slug, p.name]));
  return (
    <section aria-labelledby="system-heading" className="defer-render shell pt-20 md:pt-36">
      <SectionHeading
        index="01"
        label="How I build"
        id="system-heading"
        title={
          <>
            One owner, <em className="text-accent">every layer.</em>
          </>
        }
        intro="Pick a layer to see what I do there and where you can see it. The dashed one at the bottom is where I'm heading next."
      />
      <div className="mt-12 md:mt-16">
        <SystemExplorer projectNames={projectNames} />
      </div>
    </section>
  );
}

function Interlude() {
  const words = ["Design", "Build", "Deploy", "Maintain"];
  return (
    <section aria-label="What I do, in four words" className="defer-render relative mt-28 overflow-hidden border-y border-line py-14 md:mt-40 md:py-20">
      <p data-drift="8" className="flex w-max items-baseline gap-[0.35em] whitespace-nowrap pl-[6vw] font-serif text-[clamp(3.5rem,12vw,11rem)] leading-none">
        {words.map((w, i) => (
          <span key={w} className="flex items-baseline gap-[0.35em]">
            <span className={i % 2 ? "italic text-accent" : undefined}>{w}</span>
            {i < words.length - 1 && (
              <span aria-hidden="true" className="font-mono text-[0.25em] text-fg-subtle">
                →
              </span>
            )}
          </span>
        ))}
      </p>
    </section>
  );
}

function CurrentlyBuilding() {
  return (
    <section aria-labelledby="building-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index="03"
        label="Currently building"
        id="building-heading"
        title={
          <>
            On the bench <em className="text-accent">right now.</em>
          </>
        }
        intro={`Three projects with real commits in the past fortnight, as of ${buildingAsOf}. What changed, and what comes next.`}
      />
      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:mt-20 lg:grid-cols-3">
        {building.map((item, i) => (
          <li key={item.slug} className="reveal group relative flex flex-col bg-ink p-6 md:p-8" style={{ "--i": i } as React.CSSProperties}>
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] tracking-wide text-fg-muted">
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-50 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-ok" />
                </span>
                {item.evidence}
              </p>
              <span className="font-mono text-[0.6875rem] text-fg-subtle">Last commit {item.lastCommit}</span>
            </div>
            <h3 className="mt-6 font-serif text-4xl leading-none">
              <Link href={`/projects/${item.slug}`} className="after:absolute after:inset-0 after:content-['']">
                <span className="link-underline">{item.name}</span>
              </Link>
            </h3>
            <p className="mt-4 leading-relaxed text-fg-muted">{item.now}</p>
            <p className="mt-auto border-t border-line pt-4 text-sm text-fg">
              <span className="label mr-2 text-accent">Next</span>
              {item.next}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Console() {
  return (
    <section aria-labelledby="console-heading" className="defer-render shell pt-28 md:pt-40">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <p className="label flex items-center gap-3">
            <span className="font-mono text-xs text-accent">06</span>
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            Console
          </p>
          <h2 id="console-heading" className="mt-6 font-serif text-headline">
            Prefer the <em className="text-accent">command line?</em>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-muted">
            So do I. Ask it about my projects and skills, or open a case study without touching the mouse. There are a
            few things in there I didn&apos;t list.
          </p>
          <ArcadeCard />
          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="flex items-center justify-between gap-3 text-sm">
              <span className="label">More in the Lab</span>
              <Link href="/lab" className="link-underline text-fg">
                Open the Lab →
              </Link>
            </p>
            <ul className="mt-3 space-y-1.5">
              {experiments
                .filter((e) => e.origin)
                .map((e) => (
                  <li key={e.slug}>
                    <Link href={e.href} className="group flex items-baseline justify-between gap-3 text-sm text-fg-muted hover:text-fg">
                      <span>
                        <span className="mr-2 font-mono text-[0.6875rem] text-fg-subtle">{e.code}</span>
                        {e.title}
                      </span>
                      <span className="hidden shrink-0 font-mono text-[0.6875rem] text-fg-subtle sm:inline">{e.origin!.project}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="reveal relative isolate min-w-0 lg:col-span-7">
          <div aria-hidden="true" className="absolute bottom-4 left-0 -z-10 size-56 sm:-left-8 rounded-full bg-accent opacity-20 blur-3xl" />
          <div aria-hidden="true" className="absolute -top-6 right-0 -z-10 h-40 w-64 sm:-right-4 rounded-full bg-[#3a6df2] opacity-[0.12] blur-3xl" />
          <div aria-hidden="true" className="grid-paper absolute -inset-y-8 inset-x-0 -z-10 opacity-80 sm:-inset-x-6 [mask-image:radial-gradient(closest-side,#000,transparent)]" />
          <TerminalLazy
            data={{
              projects: projects.map((p) => ({ slug: p.slug, name: p.name, summary: p.summary })),
              skills: skills.map((g) => ({ title: g.title, items: [...g.items] })),
            }}
          />
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section aria-labelledby="skills-heading" className="defer-render shell pt-28 md:pt-40">
      <SectionHeading
        index="04"
        label="Capabilities"
        id="skills-heading"
        title={
          <>
            From the interface <em className="text-accent">to the server</em> it runs on.
          </>
        }
        intro="Only what my projects demonstrate. Each group names where you can see it in practice."
      />

      <div className="mt-14 grid border-l border-t border-line sm:grid-cols-2 xl:grid-cols-4">
        {skills.map((group, i) => (
          <div key={group.title} className="reveal spotlight flex flex-col border-b border-r border-line p-6 md:p-8">
            <p data-scramble className="font-mono text-xs text-accent">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-6 font-serif text-3xl">{group.title}</h3>
            <p className="mt-3 text-fg-muted">{group.blurb}</p>
            <ul data-stagger className="mt-6 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li key={item} className="rounded-full border border-line px-2.5 py-1 text-xs text-fg-muted">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 text-xs text-fg-subtle">
              <span className="label">Seen in</span> <span className="ml-1">{group.evidence.join(", ")}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="reveal relative mt-6 overflow-hidden rounded-xl border border-dashed border-accent/60 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-4">
            <p className="label text-accent">Currently learning</p>
            <p className="mt-3 font-serif text-3xl">{learning.title}</p>
          </div>
          <p className="text-fg-muted md:col-span-8">{learning.blurb}</p>
        </div>
      </div>
    </section>
  );
}

function Journey() {
  return (
    <section aria-labelledby="journey-heading" className="defer-render relative mt-28 border-y border-line bg-ink-sunken py-24 md:mt-40 md:py-32">
      <div className="shell">
        <SectionHeading
          index="05"
          label="Trajectory"
          id="journey-heading"
          title={
            <>
              An engineer&apos;s path <em className="text-accent">into software.</em>
            </>
          }
          intro="A progression of interests and skills, not a list of titles. The degree is still in progress, and DevOps is where I'm heading."
        />

        <div aria-hidden="true" className="mt-16 hidden h-px bg-line md:block">
          <div data-progress className="h-px bg-accent" />
        </div>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
          {journey.map((step, i) => {
            const last = i === journey.length - 1;
            return (
              <li key={step.stage} className="reveal relative flex flex-col bg-ink-sunken p-6 md:min-h-[22rem] md:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`label ${last ? "text-accent" : ""}`}>{step.state}</span>
                </div>
                <div className="mt-8 flex items-center gap-3" aria-hidden="true">
                  <span className={`size-2.5 rounded-full ${last ? "border border-dashed border-accent" : "bg-fg"}`} />
                  <span className={`h-px flex-1 ${last ? "border-t border-dashed border-accent/60" : "bg-line-strong"}`} />
                </div>
                <h3 className={`mt-8 font-serif text-[2rem] leading-none ${last ? "italic text-accent" : ""}`}>{step.stage}</h3>
                <p className="mt-4 text-fg-muted">{step.detail}</p>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-sm text-fg-subtle">
          The full story is on the{" "}
          <Link href="/about" className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
            about page
          </Link>
          .
        </p>
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
        <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:col-span-8">
          {aiWorkflow.uses.map((use) => (
            <li key={use.title} className="reveal bg-ink p-6">
              <h3 className="font-medium text-fg">{use.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{use.body}</p>
            </li>
          ))}
        </ul>
        <div className="reveal lg:col-span-4">
          <p className="label">Ground rules</p>
          <ol className="mt-5 space-y-5">
            {aiWorkflow.principles.map((p, i) => (
              <li key={p} className="flex gap-4 border-t border-line pt-5">
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
        label="Services"
        id="services-heading"
        title={
          <>
            What I can build <em className="text-accent">with you.</em>
          </>
        }
        intro="For businesses, schools and organisations — and for teams looking for a developer who is comfortable from the database to deployment."
      />
      <ul className="mt-14 border-t border-line">
        {services.map((service, i) => (
          <li key={service.title} className="reveal grid gap-4 border-b border-line py-7 md:grid-cols-12 md:items-baseline md:gap-8">
            <span className="font-mono text-xs text-fg-subtle md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-serif text-3xl md:col-span-4">{service.title}</h3>
            <p className="text-fg-muted md:col-span-4">{service.body}</p>
            <p className="text-sm md:col-span-3 md:text-right">
              <span className="sr-only">Examples: </span>
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
          </li>
        ))}
      </ul>
    </section>
  );
}

function Exploring() {
  return (
    <section aria-labelledby="exploring-heading" className="defer-render shell pt-28 md:pt-40">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
            Currently exploring
          </p>
          <h2 id="exploring-heading" className="mt-5 font-serif text-title">
            What I&apos;m reading, testing and <em className="text-accent">breaking on purpose.</em>
          </h2>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:col-span-8">
          {exploring.map((item) => (
            <li key={item.title} className="reveal bg-ink p-6">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
