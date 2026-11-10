/*
 * A night skyline for film scenes: blocks with lit windows, a water tower, an
 * antenna on the tallest and an AMIGODEV billboard. Generated on the server
 * from a seed, so each scene has its own city and it is the same on every visit.
 * Decorative; styled by the .roof__* rules in globals.css.
 */

const SKY_W = 1200;
const SKY_H = 300;

// A small seeded generator, so the city is identical on the server every build.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Building = { x: number; w: number; h: number; windows: [number, number][] };

function city(seed: number): Building[] {
  const r = seeded(seed);
  const out: Building[] = [];
  let x = -10;
  while (x < SKY_W) {
    const w = 46 + Math.floor(r() * 70);
    const h = 70 + Math.floor(r() * 170);
    const windows: [number, number][] = [];
    for (let wy = SKY_H - h + 14; wy < SKY_H - 12; wy += 16) {
      for (let wx = x + 8; wx < x + w - 10; wx += 13) {
        if (r() < 0.22) windows.push([wx, wy]);
      }
    }
    out.push({ x, w, h, windows });
    x += w + 2 + Math.floor(r() * 6);
  }
  return out;
}

export function Skyline({ seed, className, moon = true }: { seed: number; className?: string; moon?: boolean }) {
  const BUILDINGS = city(seed);
  // Landmarks sit on particular rooftops.
  const tower = BUILDINGS[3];
  const board = BUILDINGS[Math.floor(BUILDINGS.length * 0.62)];
  const spire = BUILDINGS.reduce((a, b) => (b.h > a.h ? b : a));
  return (
    <svg viewBox={`0 0 ${SKY_W} ${SKY_H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" className={className}>
      {moon && (
        <>
          {/* The moon, in halftone. */}
          <circle cx="930" cy="120" r="46" className="roof__moon" />
          <circle cx="930" cy="120" r="46" className="roof__moon-dots" />
        </>
      )}
      {/* Searchlights. */}
      <path d="M160 300 L60 0 L120 0 Z M1080 300 L1150 0 L1200 0 Z" className="roof__beam" />

      {BUILDINGS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={SKY_H - b.h} width={b.w} height={b.h} className="roof__block" />
          {b.windows.map(([wx, wy]) => (
            <rect key={`${wx}-${wy}`} x={wx} y={wy} width="6" height="8" className="roof__window" />
          ))}
        </g>
      ))}

      {/* A water tower on its stilts. */}
      <g transform={`translate(${tower.x + tower.w / 2} ${SKY_H - tower.h})`} className="roof__prop">
        <path d="M-14 0 L-10 -24 M14 0 L10 -24 M-12 -8 L12 -16 M12 -8 L-12 -16" />
        <path d="M-16 -24 H16 V-52 Q0 -64 -16 -52 Z" className="roof__fill" />
        <path d="M-16 -32 H16 M-16 -42 H16" />
      </g>
      {/* An antenna on the tallest. */}
      <path d={`M${spire.x + spire.w / 2} ${SKY_H - spire.h} v-46 M${spire.x + spire.w / 2 - 8} ${SKY_H - spire.h - 24} h16`} className="roof__prop" />
      <circle cx={spire.x + spire.w / 2} cy={SKY_H - spire.h - 48} r="3" className="roof__blink" />
      {/* The billboard. */}
      <g transform={`translate(${board.x + board.w / 2} ${SKY_H - board.h})`}>
        <path d="M-30 0 V-14 M30 0 V-14" className="roof__prop" />
        <rect x="-52" y="-44" width="104" height="30" className="roof__board" />
        <text x="0" y="-23" textAnchor="middle" className="roof__board-text">
          AMIGODEV
        </text>
      </g>
    </svg>
  );
}
