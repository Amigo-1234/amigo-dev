import type { Metadata } from "next";
import Link from "next/link";

import { LocalTime } from "@/components/local-time";
import { Portrait } from "@/components/portrait";
import { ButtonLink, JsonLd, SectionHeading } from "@/components/ui";
import { aiWorkflow, interests, journey, languages, story } from "@/content/profile";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { profilePageGraph } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "Muftau Idris (AMIGODEV) is a Nigerian full-stack developer and Mechanical Engineering student at Ekiti State University, working toward DevOps engineering.",
});

const facts: [string, string][] = [
  ["Name", site.name],
  ["Brand", site.brand],
  ["Heritage", "Nigerian · Yoruba"],
  ["Roots", "Lagos"],
  ["Studying", "Mechanical Engineering, Ekiti State University"],
  ["Builds", "Full-stack web applications"],
  ["Direction", site.direction],
];

function InterestMark({ mark }: { mark: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.25, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (mark) {
    case "football":
      return (
        <g {...common}>
          <circle cx="16" cy="16" r="11" />
          <path d="m16 10.5 4.2 3-1.6 5h-5.2l-1.6-5Z" />
          <path d="M16 10.5V5.2M20.2 13.5l5-1.8M18.6 18.5l3 4.3M13.4 18.5l-3 4.3M11.8 13.5l-5-1.8" />
        </g>
      );
    case "chess":
      return (
        <g {...common}>
          <path d="M10 27h12M11.5 27l1-6h7l1 6M12.5 21l-1.5-9h10l-1.5 9M11 12V7h2.5v2h2V7h1v2h2V7H21v5" />
        </g>
      );
    case "physics":
      return (
        <g {...common}>
          <ellipse cx="16" cy="16" rx="11" ry="4.5" />
          <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(60 16 16)" />
          <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(-60 16 16)" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </g>
      );
    case "ai":
      return (
        <g {...common}>
          <circle cx="8" cy="9" r="2.5" />
          <circle cx="8" cy="23" r="2.5" />
          <circle cx="24" cy="16" r="2.5" />
          <circle cx="16" cy="16" r="2.5" />
          <path d="M10.3 10.2 13.8 14.6M10.3 21.8l3.5-4.4M18.5 16h3" />
        </g>
      );
    case "media":
      return (
        <g {...common}>
          <rect x="5" y="8" width="22" height="16" rx="2.5" />
          <path d="m14 12.5 5.5 3.5-5.5 3.5Z" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <path d="M6 8h14v10h-7l-4 3.5V18H6Z" />
          <path d="M20 12h6v9h-2.5v3l-3.5-3h-5" />
        </g>
      );
  }
}

export default function AboutPage() {
  const featured = projects.filter((p) => p.featured);
  return (
    <>
      <JsonLd data={profilePageGraph()} />

      <header className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="grid-paper fade-edges absolute inset-0 -z-10" />
        <div className="shell grid items-start gap-14 pt-12 md:pt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="label">About · Sheet 02</p>
            <h1 className="mt-6 font-serif text-display">
              {/* The {" "} keeps words apart in the raw HTML text crawlers read; it doesn't change the layout. */}
              <span className="rise block">An engineering</span>{" "}
              <span className="rise block" style={{ "--i": 1 } as React.CSSProperties}>
                student who
              </span>{" "}
              <span className="rise block" style={{ "--i": 2 } as React.CSSProperties}>
                ships <em className="text-accent">software.</em>
              </span>
            </h1>

            {/* Phones and tablets: a compact figure with its caption beside it */}
            <div className="rise mt-10 grid grid-cols-[8.5rem_1fr] items-end gap-5 pl-2.5 sm:grid-cols-[11rem_1fr] lg:hidden" style={{ "--i": 3 } as React.CSSProperties}>
              <Portrait caption={false} sizes="(min-width: 640px) 11rem, 8.5rem" />
              <p className="border-t border-line pt-3 pb-5">
                <span className="label block">Fig. 01</span>
                <span className="mt-2 block font-serif text-2xl leading-none text-fg">{site.name}</span>
                <span className="mt-1.5 block text-xs text-fg-muted">Full-stack developer · {site.brand}</span>
                <span className="mt-2 flex items-center gap-2 font-mono text-[0.625rem] tracking-wide text-fg-muted">
                  <span>Nigeria</span>
                  <span aria-hidden="true" className="h-px w-3 bg-line-strong" />
                  <LocalTime />
                </span>
              </p>
            </div>

            <dl className="rise mt-12 border border-line text-sm" style={{ "--i": 3 } as React.CSSProperties}>
              {facts.map(([term, value]) => (
                <div key={term} className="grid grid-cols-[7rem_1fr] border-b border-line last:border-b-0">
                  <dt className="label border-r border-line px-4 py-3">{term}</dt>
                  <dd className="px-4 py-3 text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Large screens: a full editorial column. Not preloaded, so phones never fetch it. */}
          <div className="rise hidden w-full max-w-[22rem] justify-self-end pr-7 lg:col-span-5 lg:mt-24 lg:block" style={{ "--i": 2 } as React.CSSProperties}>
            <Portrait sizes="(min-width: 1024px) 22rem, 1px" />
          </div>
        </div>
      </header>

      <section aria-label="My story" className="shell mt-20 md:mt-28">
        <div className="grid gap-10 md:grid-cols-12">
          <p className="label md:col-span-3">The short version</p>
          <div className="space-y-6 md:col-span-9">
            {story.map((p, i) => (
              <p
                key={p}
                className={
                  i === 0
                    ? "font-serif text-[1.75rem] leading-snug text-fg md:text-[2.15rem]"
                    : "reveal max-w-3xl text-lg leading-relaxed text-fg-muted"
                }
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="path-heading" className="shell mt-28 md:mt-40">
        <SectionHeading index="01" label="Path" id="path-heading" title={<>How I got <em className="text-accent">here.</em></>} />
        <ol className="relative mt-14 ml-1 border-l border-line">
          {journey.map((step, i) => {
            const last = i === journey.length - 1;
            return (
              <li key={step.stage} className="reveal relative pb-12 pl-8 last:pb-0 md:pl-12">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[5px] top-2 size-2.5 rounded-full ${last ? "border border-dashed border-accent bg-ink" : "bg-fg"}`}
                />
                <p className={`label ${last ? "text-accent" : ""}`}>{step.state}</p>
                <h3 className={`mt-2 font-serif text-4xl ${last ? "italic text-accent" : ""}`}>{step.stage}</h3>
                <p className="mt-3 max-w-2xl text-fg-muted">{step.detail}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="languages-heading" className="shell mt-28 md:mt-40">
        <SectionHeading
          index="02"
          label="Languages"
          id="languages-heading"
          title={
            <>
              Hello, hola, bonjour, <span lang="ar" dir="rtl" className="not-italic">مرحبا</span>.
            </>
          }
          intro="English is my working language. Spanish and French I'm learning, and my Arabic is basic and growing."
        />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((l) => (
            <li key={l.name} className="reveal flex flex-col bg-ink p-6 md:p-8">
              <p lang={l.lang} dir={l.dir} className="font-serif text-5xl text-fg">
                {l.greeting}
              </p>
              <div className="mt-10 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                <p className="font-medium">
                  {l.name}
                  {l.native !== l.name && (
                    <span lang={l.lang} className="ml-2 text-sm font-normal text-fg-subtle">
                      {l.native}
                    </span>
                  )}
                </p>
                <p className={`label ${l.level === "Working language" ? "text-ok" : "text-warn"}`}>{l.level}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="principles-heading" className="shell mt-28 md:mt-40">
        <SectionHeading index="03" label="How I work" id="principles-heading" title={<>A few things I <em className="text-accent">hold to.</em></>} />
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            ["Rules live on the server.", "Prices, permissions and records are checked where the data lives, never only in the interface."],
            ["Say what is real.", "I describe software as it is: what is live, what is tested and what is still a plan."],
            ...aiWorkflow.principles.slice(0, 1).map((p) => [p, "AI tools speed me up. Review, testing and responsibility stay with me."]),
          ].map(([title, body], i) => (
            <li key={title} className="reveal rounded-xl border border-line p-6 md:p-8">
              <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-6 font-serif text-3xl leading-tight">{title}</h3>
              <p className="mt-3 text-fg-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="interests-heading" className="shell mt-28 md:mt-40">
        <SectionHeading
          index="04"
          label="Off the clock"
          id="interests-heading"
          title={
            <>
              Football, chess and <em className="text-accent">a lot of curiosity.</em>
            </>
          }
        />
        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((item) => (
            <li key={item.title} className="reveal flex gap-5 border-t border-line pt-6">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0 text-accent">
                <InterestMark mark={item.mark} />
              </svg>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1.5 text-fg-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Work and profiles" className="shell mt-28 md:mt-36">
        <div className="grid gap-12 border-t border-line pt-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <h2 className="label">Selected work</h2>
            <ul className="mt-5 border-t border-line">
              {featured.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link href={`/projects/${p.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                    <span>
                      <span className="block font-serif text-2xl leading-tight transition-colors group-hover:text-accent">{p.name}</span>
                      <span className="mt-1 block text-sm text-fg-muted">{p.summary}</span>
                    </span>
                    <span aria-hidden="true" className="text-fg-subtle transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-5">
            <h2 className="label">Find me elsewhere</h2>
            <ul className="mt-5 border-t border-line text-sm">
              {[
                { label: "GitHub", handle: "@Amigo-1234", href: site.social.github },
                { label: "LinkedIn", handle: site.name, href: site.social.linkedin },
                { label: "X", handle: site.xHandle, href: site.social.x },
              ].map((profile) => (
                <li key={profile.label} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                  <span className="label">{profile.label}</span>
                  <a href={profile.href} target="_blank" rel="me noopener noreferrer" className="link-underline text-fg">
                    {profile.handle} ↗<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <ButtonLink href="/projects">See the work</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Get in touch
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
