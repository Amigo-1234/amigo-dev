"use client";

import dynamic from "next/dynamic";

import type { TerminalData } from "./terminal";

/** Server-rendered shell shown before (or without) the interactive terminal. */
function TerminalShell() {
  return (
    <div className="glass overflow-hidden rounded-2xl font-mono text-[0.8125rem] leading-relaxed">
      <div className="flex items-center gap-3 border-b border-[var(--glass-border)] px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-accent/80" />
        </span>
        <span className="text-xs text-fg-subtle">amigo@dev: ~/portfolio</span>
      </div>
      <div className="h-80 px-4 pt-4 sm:px-5">
        <p className="text-fg">
          AMIGODEV shell <span className="text-fg-subtle">v2.1</span>
        </p>
        <p className="text-fg-muted">Loading the interactive terminal… If it doesn&apos;t appear, everything here is also on the site.</p>
      </div>
    </div>
  );
}

// The terminal is a nice extra, so its code loads after the page is interactive.
const Terminal = dynamic(() => import("./terminal").then((m) => m.Terminal), {
  ssr: false,
  loading: TerminalShell,
});

export function TerminalLazy({ data }: { data: TerminalData }) {
  return <Terminal data={data} />;
}
