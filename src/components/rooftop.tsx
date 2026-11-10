import Link from "next/link";

import { projects } from "@/content/projects";
import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

import { Caption, Registration, Sfx } from "./comic";
import { Skyline } from "./skyline";
import { SpiderBotArt } from "./spider-bot";

/*
 * How I work, as a scene from a superhero film: night over the city, a
 * rooftop with a water tower and a billboard, a sign hung from the ledge on
 * two strands of web, and the web branching down to the four ways every
 * project goes (design, build, deploy, maintain), each a round panel with its
 * drafting-pen drawing.
 */

const gear = gearGeometry(12, 7);

export const WAYS = [
  {
    verb: "Design",
    note: "Accounts, data, permissions and the workflows behind them.",
    sfx: "Scritch",
    art: (
      <>
        {/* A pair of compasses swinging an arc. */}
        <path d="M60 18 L38 92 M60 18 L82 92" />
        <circle cx="60" cy="18" r="5" />
        <path d="M30 96 Q60 112 92 96" strokeDasharray="4 5" />
      </>
    ),
  },
  {
    verb: "Build",
    note: "Anything that touches money, data or permissions is tested, not trusted.",
    sfx: "Clank",
    art: (
      <>
        <path d={compactPath(gearPath(gear, 4))} transform="translate(60 60)" />
        <circle cx="60" cy="60" r="12" />
      </>
    ),
  },
  {
    verb: "Deploy",
    note: "Automated checks, preview environments and safe rollbacks.",
    sfx: "Whoosh",
    art: (
      <>
        {/* A crane hook lifting a crate into place. */}
        <path d="M18 104 H102 M30 104 V24 H96 M30 40 L46 24 M78 24 V46" />
        <path d="M78 46 q8 0 8 8 t-8 8" />
        <rect x="64" y="66" width="28" height="22" />
      </>
    ),
  },
  {
    verb: "Maintain",
    note: "Moving older apps to better infrastructure and keeping them healthy.",
    sfx: "Tink",
    art: (
      <>
        {/* An open-ended spanner on a nut. */}
        <path d="M30 92 L70 52" strokeWidth="9" />
        <path d="M66 40 a16 16 0 1 0 22 22 l-8-8 4-8-8-8z" />
        <path d="M84 36 l10-6 6 10-10 6z" />
      </>
    ),
  },
];


export function Rooftop() {
  return (
    <section aria-labelledby="roof-heading" className="roof defer-render">
      <Skyline seed={11} className="roof__city" />

      <div className="shell relative">
        {/* The sign, hung from the ledge on two strands of web. */}
        <div className="roof__sign-rig">
          <span aria-hidden="true" className="roof__strand roof__strand--l" />
          <span aria-hidden="true" className="roof__strand roof__strand--r" />
          <div className="roof__sign">
            <Caption className="mx-auto">Scene 04 · How I work</Caption>
            <h2 id="roof-heading" className="mt-4 font-serif text-headline">
              <Registration>
                Four habits. <em className="text-accent">{projects.length} case studies.</em>
              </Registration>
            </h2>
            <span aria-hidden="true" className="roof__sign-bot">
              <SpiderBotArt />
            </span>
          </div>
        </div>

        {/* The web branches from the sign down to each way. */}
        <svg viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true" className="roof__branches">
          <path d="M500 0 V40 M125 90 V40 H875 V90 M375 40 V90 M625 40 V90" />
        </svg>

        <ol className="roof__ways">
          {WAYS.map((w, i) => (
            <li key={w.verb} className="way">
              <div className="way__disc">
                <svg viewBox="0 0 120 120" aria-hidden="true" data-ink className="way__art">
                  {w.art}
                </svg>
                <span className="way__seal" aria-hidden="true">
                  {i + 1}
                </span>
                <Sfx className="way__sfx" tilt={i % 2 ? 8 : -8}>
                  {w.sfx}
                </Sfx>
              </div>
              <p className="label mt-6">Way {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-serif text-4xl leading-none">{w.verb}</h3>
              <p className="mx-auto mt-3 max-w-[16rem] text-fg-muted">{w.note}</p>
            </li>
          ))}
        </ol>
        <p className="mt-14 text-center">
          <Link href="/projects" className="roof__proof">
            See the proof <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
