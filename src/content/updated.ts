/*
 * When each indexable page's main content last changed in a meaningful way
 * (not layout, styling or site-wide footer tweaks). Used for sitemap
 * <lastmod> and schema.org dateModified. Update the date when you change a
 * page's content; search engines rely on these being accurate.
 */
export const contentUpdated = {
  "/": "2026-10-20",
  "/about": "2026-10-29",
  "/projects": "2026-10-20",
  "/contact": "2026-10-29",
  "/lab": "2026-10-20",
  "/lab/prayer-times": "2026-10-20",
  "/lab/result-sheet": "2026-10-20",
  "/lab/match-clock": "2026-10-20",
  "/play": "2026-10-20",
  /** Every case study was rewritten and re-verified against its repository on this date. */
  caseStudies: "2026-10-20",
} as const;

export type UpdatedPath = Exclude<keyof typeof contentUpdated, "caseStudies">;
