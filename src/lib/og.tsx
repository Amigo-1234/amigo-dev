import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { MONOGRAM_BAR, MONOGRAM_INK } from "@/components/brand";

export const ogSize = { width: 1200, height: 630 };

const INK = "#0b0b0c";
const FG = "#ecebe6";
const MUTED = "#a6a59e";
const SUBTLE = "#75746e";
const ACCENT = "#f26b3a";

/** The owner's portrait as a data URL, for the main social preview. */
export async function ogPortrait() {
  const data = await readFile(join(process.cwd(), "src/fonts/og/portrait.jpg"));
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}

export async function ogFonts() {
  const dir = join(process.cwd(), "src/fonts/og");
  const [serif, serifItalic, sans, mono] = await Promise.all([
    readFile(join(dir, "instrument-serif-latin-400-normal.woff")),
    readFile(join(dir, "instrument-serif-latin-400-italic.woff")),
    readFile(join(dir, "Geist-Regular.ttf")),
    readFile(join(dir, "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Serif", data: serif, style: "normal" as const, weight: 400 as const },
    { name: "Serif", data: serifItalic, style: "italic" as const, weight: 400 as const },
    { name: "Sans", data: sans, style: "normal" as const, weight: 400 as const },
    { name: "Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ];
}

/** Shared frame: title block border, grid and wordmark. */
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
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: INK, color: FG, fontFamily: "Sans", position: "relative" }}>
      {lines.map((i) => (
        <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: i * 80, width: 1, background: "rgba(236,235,230,0.045)" }} />
      ))}
      {lines.slice(0, 9).map((i) => (
        <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: i * 80, height: 1, background: "rgba(236,235,230,0.045)" }} />
      ))}
      <div
        style={{
          position: "absolute",
          right: -160,
          top: -200,
          width: 620,
          height: 620,
          borderRadius: 620,
          background: tint,
          opacity: 0.16,
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 40,
          width: 1120,
          height: 550,
          border: "1px solid rgba(236,235,230,0.16)",
          display: "flex",
          flexDirection: "column",
          padding: 48,
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
          <span style={{ color: SUBTLE, fontSize: 16 }}>{eyebrow.toUpperCase()}</span>
        </div>
        {portrait && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portrait}
            alt=""
            width={272}
            height={340}
            style={{ position: "absolute", right: 48, top: 96, borderRadius: 24, border: "1px solid rgba(236,235,230,0.25)", objectFit: "cover" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", ...(portrait ? { maxWidth: 680 } : {}) }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Serif", fontSize: 104, lineHeight: 1, letterSpacing: -2 }}>
            <span>{title}</span>
            {italic && <span style={{ fontStyle: "italic", color: ACCENT, marginLeft: 24 }}>{italic}</span>}
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: MUTED, maxWidth: portrait ? 680 : 900, lineHeight: 1.35 }}>{subtitle}</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(236,235,230,0.16)",
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
