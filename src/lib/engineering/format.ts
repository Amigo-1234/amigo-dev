/*
 * Number formatting for engineering readouts: a fixed number of significant
 * figures, and SI prefixes in steps of a thousand (engineering notation), so
 * 0.008333 m reads "8.33 mm" and 29400 N·mm reads "29.4 N·m" only when asked.
 *
 * Kept free of imports so the unit tests can run it directly under Node.
 */

const PREFIXES = [
  { exp: 9, symbol: "G" },
  { exp: 6, symbol: "M" },
  { exp: 3, symbol: "k" },
  { exp: 0, symbol: "" },
  { exp: -3, symbol: "m" },
  { exp: -6, symbol: "µ" },
  { exp: -9, symbol: "n" },
] as const;

/** `value` rounded to `sig` significant figures, without trailing zeros. Uses a true minus sign. */
export function formatSig(value: number, sig = 3): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const rounded = Number(value.toPrecision(sig));
  // Avoid exponent notation for the magnitudes the instruments show.
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(rounded))));
  const text = rounded.toFixed(Math.min(digits, 12)).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return text.replace("-", "−");
}

/**
 * A quantity in SI base units shown with the nearest engineering prefix:
 * formatSI(0.008333, "m") → "8.33 mm"; formatSI(2.1e11, "Pa") → "210 GPa".
 */
export function formatSI(value: number, unit: string, sig = 3): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return `0 ${unit}`;
  const exp = Math.floor(Math.log10(Math.abs(Number(value.toPrecision(sig)))) / 3) * 3;
  const prefix = PREFIXES.find((p) => p.exp <= exp) ?? PREFIXES[PREFIXES.length - 1];
  return `${formatSig(value / 10 ** prefix.exp, sig)} ${prefix.symbol}${unit}`;
}
