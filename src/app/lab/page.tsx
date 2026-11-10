import type { Metadata } from "next";
import Link from "next/link";

import { ExperimentCard } from "@/components/lab";
import { experiments } from "@/content/lab";
import { pageMetadata } from "@/lib/metadata";
import { Caption } from "@/components/comic";

export const metadata: Metadata = pageMetadata({
  path: "/lab",
  title: "Lab",
  description:
    "AMIGODEV Lab: working pieces from real projects, engineering instruments with real calculations and stated assumptions, and the DEBUG.EXE game.",
});

const rules: [string, string][] = [
  ["Everything works", "No mock-ups. If an experiment is on this bench, you can use it."],
  ["Honest sources", "Project tools run code taken from a shipped project, linked to its source. Instruments are built from first principles and tested against worked examples."],
  ["Stays on your device", "Nothing you type or score is sent anywhere."],
];

export default function LabPage() {
  const game = experiments.find((e) => e.kind === "Game")!;
  const tools = experiments.filter((e) => e.origin);
  const instruments = experiments.filter((e) => e.family === "instrument");
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="grid-paper fade-edges absolute inset-x-0 top-0 -z-10 h-[38rem]" />
      <div className="shell pt-12 md:pt-20">
        <header className="grid gap-8 border-b border-line pb-12 md:grid-cols-12 md:pb-16" data-buddy="Welcome to the lab. The calculators are real, so handle with care.">
          <div className="md:col-span-8">
            <Caption>The workshop · AMIGODEV Lab</Caption>
            <h1 className="reg mt-6 font-serif text-display">
              The <em className="text-accent">Lab.</em>
            </h1>
          </div>
          <p className="self-end text-lg leading-relaxed text-fg-muted md:col-span-4">
            Small, working pieces lifted out of the systems I build, plus a game. A place to poke at the interesting
            parts without needing an account on any of them.
          </p>
        </header>

        <section aria-labelledby="bench-heading" className="pt-12 md:pt-16">
          <h2 id="bench-heading" className="caption-box">
            On the bench · {experiments.length} working
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((e) => (
              <ExperimentCard key={e.slug} experiment={e} />
            ))}
          </div>

          <div className="mt-16 grid gap-6 border-t border-line pt-10 md:mt-20 md:grid-cols-12">
            <div className="md:col-span-4">
              <h3 className="font-serif text-title">Engineering instruments</h3>
              <p className="mt-4 text-fg-muted">
                From my Mechanical Engineering studies: working models with their equations and assumptions on the page.
                Educational, not design tools.
              </p>
            </div>
            <div className="grid gap-6 md:col-span-8 md:grid-cols-2">
              {instruments.map((e) => (
                <ExperimentCard key={e.slug} experiment={e} />
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ExperimentCard experiment={game} className="lg:col-span-2 lg:[&>div:first-child]:aspect-[3/1]" />
            <div className="panel origin-panel--next flex flex-col justify-between p-6">
              <div>
                <p className="label">Bench space</p>
                <p className="mt-3 font-serif text-3xl leading-tight">The next experiment goes here.</p>
              </div>
              <p className="mt-6 text-sm text-fg-muted">
                New pieces are added when they work end to end, not before. Have an idea worth building?{" "}
                <Link href="/contact" className="link-underline text-fg">
                  Tell me
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="rules-heading" className="mt-24 border-t-2 border-frame pt-10 md:mt-32">
          <h2 id="rules-heading" className="caption-box">
            Lab rules
          </h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {rules.map(([title, body], i) => (
              <li key={title} data-print="panel" className="panel panel--blueprint p-6">
                <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 font-medium text-fg">{title}</p>
                <p className="mt-2 text-sm text-fg-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
