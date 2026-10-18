import Link from "next/link";

// A pixel beetle, the same art the game uses, drawn as SVG squares.
const BEETLE = ["..k...k..", "...k.k...", ".rrrrrrr.", "rrwrrrwrr", ".rrrrrrr.", "k.rrrrr.k", ".k.....k."];
const COLOURS: Record<string, string> = { k: "#6f6e69", r: "#ff5d6c", w: "#ecebe6" };

/** Entry point to /play. Small on purpose: a break, not the main event. */
export function ArcadeCard() {
  return (
    <Link
      href="/play"
      className="group glass mt-8 flex items-center gap-4 rounded-2xl p-3 pr-5 transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0b0b0c]">
        <span aria-hidden="true" className="game-scanlines absolute inset-0" />
        <svg viewBox="0 0 9 7" aria-hidden="true" className="w-9 [image-rendering:pixelated] transition-transform duration-500 group-hover:-translate-y-1" shapeRendering="crispEdges">
          {BEETLE.flatMap((row, y) =>
            [...row].map((ch, x) => (COLOURS[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLOURS[ch]} /> : null)),
          )}
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-sm font-semibold tracking-tight text-fg">
          Play DEBUG<span className="text-accent">.EXE</span>
        </span>
        <span className="mt-0.5 block text-sm text-fg-muted">Defend production from incoming bugs. Works on phones.</span>
      </span>
      <span aria-hidden="true" className="text-accent transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
