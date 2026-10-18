import Link from "next/link";

import { FeaturedProject, ProjectCard } from "@/components/project-cards";
import { SystemDrawing } from "@/components/system-drawing";
import { ButtonLink, JsonLd, SectionHeading } from "@/components/ui";
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
          affiliation: { "@type": "CollegeOrUniversity", name: "Ekiti State University" },
          knowsAbout: ["Web development", "Next.js", "TypeScript", "PostgreSQL", "Supabase", "Firebase", "Vercel"],
        }}
      />
      <Hero />

      <section aria-labelledby="work-heading" className="shell pt-24 md:pt-36">
        <SectionHeading
          index="01"
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

      <Capabilities />
      <Journey />
      <WorkingWithAI />
      <Services />
      <Exploring />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="grid-paper fade-edges absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="glow-drift absolute -top-40 right-[-10%] -z-10 size-[42rem] rounded-full bg-accent opacity-[0.07] blur-[120px]"
      />

      <div className="shell grid items-center gap-12 pb-16 pt-12 md:pt-20 lg:grid-cols-12 lg:gap-6 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="rise label flex flex-wrap items-center gap-x-3 gap-y-1" style={{ "--i": 0 } as React.CSSProperties}>
            <span className="text-fg">{site.name}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            <span>{site.role}</span>
          </p>

          <h1 id="hero-title" className="mt-7 font-serif text-display">
            <span className="rise block" style={{ "--i": 1 } as React.CSSProperties}>
              Engineering ideas
            </span>
            <span className="rise block" style={{ "--i": 2 } as React.CSSProperties}>
              into systems
            </span>
            <span className="rise block" style={{ "--i": 3 } as React.CSSProperties}>
              that <em className="text-accent">hold up.</em>
            </span>
          </h1>

          <p className="rise mt-8 max-w-xl text-lg leading-relaxed text-fg-muted md:text-xl" style={{ "--i": 4 } as React.CSSProperties}>
            I build modern web applications, design the databases and permissions behind them, deploy them and keep them
            running — for schools, businesses and communities in Nigeria.
          </p>

          <div className="rise mt-10 flex flex-wrap items-center gap-3" style={{ "--i": 5 } as React.CSSProperties}>
            <ButtonLink href="/projects">Explore my work</ButtonLink>
            <ButtonLink href="/about" variant="outline">
              About me
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Get in touch
            </ButtonLink>
            {site.resume && (
              <ButtonLink href={site.resume} variant="ghost" external>
                Résumé
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="float-slow">
            <SystemDrawing className="mx-auto w-full max-w-[34rem] text-fg" />
          </div>
        </div>
      </div>

      {/* Title block, as on an engineering drawing */}
      <div className="shell pb-6">
        <dl className="rise grid grid-cols-2 border border-line text-sm md:grid-cols-4" style={{ "--i": 6 } as React.CSSProperties}>
          {[
            ["Discipline", site.disciplines.join(" · ")],
            ["Studying", "Mechanical Engineering, EKSU"],
            ["Stack", "Next.js · TypeScript · PostgreSQL"],
            ["Direction", site.direction],
          ].map(([term, value], i) => (
            <div
              key={term}
              className={`border-line px-4 py-3.5 ${i % 2 === 0 ? "border-r" : "md:border-r"} ${i < 2 ? "border-b md:border-b-0" : ""} ${i === 3 ? "md:border-r-0" : ""}`}
            >
              <dt className="label">{term}</dt>
              <dd className="mt-1.5 text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section aria-labelledby="skills-heading" className="shell pt-28 md:pt-40">
      <SectionHeading
        index="02"
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
          <div key={group.title} className="reveal flex flex-col border-b border-r border-line p-6 md:p-8">
            <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-6 font-serif text-3xl">{group.title}</h3>
            <p className="mt-3 text-fg-muted">{group.blurb}</p>
            <ul className="mt-6 flex flex-wrap gap-1.5">
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
    <section aria-labelledby="journey-heading" className="relative mt-28 border-y border-line bg-ink-sunken py-24 md:mt-40 md:py-32">
      <div className="shell">
        <SectionHeading
          index="03"
          label="Trajectory"
          id="journey-heading"
          title={
            <>
              An engineer&apos;s path <em className="text-accent">into software.</em>
            </>
          }
          intro="A progression of interests and skills, not a list of titles. The degree is still in progress, and DevOps is where I'm heading."
        />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
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
    <section aria-labelledby="ai-heading" className="shell pt-28 md:pt-40">
      <SectionHeading
        index="04"
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
    <section id="services" aria-labelledby="services-heading" className="shell scroll-mt-24 pt-28 md:pt-40">
      <SectionHeading
        index="05"
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
    <section aria-labelledby="exploring-heading" className="shell pt-28 md:pt-40">
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
