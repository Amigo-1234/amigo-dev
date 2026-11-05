import type { Metadata } from "next";
import { Suspense } from "react";

import { ExperimentPage } from "@/components/lab";
import { getExperiment } from "@/content/lab";
import { BeamDeflection, BeamDeflectionFromURL, DEFAULT_BEAM } from "@/lab/beam-deflection";
import { pageMetadata } from "@/lib/metadata";

const experiment = getExperiment("beam-deflection")!;

export const metadata: Metadata = pageMetadata({
  path: experiment.href,
  title: `${experiment.title} · Lab`,
  description:
    "Interactive beam deflection: simply supported and cantilever beams, point and uniform loads, with shear, moment, stress and the deflected shape.",
});

const v = (s: string) => <var>{s}</var>;

const cases: Array<{ name: string; deflection: React.ReactNode; moment: React.ReactNode }> = [
  {
    name: "Simply supported, point load P at a (b = L − a)",
    deflection: (
      <>
        δ<sub>max</sub> = {v("P")}{v("b")}({v("L")}² − {v("b")}²)<sup>3/2</sup> / (9√3·{v("E")}{v("I")}{v("L")}) at {v("x")} = √(({v("L")}² − {v("b")}²)/3), for {v("a")} ≥ {v("b")}
      </>
    ),
    moment: (
      <>
        {v("M")}
        <sub>max</sub> = {v("P")}{v("a")}{v("b")} / {v("L")} under the load
      </>
    ),
  },
  {
    name: "Simply supported, uniform load w",
    deflection: (
      <>
        δ<sub>max</sub> = 5{v("w")}{v("L")}⁴ / 384{v("E")}{v("I")} at midspan
      </>
    ),
    moment: (
      <>
        {v("M")}
        <sub>max</sub> = {v("w")}{v("L")}² / 8
      </>
    ),
  },
  {
    name: "Cantilever, point load P at the tip",
    deflection: (
      <>
        δ<sub>max</sub> = {v("P")}{v("L")}³ / 3{v("E")}{v("I")} at the tip
      </>
    ),
    moment: (
      <>
        {v("M")} = −{v("P")}{v("L")} at the fixed end
      </>
    ),
  },
  {
    name: "Cantilever, uniform load w",
    deflection: (
      <>
        δ<sub>max</sub> = {v("w")}{v("L")}⁴ / 8{v("E")}{v("I")} at the tip
      </>
    ),
    moment: (
      <>
        {v("M")} = −{v("w")}{v("L")}² / 2 at the fixed end
      </>
    ),
  },
];

function Equations() {
  return (
    <section aria-labelledby="equations-heading" className="mt-16 grid gap-6 border-t border-line pt-10 md:mt-24 md:grid-cols-12">
      <h2 id="equations-heading" className="label md:col-span-3">
        Equations
      </h2>
      <div className="md:col-span-9">
        <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {[
            ["Curvature", <>{v("E")}{v("I")} d²δ/d{v("x")}² = −{v("M")}({v("x")})</>, "The beam bends in proportion to the moment and inversely to its stiffness EI. Integrating twice, with the supports' conditions, gives the deflected shape."],
            ["Section", <>{v("I")} = {v("b")}{v("h")}³ / 12</>, "Second moment of area of a solid rectangle. Depth counts cubed: doubling h makes the beam eight times stiffer."],
            ["Bending stress", <>σ = {v("M")}{v("c")} / {v("I")},  {v("c")} = {v("h")}/2</>, "The largest stress is at the top and bottom faces, where the moment is largest."],
          ].map(([name, formula, note]) => (
            <div key={name as string} className="bg-ink p-5">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle">{name}</dt>
              <dd className="mt-3">
                <p className="font-serif text-2xl leading-snug text-fg">{formula}</p>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{note}</p>
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="label pb-3 text-left">The four load cases</caption>
          <thead className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-normal">Case</th>
              <th scope="col" className="py-2 pr-4 font-normal">Maximum deflection</th>
              <th scope="col" className="py-2 font-normal">Largest moment</th>
            </tr>
          </thead>
          <tbody className="text-fg-muted">
            {cases.map((c) => (
              <tr key={c.name} className="border-b border-line align-top">
                <th scope="row" className="py-3 pr-4 font-normal text-fg">
                  {c.name}
                </th>
                <td className="py-3 pr-4">{c.deflection}</td>
                <td className="py-3">{c.moment}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="mt-4 text-sm text-fg-subtle">Deflection is positive downwards. Sagging moments are positive, so a cantilever&apos;s moments are negative.</p>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <ExperimentPage experiment={experiment} details={<Equations />}>
      {/* The static page carries the default beam; a shared link's settings apply once the page loads. */}
      <Suspense fallback={<BeamDeflection initial={DEFAULT_BEAM} />}>
        <BeamDeflectionFromURL />
      </Suspense>
    </ExperimentPage>
  );
}
