import type { Metadata } from "next";
import { Suspense } from "react";

import { ExperimentPage } from "@/components/lab";
import { getExperiment } from "@/content/lab";
import { DEFAULT_GEARS, GearTrain, GearTrainFromURL } from "@/lab/gear-train";
import { pageMetadata } from "@/lib/metadata";

const experiment = getExperiment("gear-train")!;

export const metadata: Metadata = pageMetadata({
  path: experiment.href,
  title: `${experiment.title} · Lab`,
  description:
    "Interactive spur gear train with true involute teeth: tooth counts, module, speed and torque, with ratio, direction, contact ratio and efficiency.",
});

const equations: Array<{ name: string; formula: React.ReactNode; note: string }> = [
  {
    name: "Pitch diameter",
    formula: (
      <>
        <var>d</var> = <var>m</var>·<var>N</var>
      </>
    ),
    note: "Module m (mm) times the number of teeth. Gears only mesh when they share a module.",
  },
  {
    name: "Centre distance",
    formula: (
      <>
        <var>a</var> = <var>m</var>(<var>N</var>
        <sub>1</sub> + <var>N</var>
        <sub>2</sub>) / 2
      </>
    ),
    note: "The sum of the two pitch radii: the pitch circles roll on each other without slipping.",
  },
  {
    name: "Speed",
    formula: (
      <>
        <var>n</var>
        <sub>2</sub> = <var>n</var>
        <sub>1</sub> · <var>N</var>
        <sub>1</sub> / <var>N</var>
        <sub>2</sub>
      </>
    ),
    note: "Equal pitch-line speed on both gears. Every external mesh reverses the direction; an idler changes direction but not the ratio.",
  },
  {
    name: "Torque",
    formula: (
      <>
        <var>T</var>
        <sub>k</sub> = <var>T</var>
        <sub>1</sub> · η<sup>k</sup> · <var>N</var>
        <sub>k</sub> / <var>N</var>
        <sub>1</sub>
      </>
    ),
    note: "Power in equals power out plus losses: T·ω falls by the factor η at each of the k meshes before gear k.",
  },
  {
    name: "Base circle",
    formula: (
      <>
        <var>r</var>
        <sub>b</sub> = <var>r</var> cos 20°
      </>
    ),
    note: "The tooth flank is the involute of this circle: the path traced by the end of a taut string unwound from it.",
  },
  {
    name: "Contact ratio",
    formula: (
      <>
        ε = (√(<var>r</var>
        <sub>a1</sub>² − <var>r</var>
        <sub>b1</sub>²) + √(<var>r</var>
        <sub>a2</sub>² − <var>r</var>
        <sub>b2</sub>²) − <var>a</var> sin 20°) / (π<var>m</var> cos 20°)
      </>
    ),
    note: "The average number of tooth pairs in contact. Below 1 the gears lose contact between teeth; about 1.2 is the usual minimum.",
  },
];

function Equations() {
  return (
    <section aria-labelledby="equations-heading" className="mt-16 grid gap-6 border-t border-line pt-10 md:mt-24 md:grid-cols-12">
      <h2 id="equations-heading" className="label md:col-span-3">
        Equations
      </h2>
      <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 md:col-span-9">
        {equations.map((e) => (
          <div key={e.name} className="bg-ink p-5">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle">{e.name}</dt>
            <dd className="mt-3">
              <p className="font-serif text-2xl leading-snug text-fg">{e.formula}</p>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{e.note}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function Page() {
  return (
    <ExperimentPage experiment={experiment} details={<Equations />}>
      {/* The static page carries the default train; a shared link's settings apply once the page loads. */}
      <Suspense fallback={<GearTrain initial={DEFAULT_GEARS} />}>
        <GearTrainFromURL />
      </Suspense>
    </ExperimentPage>
  );
}
