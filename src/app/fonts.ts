import localFont from "next/font/local";

/*
 * Self-hosted fonts, subset to the characters the site uses (Latin plus
 * punctuation and arrows) to keep the first paint fast on mobile. Geist and
 * Geist Mono keep their variable weight axis. Regenerate the subsets with
 * pyftsubset if the site starts using new characters.
 */

export const GeistSans = localFont({
  src: "../fonts/Geist-Variable-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/* Mono is only used for small labels, so it is not preloaded. */
export const GeistMono = localFont({
  src: "../fonts/GeistMono-Variable-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const instrumentSerif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});
