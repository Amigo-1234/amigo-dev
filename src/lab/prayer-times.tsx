"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";

import { calculate, cities, countdown, gregorian, hijri, lagosDateKey, methods, nextDateKey, nextPrayer, to12h } from "./prayer";
import type { Asr, CityKey, MethodKey, Settings } from "./prayer";
import { useNow } from "./use-now";

export function PrayerTimes() {
  const now = useNow(1000);
  const [settings, setSettings] = useState<Settings>({ city: "lagos", method: "MuslimWorldLeague", asr: "standard" });
  const dateKey = now === null ? null : lagosDateKey(now);

  const calculated = useMemo(() => {
    if (!dateKey) return null;
    try {
      return { today: calculate(dateKey, settings), tomorrow: calculate(nextDateKey(dateKey), settings) };
    } catch {
      return null;
    }
  }, [dateKey, settings]);

  const next = now === null || !calculated ? null : nextPrayer(calculated.today, calculated.tomorrow, now);
  const hijriDate = now === null ? null : hijri(now);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section aria-label="Calculated prayer times" className="rounded-2xl border border-line bg-ink-raised p-5 sm:p-7 lg:col-span-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label">{cities[settings.city].name} · Africa/Lagos</p>
            <p className="mt-2 min-h-[1.5em] text-sm text-fg-muted">
              {now === null ? "Calculating…" : (
                <>
                  {gregorian(now)}
                  {hijriDate && <span className="text-fg-subtle"> · {hijriDate} (approx.)</span>}
                </>
              )}
            </p>
          </div>
          <div className="sm:text-right" aria-live="polite">
            <p className="label text-accent">Next prayer</p>
            {next ? (
              <>
                <p className="mt-1 font-serif text-3xl leading-none">
                  {next.slot.name}{" "}
                  <span className="text-lg text-fg-muted">
                    {next.isTomorrow ? "tomorrow, " : ""}
                    {to12h(next.slot.time)}
                  </span>
                </p>
                <p aria-hidden="true" className="mt-1.5 font-mono text-lg tabular-nums text-fg">
                  in {countdown(next.msUntil)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-fg-muted">{now === null ? "Calculating…" : "Unavailable for this date."}</p>
            )}
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(calculated?.today ?? []).map((slot) => {
            const isNext = !next?.isTomorrow && next?.slot.key === slot.key;
            return (
              <li
                key={slot.key}
                aria-current={isNext ? "time" : undefined}
                className={cn(
                  "rounded-xl px-4 py-3.5 transition-colors duration-500",
                  isNext ? "bg-accent text-accent-fg" : slot.isPrayer ? "bg-surface-strong" : "border border-dashed border-line text-fg-muted",
                )}
              >
                <p lang="ar" dir="rtl" className={cn("text-right text-base leading-none", !isNext && "text-fg-muted")}>
                  {slot.arabic}
                </p>
                <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em]">{slot.name}</p>
                <p className="font-serif text-2xl tabular-nums">{to12h(slot.time)}</p>
                {isNext && <span className="sr-only">(next prayer)</span>}
              </li>
            );
          })}
          {!calculated && Array.from({ length: 6 }, (_, i) => <li key={i} className="h-[5.6rem] animate-pulse rounded-xl bg-surface" />)}
        </ol>
      </section>

      <fieldset className="rounded-2xl border border-line p-5 sm:p-7 lg:col-span-4">
        <legend className="label px-1">Settings</legend>
        <Choice label="City" value={settings.city} onChange={(v) => set("city", v as CityKey)} options={Object.entries(cities).map(([k, c]) => [k, c.name])} />
        <Choice
          label="Calculation method"
          value={settings.method}
          onChange={(v) => set("method", v as MethodKey)}
          options={Object.entries(methods)}
        />
        <Choice
          label="Asr"
          value={settings.asr}
          onChange={(v) => set("asr", v as Asr)}
          options={[
            ["standard", "Standard (Maliki, Shafi‘i, Hanbali)"],
            ["hanafi", "Hanafi"],
          ]}
        />
        <p className="mt-5 text-xs leading-relaxed text-fg-subtle">
          Calculated start times, not a mosque&rsquo;s congregation timetable. Changing a setting recalculates both today
          and tomorrow, so the countdown rolls over correctly after Isha.
        </p>
      </fieldset>
    </div>
  );
}

function Choice({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="mt-4 block first-of-type:mt-2">
      <span className="text-sm text-fg-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 block h-11 w-full rounded-lg border border-line-strong bg-ink px-3 text-sm text-fg"
      >
        {options.map(([k, name]) => (
          <option key={k} value={k}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
