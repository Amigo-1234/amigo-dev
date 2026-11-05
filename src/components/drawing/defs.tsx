/*
 * Shared SVG definitions for engineering drawings: arrowheads for dimension
 * and load lines, and the standard 45° section hatching. Ids are prefixed so
 * several drawings can sit on one page without clashing.
 */
export function DrawingDefs({ id }: { id: string }) {
  return (
    <defs>
      {/* Closed, narrow arrowhead (about 15°), the usual dimension terminator. */}
      <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
        <path d="M0 2.4 L10 5 L0 7.6 Z" fill="currentColor" />
      </marker>
      {/* Heavier arrowhead for applied loads. */}
      <marker id={`${id}-load`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="11" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M0 1.5 L10 5 L0 8.5 Z" fill="currentColor" />
      </marker>
      <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--hatch)" strokeWidth="1.2" />
      </pattern>
    </defs>
  );
}

/** Marker reference for an arrowhead defined by <DrawingDefs id={id} />. */
export const arrow = (id: string) => `url(#${id}-arrow)`;
export const loadArrow = (id: string) => `url(#${id}-load)`;
export const hatch = (id: string) => `url(#${id}-hatch)`;
