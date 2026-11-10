import { Fragment } from "react";

import { BackIssues } from "@/components/chapters";
import { Caption, Halftone, Registration } from "@/components/comic";
import { HeroMotion } from "@/components/hero-motion";
import { Rooftop } from "@/components/rooftop";
import { SpiderWeb } from "@/components/spider-web";
import { SwingRig } from "@/components/swing-rig";
import { ToolStickers } from "@/components/tool-stickers";
import { ButtonLink, JsonLd } from "@/components/ui";
import { WebSlingerArt } from "@/components/web-slinger";
import { Workbench } from "@/components/workbench";
import { Highlighter } from "@/components/ui/highlighter";
import { projects } from "@/content/projects";
import { skills } from "@/content/profile";
import { site } from "@/content/site";
import { homePageGraph } from "@/lib/schema";

/*
 * The homepage plays like a film, in five scenes: the opening title (the
 * web-slinger swings in over the tools he works with), the workbench to push
 * things around on, what's now showing (the featured projects, as comic covers
 * that open the projects comic on their page), the rooftop where the four ways
 * every project goes hang from a web, and the end credits. Depth lives on the other pages: the work
 * in the comic (/projects), the person and the toolbox on /about, the
 * commissions on /contact, the experiments in /lab. Every word comes from
 * src/content.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageGraph()} />
      <Cover />
      <Workbench />
      <NowShowing />
      <Rooftop />
      <EndCredits />
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
        <div className="lg:col-span-8">
          <p data-hero className="flex flex-wrap items-center gap-3">
            <Caption as="span">AMIGODEV Pictures presents</Caption>
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
              Read the comic
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

      {/* The hero swings in on a web line; the tools hang from a strand below. Both sway when you scroll. */}
      <SwingRig className="cover__stage" data-anim-zone="">
        <div className="swinger" aria-hidden="true">
          <div className="swinger__idle">
            <WebSlingerArt className="swinger__art" />
          </div>
        </div>
        <div className="shell">
          <ToolStickers />
        </div>
      </SwingRig>
    </HeroMotion>
  );
}

function NowShowing() {
  const featured = projects.filter((p) => p.featured);
  return (
    <section aria-labelledby="showing-heading" className="defer-render shell pt-20 md:pt-28" data-buddy="Four real projects. Pick a cover and the comic opens right on that page!">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Caption>Scene 03 · Now showing</Caption>
          <h2 id="showing-heading" data-print className="mt-5 font-serif text-headline">
            <Registration>
              {featured.length} stories, <em className="text-accent">all real.</em>
            </Registration>
          </h2>
          <p className="mt-4 max-w-xl text-fg-muted">
            Schools, a kitchen, a campus sports community and a social network, each with real users and rules that
            have to hold. Pick a cover to open the comic on its page.
          </p>
        </div>
        <ButtonLink href="/projects" variant="outline">
          Read the whole issue
        </ButtonLink>
      </div>
      <div className="mt-10">
        <BackIssues projects={featured} hrefFor={(p) => `/projects#${p.slug}`} />
      </div>
    </section>
  );
}

/** The end credits: who made it, with what, and where to go next. They roll as they come into view. */
function EndCredits() {
  const tools = [...new Set(skills.flatMap((g) => g.items))].slice(0, 12);
  const credits: [string, string][] = [
    ["Written, designed & built by", site.name],
    ["Disciplines", site.disciplines.join(" · ")],
    ["Engineering training", "Mechanical Engineering, EKSU"],
    ["Special effects", "GSAP · SVG · a lot of CSS"],
    ["Tools on set", tools.join(" · ")],
    ["Stunt double", "The spider-bot"],
    ["Coming next", site.direction],
  ];
  return (
    <section aria-labelledby="credits-heading" className="end-credits defer-render letterbox relative isolate mt-24 overflow-hidden md:mt-32" data-buddy="Roll credits! Stay for the after-credits scene. Spoiler: it's a contact button.">
      <Halftone tone="blue" from="bottom" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 opacity-40" />
      <div className="shell py-20 text-center md:py-28">
        <Caption className="mx-auto">Scene 05 · Roll credits</Caption>
        <h2 id="credits-heading" className="sr-only">
          Credits
        </h2>
        <dl className="end-credits__roll">
          {credits.map(([role, name]) => (
            <div key={role} className="reveal">
              <dt>{role}</dt>
              <dd className="font-serif">{name}</dd>
            </div>
          ))}
        </dl>
        <p className="reveal mt-16 font-serif text-headline">
          <Registration>
            Your project <em className="text-accent">in the sequel?</em>
          </Registration>
        </p>
        <div className="reveal mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact">Get in touch</ButtonLink>
          <ButtonLink href="/about" variant="outline">
            About me
          </ButtonLink>
          {site.resume && (
            <ButtonLink href={site.resume} variant="ghost" external>
              Résumé
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
