import Image from "next/image";
import Link from "next/link";

import type { Project, StatusTone } from "@/content/projects";
import { cn } from "@/lib/cn";

import { Caption, Halftone, Panel, Registration } from "./comic";
import { ShotFrame } from "./ui";

/*
 * Projects as comic chapters (homepage) and back issues (the archive). Server
 * components: every word comes from src/content/projects.ts, nothing is
 * invented, and motion is added from outside (data-print, data-ink,
 * data-count) by MotionLayer.
 */

const STAMP: Record<StatusTone, string> = { live: "stamp--live", building: "stamp--building", concept: "stamp--concept" };

/** A rubber stamp for a project's state, inked at an angle like a proof mark. */
export function Stamp({ tone, label, className }: { tone: StatusTone; label: string; className?: string }) {
  return (
    <span className={cn("stamp", STAMP[tone], className)}>
      <span className="sr-only">Status: </span>
      {label}
    </span>
  );
}

/**
 * One featured project as a page of panels: the splash (its real screen), the
 * problem, how the system works, the part that was hard, and its spec plate.
 */
export function Chapter({
  project,
  index,
  headingLevel = 3,
  label = "Chapter",
}: {
  project: Project;
  index: number;
  headingLevel?: 2 | 3;
  /** What the narration box calls this page ("Chapter", "Page"). */
  label?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const desktop = project.shots.find((s) => s.device === "desktop");
  const phone = project.shots.find((s) => s.device === "mobile");
  const flip = index % 2 === 1;
  const href = `/projects/${project.slug}`;
  const challenge = project.challenges[0];
  const n = String(index + 1).padStart(2, "0");

  return (
    <article className="chapter" style={{ "--tint": project.tint } as React.CSSProperties} aria-labelledby={`chapter-${project.slug}`}>
      <header className="chapter__head">
        <Caption>
          {label} {n}
        </Caption>
        <Heading id={`chapter-${project.slug}`} data-print className="font-serif text-title">
          <Registration>
            <Link href={href} className="chapter__title-link">
              {project.name}
            </Link>
          </Registration>
        </Heading>
        <Stamp tone={project.status.tone} label={project.status.label} />
      </header>

      <div className={cn("chapter__grid", flip && "chapter__grid--flip")}>
        {/* Splash panel: the real product, in the project's own colour. */}
        <Panel data-print="panel" tone="plain" className="chapter__splash">
          <Halftone tone="red" from={flip ? "left" : "right"} className="chapter__splash-dots" />
          <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block">
            {desktop ? (
              <ShotFrame shot={desktop} tint={project.tint} sizes="(min-width: 1024px) 700px, 92vw" className="chapter__shot" />
            ) : (
              <div className="grid aspect-[16/10] place-items-center">
                <p className="font-serif text-4xl">{project.name}</p>
              </div>
            )}
          </Link>
          {phone && (
            <div className="chapter__phone" data-speed="-10">
              <Image src={phone.image} alt="" sizes="160px" className="h-auto w-full" />
            </div>
          )}
          <p className="chapter__splash-caption">{project.summary}</p>
        </Panel>

        {/* The problem, as a narration box. */}
        <Panel data-print="panel" tone="red" className="chapter__problem">
          <p className="chapter__label">The problem</p>
          <p className="chapter__lead">{project.problem[0]}</p>
        </Panel>

        {/* How it works: the architecture as a numbered parts list on drafting paper. */}
        <Panel data-print="panel" tone="blueprint" className="chapter__how">
          <p className="chapter__label chapter__label--blue">How it works</p>
          <ol className="chapter__parts">
            {project.architecture.slice(0, 4).map((part, i) => (
              <li key={part.label}>
                <span className="chapter__part-no">{i + 1}</span>
                <span>
                  <span className="chapter__part-name">{part.label}</span>
                  <span className="chapter__part-detail">{part.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* The interesting part: the hardest problem and how it was solved. */}
        {challenge && (
          <Panel data-print="panel" className="chapter__twist">
            <p className="chapter__label">The hard part · {challenge.title}</p>
            <p className="chapter__body">{challenge.solution}</p>
          </Panel>
        )}

        {/* The spec plate: stack and verified counts from the repository. */}
        <Panel data-print="panel" className="chapter__spec">
          <p className="chapter__label">Spec plate</p>
          {project.facts.length > 0 && (
            <dl className="chapter__facts">
              {project.facts.slice(0, 3).map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd data-count>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <ul className="chapter__stack">
            {project.stack.slice(0, 6).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <Link href={href} className="btn-comic btn-comic--solid chapter__cta">
            Full case study <span aria-hidden="true">→</span>
          </Link>
        </Panel>
      </div>
    </article>
  );
}

/**
 * Every project as the cover of a back issue: number, title, status stamp and
 * a real screen as the cover art, printed in the project's own colour.
 */
export function BackIssues({ projects, hrefFor = (p) => `/projects/${p.slug}` }: { projects: Project[]; hrefFor?: (p: Project) => string }) {
  return (
    <ul className="back-issues">
      {projects.map((p, i) => {
        const art = p.shots.find((s) => s.device === "desktop") ?? p.shots[0];
        return (
          <li key={p.slug} data-print="panel" className="back-issue" style={{ "--tint": p.tint } as React.CSSProperties}>
            <Link href={hrefFor(p)} className="back-issue__link">
              <span className="back-issue__masthead">
                <span className="back-issue__no">#{String(i + 1).padStart(2, "0")}</span>
                <span className="back-issue__kind">{p.kind}</span>
              </span>
              <span className="back-issue__art" aria-hidden="true">
                {art && <Image src={art.image} alt="" sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" className="h-full w-full object-cover object-top" />}
              </span>
              <span className="back-issue__title font-serif">{p.name}</span>
              <span className="back-issue__summary">{p.summary}</span>
              <Stamp tone={p.status.tone} label={p.status.label.split("·")[0].trim()} className="back-issue__stamp" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
