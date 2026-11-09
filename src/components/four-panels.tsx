import { gearGeometry, gearPath } from "@/lib/engineering/gears";

import { Panel, Sfx } from "./comic";

/*
 * How every project goes: a four-panel strip, one verb per panel, each with a
 * small drafting-pen drawing that inks itself as it scrolls in. Replaces the
 * old interlude; the words are the same four, and each note is taken from
 * the services and ground rules in src/content/profile.ts.
 */
const gear = gearGeometry(12, 7);

const PANELS = [
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
        <path d={gearPath(gear, 4)} transform="translate(60 60)" />
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

export function FourPanels() {
  return (
    <section aria-labelledby="four-heading" className="defer-render relative mt-28 border-y-2 border-frame bg-ink-sunken py-14 md:mt-40 md:py-20">
      <div className="shell">
        <h2 id="four-heading" className="sr-only">
          Design, build, deploy, maintain
        </h2>
        <ol className="four-panels">
          {PANELS.map((p, i) => (
            <li key={p.verb}>
              <Panel data-print="panel" className="four-panel" style={{ "--i": i } as React.CSSProperties}>
                <span className="four-panel__no">{i + 1}</span>
                <Sfx className="four-panel__sfx" tilt={i % 2 ? 6 : -6}>
                  {p.sfx}
                </Sfx>
                <svg viewBox="0 0 120 120" aria-hidden="true" data-ink className="four-panel__art">
                  {p.art}
                </svg>
                <h3 className="four-panel__verb font-serif">{p.verb}</h3>
                <p className="four-panel__note">{p.note}</p>
              </Panel>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
