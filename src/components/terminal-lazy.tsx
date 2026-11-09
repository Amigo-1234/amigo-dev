"use client";

import dynamic from "next/dynamic";

import { TerminalBar } from "./terminal-bar";

/** Server-rendered shell shown before (or without) the interactive terminal. */
function TerminalShell() {
  return (
    <div className="terminal-screen">
      <TerminalBar />
      <div className="terminal-body px-4 pt-4 sm:px-5">
        <p className="text-fg">
          AMIGODEV shell <span className="term-dim">v3.0</span>
        </p>
        <p className="term-dim">Loading the interactive terminal… If it doesn&apos;t appear, everything here is also on the site.</p>
      </div>
    </div>
  );
}

// The terminal is a nice extra, so its code loads after the page is interactive.
const Terminal = dynamic(() => import("./terminal").then((m) => m.Terminal), {
  ssr: false,
  loading: TerminalShell,
});

export function TerminalLazy() {
  return <Terminal />;
}
