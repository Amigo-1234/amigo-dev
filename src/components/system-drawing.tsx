/*
 * The hero illustration: an exploded isometric drawing of the layers I work
 * across, from interface to infrastructure. Pure SVG, drawn in with CSS when
 * motion is allowed and fully visible when it is not.
 */

const A = 150; // half-width of a plate
const H = 86; // half-height of a plate
const T = 10; // plate thickness
const CX = 214;

const layers = [
  { n: "01", name: "Interface", tech: "Next.js · React · Tailwind CSS", cy: 120, direction: false },
  { n: "02", name: "Application", tech: "TypeScript · Auth · APIs", cy: 212, direction: false },
  { n: "03", name: "Data", tech: "PostgreSQL · Supabase · Firebase", cy: 304, direction: false },
  { n: "04", name: "Infrastructure", tech: "Vercel · DNS · Git  →  DevOps", cy: 396, direction: true },
] as const;

function plateTop(cy: number) {
  return `M${CX - A} ${cy} L${CX} ${cy - H} L${CX + A} ${cy} L${CX} ${cy + H} Z`;
}

function plateSides(cy: number) {
  return `M${CX - A} ${cy} L${CX - A} ${cy + T} L${CX} ${cy + H + T} L${CX + A} ${cy + T} L${CX + A} ${cy}`;
}

/** Maps unit coordinates (u along the upper-left edge, v along the lower-left edge) onto a plate's top face. */
function iso(cy: number, u: number, v: number) {
  return [CX - A + A * u + A * v, cy - H * u + H * v];
}

function polyline(cy: number, pts: [number, number][], close = false) {
  const d = pts.map(([u, v], i) => `${i ? "L" : "M"}${iso(cy, u, v).map((n) => n.toFixed(1)).join(" ")}`).join(" ");
  return close ? `${d} Z` : d;
}

function rect(cy: number, u: number, v: number, w: number, h: number) {
  return polyline(cy, [[u, v], [u + w, v], [u + w, v + h], [u, v + h]], true);
}

function ring(cy: number, u: number, v: number, r: number) {
  const pts = Array.from({ length: 24 }, (_, i): [number, number] => {
    const t = (i / 24) * Math.PI * 2;
    return [u + r * Math.cos(t), v + r * Math.sin(t)];
  });
  return polyline(cy, pts, true);
}

/** Line-work on each plate's top face: screens, services, tables, a server grid. */
function plateDetail(index: number, cy: number): string[] {
  switch (index) {
    case 0:
      return [rect(cy, 0.14, 0.14, 0.42, 0.3), rect(cy, 0.14, 0.54, 0.72, 0.14), rect(cy, 0.64, 0.14, 0.22, 0.3), polyline(cy, [[0.14, 0.8], [0.5, 0.8]])];
    case 1:
      return [
        polyline(cy, [[0.25, 0.28], [0.72, 0.3], [0.48, 0.72]], true),
        ring(cy, 0.25, 0.28, 0.07),
        ring(cy, 0.72, 0.3, 0.07),
        ring(cy, 0.48, 0.72, 0.07),
      ];
    case 2:
      return [
        rect(cy, 0.16, 0.18, 0.68, 0.64),
        polyline(cy, [[0.16, 0.34], [0.84, 0.34]]),
        polyline(cy, [[0.16, 0.5], [0.84, 0.5]]),
        polyline(cy, [[0.16, 0.66], [0.84, 0.66]]),
        polyline(cy, [[0.4, 0.18], [0.4, 0.82]]),
      ];
    default:
      return [0.25, 0.5, 0.75].flatMap((u) => [0.25, 0.5, 0.75].map((v) => ring(cy, u, v, 0.03)));
  }
}

