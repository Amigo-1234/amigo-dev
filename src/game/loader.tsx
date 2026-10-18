"use client";

import dynamic from "next/dynamic";

/** Placeholder with the game's exact footprint, shown while the game code loads. */
function GameShell() {
  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <div className="relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[#0b0b0c]">
        <p className="font-mono text-sm text-[#a6a59e]">
          Loading DEBUG<span className="text-[#f26b3a]">.EXE</span>…
        </p>
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
