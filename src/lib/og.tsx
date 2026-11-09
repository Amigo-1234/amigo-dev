import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { MONOGRAM_BAR, MONOGRAM_INK } from "@/components/brand";

export const ogSize = { width: 1200, height: 630 };

// The night edition's inks (see globals.css).
const INK = "#0b0b0d";
const FG = "#f2eee6";
const MUTED = "#aaa69f";
const SUBTLE = "#8f8b84";
const ACCENT = "#ff3b4e";
const BLUEPRINT = "#6b8bff";
const SFX = "#ffd23f";

/**
 * The owner's portrait as a data URL for the main social preview, read from
 * src/assets/portrait/og.jpg (a JPEG, since the renderer can't read WebP).
 * Returns undefined when there is no file, and the preview is laid out without it.
 */
export async function ogPortrait(): Promise<string | undefined> {
  try {
    const data = await readFile(join(process.cwd(), "src/assets/portrait/og.jpg"));
    return `data:image/jpeg;base64,${data.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function ogFonts() {
  const dir = join(process.cwd(), "src/fonts/og");
  const [display, sans, mono] = await Promise.all([
    readFile(join(dir, "big-shoulders-display-latin-900-normal.woff")),
    readFile(join(dir, "Geist-Regular.ttf")),
    readFile(join(dir, "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Display", data: display, style: "normal" as const, weight: 900 as const },
    { name: "Sans", data: sans, style: "normal" as const, weight: 400 as const },
    { name: "Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}

/**
 * Shared frame, as the cover of an issue: drafting grid, a halftone burst,
 * the masthead, a yellow caption box, the title printed in three plates, and
 * a plumb bob on its silk line in the margin.
 */
export function OgFrame({
  eyebrow,
  title,
  italic,
  subtitle,
  footer,
  tint = ACCENT,
  portrait,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  subtitle: string;
  footer: string;
  tint?: string;
  portrait?: string;
}) {
  const lines = Array.from({ length: 16 }, (_, i) => i);
  // Halftone burst in the top-right corner: dots shrinking away from the corner.
  const dots: { x: number; y: number; r: number }[] = [];
  for (let gy = 0; gy < 16; gy++)
    for (let gx = 0; gx < 26; gx++) {
      const x = 1200 - gx * 18 - (gy % 2) * 9;
      const y = gy * 18;
      const d = Math.hypot(1200 - x, y) / 470;
      if (d < 1) dots.push({ x, y, r: 4.4 * (1 - d) });
    }
  const titleText = title.toUpperCase();
  const plate = (color: string, dx: number, dy: number) => (
    <span style={{ position: "absolute", left: dx, top: dy, display: "flex", color }}>
      {titleText}
      {italic ? ` ${italic.toUpperCase()}` : ""}
    </span>
  );
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: INK, color: FG, fontFamily: "Sans", position: "relative" }}>
      {lines.map((i) => (
        <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: i * 80, width: 1, background: "rgba(107,139,255,0.08)" }} />
      ))}
      {lines.slice(0, 9).map((i) => (
        <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: i * 80, height: 1, background: "rgba(107,139,255,0.08)" }} />
      ))}
      {dots.map((d, i) => (
        <div
          key={`d${i}`}
          style={{ position: "absolute", left: d.x - d.r, top: d.y - d.r, width: d.r * 2, height: d.r * 2, borderRadius: d.r * 2, background: tint, opacity: 0.55 }}
        />
      ))}
      {/* The plumb bob on its silk line, in the right margin. */}
      <div style={{ position: "absolute", right: 22, top: 0, width: 2, height: 360, background: "rgba(242,238,230,0.5)" }} />
      <svg width="34" height="58" viewBox="-14 -6 28 48" style={{ position: "absolute", right: 7, top: 352 }}>
        <rect x="-5" y="0" width="10" height="5" fill={BLUEPRINT} />
        <path d="M-9 6h18l-2 14L0 40l-7-20z" fill={FG} />
        <path d="M3 8l-1 12" stroke={ACCENT} strokeWidth="1.6" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 40,
          width: 1100,
          height: 550,
          border: `3px solid ${FG}`,
          display: "flex",
          flexDirection: "column",
          padding: 44,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Mono", fontSize: 20, letterSpacing: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="0 0 48 48">
              <path fill={FG} fillRule="evenodd" d={MONOGRAM_INK} />
              <path fill={ACCENT} d={MONOGRAM_BAR} />
            </svg>
            <span style={{ fontFamily: "Sans", fontSize: 22, letterSpacing: 4 }}>AMIGO</span>
            <span style={{ fontFamily: "Sans", fontSize: 22, letterSpacing: 4, color: ACCENT, marginLeft: -10 }}>DEV</span>
          </div>
          <span style={{ background: SFX, color: INK, padding: "6px 12px", fontSize: 16, border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${ACCENT}` }}>
            {eyebrow.toUpperCase()}
          </span>
        </div>
        {portrait && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait} alt="" width={272} height={340} style={{ position: "absolute", right: 48, top: 96, objectFit: "cover" }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", ...(portrait ? { maxWidth: 680 } : {}) }}>
          <div style={{ display: "flex", position: "relative", fontFamily: "Display", fontSize: 118, lineHeight: 0.9, letterSpacing: 0 }}>
            {plate(ACCENT, -4, 2)}
            {plate(BLUEPRINT, 3, -1)}
            <span style={{ position: "relative", display: "flex", color: FG }}>
              {titleText}
              {italic && <span style={{ color: ACCENT, marginLeft: 24 }}>{italic.toUpperCase()}</span>}
            </span>
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: MUTED, maxWidth: portrait ? 680 : 900, lineHeight: 1.35 }}>{subtitle}</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            paddingTop: 18,
            borderTop: `2px solid rgba(242,238,230,0.3)`,
            fontFamily: "Mono",
            fontSize: 17,
            letterSpacing: 2,
            color: SUBTLE,
          }}
        >
          {footer.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
