import type { Metadata } from "next";
import Link from "next/link";

import { GameLoader } from "@/game/loader";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/play",
  title: "DEBUG.EXE — a tiny arcade game",
  description: "Defend a production server from incoming bugs. A small arcade game built for the AMIGODEV portfolio.",
});

const controls: [string, string, string][] = [
  ["Move", "← → or A D", "Drag on the screen, or ◀ ▶"],
  ["Fire", "Space (or ↑ / W)", "Touch the screen, or FIRE"],
  ["Pause", "P or Esc", "Pause button"],
];

const bugs: [string, string][] = [
  ["Beetle", "Slow and steady. One patch."],
  ["Spider", "Zig-zags. Fast."],
  ["Memory leak", "Takes three patches, then splits."],
  ["Heisenbug", "Only there when you're not looking."],
];

export default function PlayPage() {
  return (
    <div className="shell pt-6 md:pt-12">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:order-2 lg:col-span-7">
          <GameLoader />
        </div>

        <div className="lg:order-1 lg:col-span-5 lg:pt-6">
          <p className="label">Arcade · Sheet 404</p>
          <h1 className="mt-4 font-sans text-5xl font-semibold tracking-tight md:text-6xl">
            DEBUG<span className="text-accent">.EXE</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-muted">
            Bugs are heading for production. Patch them before they reach the server, grab coffee for rapid fire and
            hotfixes for repairs, and survive as many sprints as you can.
          </p>

          <h2 className="label mt-10">Controls</h2>
          <dl className="mt-3 border-t border-line text-sm">
            {controls.map(([action, keys, touch]) => (
              <div key={action} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-line py-3 sm:grid-cols-[4.5rem_1fr_1fr]">
                <dt className="text-fg">{action}</dt>
                <dd className="font-mono text-xs text-fg-muted">{keys}</dd>
                <dd className="col-start-2 font-mono text-xs text-fg-muted sm:col-start-auto">{touch}</dd>
              </div>
            ))}
          </dl>

          <h2 className="label mt-10">Known issues</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {bugs.map(([name, note]) => (
              <li key={name} className="flex gap-3">
                <span className="w-28 shrink-0 text-fg">{name}</span>
                <span className="text-fg-muted">{note}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-fg-subtle">
            Your best score stays on this device. Nothing is sent anywhere.{" "}
            <Link href="/" className="text-fg underline decoration-line-strong underline-offset-4">
              Back to the portfolio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
