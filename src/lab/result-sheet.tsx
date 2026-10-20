"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/cn";

import { bandFor, ordinal, parseScore, policy, rankByTotal, subjectTotal, summarize } from "./results";
import type { Score } from "./results";

type Locale = "en" | "ar";

/* Wording from the platform's own English and Arabic dictionaries. */
const t = {
  en: {
    title: "Result sheet",
    subject: "Subject",
    ca: "CA",
    exam: "Exam",
    total: "Total",
    grade: "Grade",
    remark: "Remark",
    notEntered: "Not entered",
    totalScore: "Total score",
    average: "Average",
    overall: "Overall result",
    position: "Position",
    positionOf: (p: string, n: number) => `${p} of ${n}`,
    notRanked: "Not ranked",
    pass: "Pass",
    fail: "Fail",
    incomplete: "Incomplete: the average, overall result and position need every subject.",
    policy: `CA out of ${policy.caMax}, exam out of ${policy.examMax}. Pass mark ${policy.passMark}.`,
    gradeKey: "Grades",
    invalid: (max: number) => `Whole number from 0 to ${max}`,
    you: "You (editable)",
    classmate: (n: number) => `Classmate ${n}`,
    ranking: "Class ranking",
    hint: "Try clearing a score, or matching the top total of 372.",
  },
  ar: {
    title: "كشف النتائج",
    subject: "المادة",
    ca: "أعمال السنة",
    exam: "الامتحان",
    total: "المجموع",
    grade: "التقدير",
    remark: "الملاحظة",
    notEntered: "لم تُدخل",
    totalScore: "مجموع الدرجات",
    average: "المعدل",
    overall: "النتيجة العامة",
    position: "الترتيب",
    positionOf: (p: string, n: number) => `${p} من ${n}`,
    notRanked: "غير مرتَّب",
    pass: "ناجح",
    fail: "راسب",
    incomplete: "غير مكتمل: يحتاج المعدل والنتيجة العامة والترتيب إلى جميع المواد.",
    policy: `أعمال السنة من ${policy.caMax}، والامتحان من ${policy.examMax}. درجة النجاح ${policy.passMark}.`,
    gradeKey: "التقديرات",
    invalid: (max: number) => `عدد صحيح من 0 إلى ${max}`,
    you: "أنت (قابل للتعديل)",
    classmate: (n: number) => `زميل ${n}`,
    ranking: "ترتيب الصف",
    hint: "جرّب حذف درجة، أو الوصول إلى أعلى مجموع وهو 372.",
  },
} as const;

const subjects = [
  { en: "Qur'an", ar: "القرآن الكريم" },
  { en: "Arabic Language", ar: "اللغة العربية" },
  { en: "Islamic Studies", ar: "الدراسات الإسلامية" },
  { en: "Mathematics", ar: "الرياضيات" },
  { en: "English Language", ar: "اللغة الإنجليزية" },
];

/* Fictional classmates' totals. Two share a total, so the 1-2-2-4 ranking shows. */
const classmates = [372, 341, 341, 298];

const initial: { ca: string; exam: string }[] = [
  { ca: "34", exam: "51" },
  { ca: "30", exam: "44" },
  { ca: "28", exam: "41" },
  { ca: "25", exam: "38" },
  { ca: "33", exam: "47" },
];

