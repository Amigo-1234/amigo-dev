"use client";

import dynamic from "next/dynamic";

/*
 * Placeholder with the game's exact footprint and start-screen text, shown
 * (and server-rendered) while the game code loads. The text matches the
 * game's own start screen, so the page's main content paints at once and the
 * swap to the real game is seamless.
 */
function GameShell() {
  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <div className="relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[#0b0b0c] p-6 text-center text-[#ecebe6]">
        <div className="w-full">
          <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-[#ff9a5c]">C:\AMIGODEV&gt; RUN</p>
          <p className="mt-3 font-sans text-4xl font-semibold tracking-tight sm:text-5xl">
            DEBUG<span className="text-[#f26b3a]">.EXE</span>
          </p>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-[#a6a59e]">
            Production is under attack. Patch the bugs before they reach the server.
          </p>
          <p className="mt-6 inline-flex h-12 items-center rounded-full border border-[#2a2a2f] px-7 font-mono text-sm text-[#a6a59e]" role="status">
            Loading…
          </p>
        </div>
      </div>
      <div className="mt-3 h-4 pointer-coarse:h-16" />
    </div>
  );
}

// Game code is only downloaded on /play, after the page itself has loaded.
const DebugExe = dynamic(() => import("./debug-exe").then((m) => m.DebugExe), { ssr: false, loading: GameShell });

export function GameLoader() {
  return <DebugExe />;
}
