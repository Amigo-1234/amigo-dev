/**
 * Shorten an SVG path for decoration: every number rounded to `digits`
 * decimal places. A tenth of a unit is invisible at the sizes the decorative
 * gears are drawn, and it roughly halves the bytes in the HTML. The Lab's
 * instruments keep their full-precision geometry; this is for ornament only.
 */
export function compactPath(d: string, digits = 1): string {
  return d.replace(/-?\d*\.\d+/g, (n) => {
    const v = Number(Number(n).toFixed(digits));
    return Object.is(v, -0) ? "0" : String(v);
  });
}