export function ResultSheet() {
  const [locale, setLocale] = useState<Locale>("en");
  const [rows, setRows] = useState(initial);
  const id = useId();
  const l = t[locale];
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : "en-NG");

  const parsed = rows.map((r) => ({ ca: parseScore(r.ca, policy.caMax), exam: parseScore(r.exam, policy.examMax) }));
  const scores: Score[] = parsed.map((p) => ({ ca: p.ca === "invalid" ? null : p.ca, exam: p.exam === "invalid" ? null : p.exam }));
  const summary = summarize(scores);

  const entries = [{ key: "you", total: summary.totalScore }, ...classmates.map((total, i) => ({ key: `c${i + 1}`, total }))];
  const positions = rankByTotal(entries);
  const ranking = entries
    .map((e) => ({ ...e, position: positions.get(e.key) ?? null }))
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  const yourPosition = ranking.find((r) => r.key === "you")?.position ?? null;

  const update = (i: number, field: "ca" | "exam", value: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  return (
    <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="rounded-2xl border border-line bg-ink-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
        <div>
          <p className={cn("text-2xl leading-none", locale === "en" && "font-serif")}>{l.title}</p>
          <p className="mt-1.5 text-xs text-fg-subtle">{l.hint}</p>
        </div>
        <div role="group" aria-label="Language" className="flex rounded-full border border-line p-1" dir="ltr">
          {(["en", "ar"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              aria-pressed={locale === loc}
              onClick={() => setLocale(loc)}
              lang={loc}
              className={cn(
                "h-9 rounded-full px-4 text-sm transition-colors",
                locale === loc ? "bg-fg text-ink" : "text-fg-muted hover:text-fg",
              )}
            >
              {loc === "en" ? "English" : "العربية"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">{l.title}</caption>
          <thead>
            <tr className="border-b border-line text-start text-fg-subtle">
              {[l.subject, l.ca, l.exam, l.total, l.grade, l.remark].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-normal first:ps-5 sm:first:ps-7">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => {
              const total = subjectTotal(scores[i]);
              const band = total === null ? null : bandFor(total);
              return (
                <tr key={s.en} className="border-b border-line">
                  <th scope="row" className="px-4 py-2.5 text-start font-normal text-fg ps-5 sm:ps-7">
                    {s[locale]}
                  </th>
                  {(["ca", "exam"] as const).map((field) => {
                    const max = field === "ca" ? policy.caMax : policy.examMax;
                    const invalid = parsed[i][field] === "invalid";
                    const inputId = `${id}-${i}-${field}`;
                    return (
                      <td key={field} className="px-4 py-2.5">
                        <label htmlFor={inputId} className="sr-only">
                          {s[locale]}, {field === "ca" ? l.ca : l.exam}
                        </label>
                        <span dir="ltr" className="inline-flex items-center">
                          <input
                            id={inputId}
                            inputMode="numeric"
                            dir="ltr"
                            value={rows[i][field]}
                            onChange={(e) => update(i, field, e.target.value)}
                            aria-invalid={invalid || undefined}
                            aria-describedby={invalid ? `${inputId}-err` : undefined}
                            placeholder="—"
                            className={cn(
                              "h-10 w-16 rounded-lg border bg-ink px-2 text-center tabular-nums text-fg",
                              invalid ? "border-[color:var(--accent)]" : "border-line-strong",
                            )}
                          />
                          <span className="ms-1.5 text-xs text-fg-subtle">/{max}</span>
                        </span>
                        {invalid && (
                          <span id={`${inputId}-err`} className="mt-1 block text-xs text-accent">
                            {l.invalid(max)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2.5 tabular-nums text-fg">{total === null ? <span className="text-fg-subtle">{l.notEntered}</span> : nf.format(total)}</td>
                  <td className="px-4 py-2.5 font-mono text-fg">{band?.grade ?? "—"}</td>
                  <td className="px-4 py-2.5 text-fg-muted">{band ? (locale === "ar" ? band.remarkAr : band.remarkEn) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-2">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm" aria-live="polite">
          {[
            [l.totalScore, summary.totalScore === null ? "—" : nf.format(summary.totalScore)],
            [l.average, summary.average === null ? "—" : nf.format(summary.average)],
            [l.overall, summary.passed === null ? "—" : summary.passed ? l.pass : l.fail],
            [l.position, yourPosition === null ? l.notRanked : l.positionOf(ordinal(yourPosition, locale), ranking.length)],
          ].map(([term, value]) => (
            <div key={term} className="bg-ink-raised p-4">
              <dt className="text-xs text-fg-subtle">{term}</dt>
              <dd className="mt-1 text-lg text-fg">{value}</dd>
            </div>
          ))}
          {!summary.complete && <p className="col-span-2 bg-ink-raised p-4 text-xs text-warn">{l.incomplete}</p>}
        </dl>

        <div>
          <p className="text-xs text-fg-subtle">{l.ranking}</p>
          <ol className="mt-2 space-y-1.5 text-sm">
            {ranking.map((r) => (
              <li key={r.key} className={cn("flex items-center justify-between gap-3 rounded-lg px-3 py-2", r.key === "you" ? "bg-accent-soft text-fg" : "bg-surface text-fg-muted")}>
                <span className="flex items-center gap-3">
                  <span className="w-7 font-mono text-xs">{r.position === null ? "—" : ordinal(r.position, locale)}</span>
                  {r.key === "you" ? l.you : l.classmate(Number(r.key.slice(1)))}
                </span>
                <span className="tabular-nums">{r.total === null ? "—" : nf.format(r.total)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 text-xs text-fg-subtle sm:px-7">
        <p>{l.policy}</p>
        <p className="mt-1.5">
          {l.gradeKey}:{" "}
          {policy.bands.map((b) => `${b.grade} ${b.minScore}–${b.maxScore}`).join(" · ")}
        </p>
      </div>
    </div>
  );
}
