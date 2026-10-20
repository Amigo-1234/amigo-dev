/*
 * Prayer-time calculation, ported from the HAQSLAM website (haqslam.com.ng,
 * web/src/lib/prayer.ts). Times are calculated astronomically with adhan for a
 * Nigerian city and shown in Africa/Lagos time, whatever the visitor's own
 * time zone. HAQSLAM uses Lagos only; the Lab adds two more cities and lets
 * you switch the calculation method and Asr convention.
 */
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

export const TZ = "Africa/Lagos";

export const cities = {
  lagos: { name: "Lagos", latitude: 6.454066, longitude: 3.394673 },
  abuja: { name: "Abuja", latitude: 9.0765, longitude: 7.3986 },
  adoEkiti: { name: "Ado-Ekiti", latitude: 7.6233, longitude: 5.2209 },
} as const;
export type CityKey = keyof typeof cities;

export const methods = {
  MuslimWorldLeague: "Muslim World League",
  Egyptian: "Egyptian General Authority of Survey",
  Karachi: "University of Islamic Sciences, Karachi",
  MoonsightingCommittee: "Moonsighting Committee",
} as const;
export type MethodKey = keyof typeof methods;
export type Asr = "standard" | "hanafi";

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerSlot = { key: PrayerKey; name: string; arabic: string; isPrayer: boolean; time: string; at: number };

const labels: Omit<PrayerSlot, "time" | "at">[] = [
  { key: "fajr", name: "Fajr", arabic: "الفجر", isPrayer: true },
  { key: "sunrise", name: "Sunrise", arabic: "الشروق", isPrayer: false },
  { key: "dhuhr", name: "Dhuhr", arabic: "الظهر", isPrayer: true },
  { key: "asr", name: "Asr", arabic: "العصر", isPrayer: true },
  { key: "maghrib", name: "Maghrib", arabic: "المغرب", isPrayer: true },
  { key: "isha", name: "Isha", arabic: "العشاء", isPrayer: true },
];

export type Settings = { city: CityKey; method: MethodKey; asr: Asr };

/** The calendar date in Lagos (YYYY-MM-DD) at an instant. */
export function lagosDateKey(instant: number): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function nextDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function calculate(dateKey: string, s: Settings): PrayerSlot[] {
  const [y, m, d] = dateKey.split("-").map(Number);
  // adhan reads local calendar fields and returns UTC instants, so pass the
  // Lagos calendar date at local noon, independent of the visitor's zone.
  const date = new Date(y, m - 1, d, 12);
  const params = CalculationMethod[s.method]();
  params.madhab = s.asr === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  const city = cities[s.city];
  const times = new PrayerTimes(new Coordinates(city.latitude, city.longitude), date, params);
  return labels.map((label) => {
    const at = times[label.key].getTime();
    if (!Number.isFinite(at)) throw new Error("Prayer calculation is unavailable for this date.");
    return { ...label, time: clock.format(at), at };
  });
}

export type NextPrayer = { slot: PrayerSlot; msUntil: number; isTomorrow: boolean };

export function nextPrayer(today: PrayerSlot[], tomorrow: PrayerSlot[], instant: number): NextPrayer {
  const next = today.find((slot) => slot.isPrayer && slot.at > instant);
  const slot = next ?? tomorrow.find((slot) => slot.key === "fajr")!;
  return { slot, msUntil: Math.max(0, slot.at - instant), isTomorrow: !next };
}

export function countdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
}

export function to12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function gregorian(instant: number) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(instant);
}

export function hijri(instant: number) {
  try {
    return new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(instant);
  } catch {
    return null;
  }
}
