/*
 * Result calculations, ported from Markaz il Ginna's school results platform
 * (src/domain/grading.ts and src/domain/results.ts). In the real system the
 * server computes every derived value and the browser only previews; here the
 * same pure functions run on a made-up class.
 *
 * - A subject is complete when both CA and exam are entered. Blank means "not
 *   entered", never 0.
 * - Average: mean of subject totals to one decimal (halves up), only when every
 *   subject is complete.
 * - Positions: by total; ties share a position and the next is skipped (1, 1, 3).
 */

export type Band = { grade: string; minScore: number; maxScore: number; remarkEn: string; remarkAr: string };

export const policy = {
  caMax: 40,
  examMax: 60,
  passMark: 50,
  bands: [
    { grade: "A", minScore: 70, maxScore: 100, remarkEn: "Excellent", remarkAr: "ممتاز" },
    { grade: "B", minScore: 60, maxScore: 69, remarkEn: "Very good", remarkAr: "جيد جدًا" },
    { grade: "C", minScore: 50, maxScore: 59, remarkEn: "Good", remarkAr: "جيد" },
    { grade: "D", minScore: 45, maxScore: 49, remarkEn: "Fair", remarkAr: "مقبول" },
    { grade: "E", minScore: 40, maxScore: 44, remarkEn: "Weak", remarkAr: "ضعيف" },
    { grade: "F", minScore: 0, maxScore: 39, remarkEn: "Fail", remarkAr: "راسب" },
  ] as Band[],
};

export type Score = { ca: number | null; exam: number | null };

export function bandFor(total: number): Band | null {
  return policy.bands.find((b) => total >= b.minScore && total <= b.maxScore) ?? null;
}

export function subjectTotal(s: Score): number | null {
  return s.ca !== null && s.exam !== null ? s.ca + s.exam : null;
}

/** Mean of whole-number totals to one decimal place, rounding halves up. */
export function averageOf(totals: number[]): number | null {
  if (!totals.length) return null;
  const sum = totals.reduce((a, b) => a + b, 0);
  return Math.round((sum * 10) / totals.length) / 10;
}

export function summarize(scores: Score[]) {
  const totals = scores.map(subjectTotal).filter((t): t is number => t !== null);
  const complete = scores.length > 0 && totals.length === scores.length;
  const average = complete ? averageOf(totals) : null;
  return {
    complete,
    entered: totals.length,
    totalScore: complete ? totals.reduce((a, b) => a + b, 0) : null,
    average,
    passed: average === null ? null : average >= policy.passMark,
  };
}

/** Competition ranking ("1224"). Entries without a total are not ranked. */
export function rankByTotal<K>(entries: { key: K; total: number | null }[]): Map<K, number | null> {
  const ranked = entries.filter((e): e is { key: K; total: number } => e.total !== null).sort((a, b) => b.total - a.total);
  const positions = new Map<K, number | null>(entries.map((e) => [e.key, null]));
  ranked.forEach((entry, i) => {
    const prev = ranked[i - 1];
    positions.set(entry.key, prev && prev.total === entry.total ? positions.get(prev.key)! : i + 1);
  });
  return positions;
}

/** A typed score: blank → null (not entered); a whole number → itself; otherwise invalid. */
export function parseScore(raw: string, max: number): number | null | "invalid" {
  const text = raw.trim();
  if (!text) return null;
  if (!/^\d{1,3}$/.test(text)) return "invalid";
  const n = Number(text);
  return n > max ? "invalid" : n;
}

export function ordinal(n: number, locale: "en" | "ar"): string {
  // Arabic keeps Western digits, as on the school's own sheets.
  if (locale === "ar") return String(n);
  const rule = new Intl.PluralRules("en", { type: "ordinal" }).select(n);
  return `${n}${({ one: "st", two: "nd", few: "rd" } as Record<string, string>)[rule] ?? "th"}`;
}
