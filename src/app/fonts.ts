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

/*
 * Display face: Big Shoulders Display (SIL OFL 1.1, licence in src/fonts), an
 * industrial condensed face that reads as both a comic-cover masthead and
 * machine-shop signage. Headings only, so two weights are enough.
 */
export const displayFace = localFont({
  src: [
    { path: "../fonts/big-shoulders-display-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/big-shoulders-display-latin-900-normal.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-display-face",
  display: "swap",
  fallback: ["Impact", "Haettenschweiler", "Arial Narrow", "sans-serif"],
});
