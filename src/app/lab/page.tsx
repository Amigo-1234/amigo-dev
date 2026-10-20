import type { Metadata } from "next";
import Link from "next/link";

import { ExperimentCard } from "@/components/lab";
import { experiments } from "@/content/lab";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/lab",
  title: "Lab",
  description:
    "AMIGODEV Lab: working experiments lifted out of real projects — calculated prayer times, a bilingual result sheet, a match clock that can't drift — and the DEBUG.EXE arcade game.",
});

const rules: [string, string][] = [
  ["Everything works", "No mock-ups. If an experiment is on this bench, you can use it."],
  ["Real logic", "Each tool runs code taken from a shipped project, linked to its source, on made-up data."],
  ["Stays on your device", "Nothing you type or score is sent anywhere."],
];

export default function LabPage() {
  const [game, ...tools] = experiments;
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="grid-paper fade-edges absolute inset-x-0 top-0 -z-10 h-[38rem]" />
      <div className="shell pt-12 md:pt-20">
        <header className="grid gap-8 border-b border-line pb-12 md:grid-cols-12 md:pb-16">
          <div className="md:col-span-8">
            <p className="label">AMIGODEV Lab · Sheet L-01</p>
            <h1 className="mt-6 font-serif text-display">
              The <em className="text-accent">Lab.</em>
            </h1>
          </div>
          <p className="self-end text-lg leading-relaxed text-fg-muted md:col-span-4">
            Small, working pieces lifted out of the systems I build, plus a game. A place to poke at the interesting
            parts without needing an account on any of them.
          </p>
        </header>

        <section aria-labelledby="bench-heading" className="pt-12 md:pt-16">
          <h2 id="bench-heading" className="label">
            On the bench · {experiments.length} working
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((e) => (
              <ExperimentCard key={e.slug} experiment={e} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <ExperimentCard experiment={game} className="lg:col-span-2 lg:[&>div:first-child]:aspect-[3/1]" />
            <div className="flex flex-col justify-between rounded-2xl border border-dashed border-line-strong p-6">
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

        <section aria-labelledby="rules-heading" className="mt-24 border-t border-line pt-10 md:mt-32">
          <h2 id="rules-heading" className="label">
            Lab rules
          </h2>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            {rules.map(([title, body], i) => (
              <li key={title} className="bg-ink p-6">
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