export function SystemDrawing({ className }: { className?: string }) {
  const top = layers[0].cy - H;
  const bottom = layers[layers.length - 1].cy + H + T;
  const mid = (top + bottom) / 2;

  return (
    <svg viewBox="0 0 640 520" role="img" aria-labelledby="system-drawing-title system-drawing-desc" className={className}>
      <title id="system-drawing-title">The layers I work across</title>
      <desc id="system-drawing-desc">
        An exploded isometric drawing of four stacked layers: interface (Next.js, React, Tailwind CSS), application
        (TypeScript, authentication, APIs), data (PostgreSQL, Supabase, Firebase) and infrastructure (Vercel, DNS, Git),
        with infrastructure marked as the direction I am growing toward, DevOps.
      </desc>

      <g className="draw" fontFamily="var(--font-geist-mono), monospace">
        {/* Overall dimension line */}
        <g stroke="var(--line-strong)" strokeWidth={1}>
          <line data-draw pathLength={1} x1={26} y1={top} x2={26} y2={bottom} />
          <line data-draw pathLength={1} x1={18} y1={top} x2={34} y2={top} />
          <line data-draw pathLength={1} x1={18} y1={bottom} x2={34} y2={bottom} />
        </g>
        <text
          data-fade
          x={12}
          y={mid}
          fill="var(--fg-subtle)"
          fontSize={10}
          letterSpacing="0.14em"
          textAnchor="middle"
          transform={`rotate(-90 12 ${mid})`}
        >
          INTERFACE → INFRASTRUCTURE
        </text>

        {/* Assembly lines between plates */}
        <g stroke="var(--line-strong)" strokeWidth={1} strokeDasharray="3 5" data-fade>
          <line x1={CX - A} y1={layers[0].cy + T} x2={CX - A} y2={layers[3].cy} />
          <line x1={CX + A} y1={layers[0].cy + T} x2={CX + A} y2={layers[3].cy} />
          <line x1={CX} y1={layers[0].cy + H + T} x2={CX} y2={layers[3].cy + H} />
        </g>

        {/* Plates, drawn bottom-up so upper plates sit in front */}
        {[...layers].reverse().map((layer) => {
          const i = Number(layer.n) - 1;
          const stroke = layer.direction ? "var(--accent)" : "var(--fg)";
          return (
            <g key={layer.n} style={{ "--d": i * 160 } as React.CSSProperties}>
              <path d={plateSides(layer.cy)} fill="var(--ink-sunken)" stroke={stroke} strokeOpacity={0.5} strokeWidth={1} data-draw pathLength={1} />
              {layer.direction ? (
                <path d={plateTop(layer.cy)} fill="var(--ink-raised)" fillOpacity={0.6} stroke={stroke} strokeWidth={1.25} strokeDasharray="6 5" data-fade />
              ) : (
                <path d={plateTop(layer.cy)} fill="var(--ink-raised)" fillOpacity={0.94} stroke={stroke} strokeWidth={1.25} data-draw pathLength={1} />
              )}
              <g
                data-fade
                fill={layer.direction ? "var(--accent)" : "none"}
                stroke={layer.direction ? "none" : "var(--fg-muted)"}
                strokeWidth={1}
                opacity={0.8}
              >
                {plateDetail(i, layer.cy).map((d, k) => (
                  <path key={k} d={d} />
                ))}
              </g>
            </g>
          );
        })}

        {/* Labels with leaders */}
        {layers.map((layer, i) => (
          <g key={layer.n} data-fade style={{ "--d": 500 + i * 140 } as React.CSSProperties}>
            <line x1={CX + A + 6} y1={layer.cy} x2={398} y2={layer.cy} stroke="var(--line-strong)" strokeWidth={1} />
            <circle cx={CX + A} cy={layer.cy} r={2.5} fill={layer.direction ? "var(--accent)" : "var(--fg)"} />
            <text x={406} y={layer.cy - 4} fontSize={11.5} letterSpacing="0.12em" fill={layer.direction ? "var(--accent)" : "var(--fg)"}>
              {layer.n} — {layer.name.toUpperCase()}
            </text>
            <text x={406} y={layer.cy + 14} fontSize={10.5} letterSpacing="0.02em" fill="var(--fg-subtle)">
              {layer.tech}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
