import { arrow } from "./defs";

/*
 * A dimension, drawn the way it is on a technical drawing: two thin extension
 * lines from the measured points, a dimension line offset from them with
 * arrowheads at both ends, and the value centred on the line. Coordinates are
 * in the parent SVG's user space. Works for any angle; text is kept upright.
 */
export function Dimension({
  defs,
  x1,
  y1,
  x2,
  y2,
  offset = 18,
  label,
  className,
}: {
  /** Id passed to <DrawingDefs> in the same SVG. */
  defs: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Distance from the measured points to the dimension line; the sign picks the side. */
  offset?: number;
  label: string;
  className?: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Unit normal: rotate the direction 90° anticlockwise.
  const nx = -dy / len;
  const ny = dx / len;
  const gap = 3; // Extension lines start just clear of the object.
  const over = 4; // ...and run slightly past the dimension line.
  const a = { x: x1 + nx * offset, y: y1 + ny * offset };
  const b = { x: x2 + nx * offset, y: y2 + ny * offset };
  const sign = Math.sign(offset) || 1;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle > 90 || angle <= -90) angle += 180;
  const mx = (a.x + b.x) / 2 + nx * 7 * sign;
  const my = (a.y + b.y) / 2 + ny * 7 * sign;

  return (
    <g className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.75">
        <line x1={x1 + nx * gap * sign} y1={y1 + ny * gap * sign} x2={a.x + nx * over * sign} y2={a.y + ny * over * sign} />
        <line x1={x2 + nx * gap * sign} y1={y2 + ny * gap * sign} x2={b.x + nx * over * sign} y2={b.y + ny * over * sign} />
      </g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeWidth="0.75" markerStart={arrow(defs)} markerEnd={arrow(defs)} />
      <text
        className="dim-text"
        x={mx}
        y={my}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${angle} ${mx} ${my})`}
        paintOrder="stroke"
        stroke="var(--drawing-bg, var(--ink))"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        {label}
      </text>
    </g>
  );
}
