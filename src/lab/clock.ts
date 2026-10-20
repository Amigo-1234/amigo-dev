/*
 * Match clock, ported from the EKSU Sports Hub operator console
 * (src/lib/operator/clock.ts). The clock is derived from timestamps, never
 * from a counter that ticks, so every screen that knows the same timestamps
 * shows the same minute, and a throttled tab cannot drift.
 *
 *   elapsed = periodOffset + (periodEndedAt ?? now) − periodStartedAt
 *             − accumulatedPause − (ongoing pause)
 *
 * Every function takes `now` explicitly. In the Lab, `now` is a simulated
 * clock that can run faster than real time.
 */

export type Durations = { halfSeconds: number };

export type ClockState = Durations & {
  period: 1 | 2 | null;
  periodOffsetSeconds: number;
  periodStartedAt: number | null;
  periodEndedAt: number | null;
  pausedAt: number | null;
  accumulatedPauseSeconds: number;
  stoppageSeconds: number;
  /** Special rules: the display stops at the regulation end of each half. */
  noAddedTime: boolean;
  /** Active playing time of the periods already ended. */
  activeBaseSeconds: number;
};

export const initialClock = (halfSeconds: number, noAddedTime: boolean): ClockState => ({
  halfSeconds,
  noAddedTime,
  period: null,
  periodOffsetSeconds: 0,
  periodStartedAt: null,
  periodEndedAt: null,
  pausedAt: null,
  accumulatedPauseSeconds: 0,
  stoppageSeconds: 0,
  activeBaseSeconds: 0,
});

export function startPeriod(c: ClockState, period: 1 | 2, now: number): ClockState {
  return {
    ...c,
    period,
    periodOffsetSeconds: period === 1 ? 0 : c.halfSeconds,
    periodStartedAt: now,
    periodEndedAt: null,
    pausedAt: null,
    accumulatedPauseSeconds: 0,
    stoppageSeconds: 0,
  };
}

export function pause(c: ClockState, now: number): ClockState {
  if (c.periodStartedAt === null || c.periodEndedAt !== null || c.pausedAt !== null) return c;
  return { ...c, pausedAt: now };
}

export function resume(c: ClockState, now: number): ClockState {
  if (c.pausedAt === null) return c;
  return { ...c, pausedAt: null, accumulatedPauseSeconds: c.accumulatedPauseSeconds + Math.max(0, (now - c.pausedAt) / 1000) };
}

/** Freeze the clock at the end of a period (folds any open pause in first). */
export function endPeriod(c: ClockState, now: number): ClockState {
  const resumed = resume(c, now);
  const played = elapsedSeconds(resumed, now) - c.periodOffsetSeconds;
  return { ...resumed, periodEndedAt: now, activeBaseSeconds: c.activeBaseSeconds + Math.max(0, played) };
}

export function setStoppage(c: ClockState, seconds: number): ClockState {
  return { ...c, stoppageSeconds: Math.max(0, Math.round(seconds)) };
}

export function elapsedSeconds(c: ClockState, now: number): number {
  if (c.periodStartedAt === null) return c.periodOffsetSeconds;
  const end = c.periodEndedAt ?? now;
  const openPause = c.pausedAt !== null ? Math.max(0, (end - c.pausedAt) / 1000) : 0;
  const inPeriod = (end - c.periodStartedAt) / 1000 - c.accumulatedPauseSeconds - openPause;
  return c.periodOffsetSeconds + Math.max(0, inPeriod);
}

export function display(c: ClockState, now: number) {
  const regulationEnd = c.periodOffsetSeconds + c.halfSeconds;
  const raw = elapsedSeconds(c, now);
  const timeUp = c.period !== null && raw >= regulationEnd;
  const elapsed = c.noAddedTime ? Math.min(raw, regulationEnd) : raw;
  // Rounded up: a 7:30 half ends in the 8th minute.
  const regulationEndMinute = Math.ceil(regulationEnd / 60);
  const rawMinute = Math.min(Math.floor(elapsed / 60) + 1, c.noAddedTime ? regulationEndMinute : Infinity);
  const over = rawMinute > regulationEndMinute;
  const minute = over ? regulationEndMinute : rawMinute;
  const added = over ? rawMinute - regulationEndMinute : 0;
  const whole = Math.floor(elapsed);
  return {
    label: c.period === null ? "—" : added > 0 ? `${minute}+${added}'` : `${minute}'`,
    mmss: `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`,
    paused: c.pausedAt !== null,
    timeUp,
    announced: Math.round(c.stoppageSeconds / 60),
  };
}

/** Active playing time: pauses and half-time excluded. A temporary suspension is served on this clock. */
export function activeSeconds(c: ClockState, now: number): number {
  if (c.periodStartedAt === null || c.periodEndedAt !== null) return c.activeBaseSeconds;
  return c.activeBaseSeconds + Math.max(0, elapsedSeconds(c, now) - c.periodOffsetSeconds);
}

export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
