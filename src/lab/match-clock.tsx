"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { activeSeconds, display, elapsedSeconds, endPeriod, formatDuration, initialClock, pause, resume, setStoppage, startPeriod } from "./clock";
import type { ClockState } from "./clock";
import { useNow } from "./use-now";

const presets = {
  standard: { name: "Standard football", detail: "2 × 45:00 · stoppage time", halfSeconds: 45 * 60, noAddedTime: false, suspension: null },
  sixASide: { name: "Six-a-side novelty", detail: "2 × 8:00 · no added time · 60 s red-card suspension", halfSeconds: 8 * 60, noAddedTime: true, suspension: 60 },
} as const;
type PresetKey = keyof typeof presets;

const speeds = [1, 10, 60] as const;

/*
 * A simulated wall clock that can run faster than real time. The match clock
 * itself never ticks: every value below is recomputed from timestamps.
 */
type Sim = { wallBase: number; simBase: number; speed: number };
const simNow = (s: Sim, wall: number) => s.simBase + (wall - s.wallBase) * s.speed;
/** Wall-clock time at the moment an event handler runs. */
const wallClock = () => Date.now();

export function MatchClock() {
  const wall = useNow(200);
  const [preset, setPreset] = useState<PresetKey>("sixASide");
  const [sim, setSim] = useState<Sim>({ wallBase: 0, simBase: 0, speed: 10 });
  const [clock, setClock] = useState<ClockState>(() => initialClock(presets.sixASide.halfSeconds, true));
  const [cards, setCards] = useState<{ id: number; at: number }[]>([]);
  const nextId = useRef(1);

  const p = presets[preset];
  const now = wall === null ? 0 : simNow(sim, wall);
  const d = display(clock, now);
  const active = activeSeconds(clock, now);
  const running = clock.period !== null && clock.periodEndedAt === null;
  const halfOver = clock.period !== null && clock.periodEndedAt !== null;

  // Every action reads the time at the moment it happens, not at the last render.
  const act = (fn: (c: ClockState, t: number) => ClockState) => setClock((c) => fn(c, simNow(sim, wallClock())));

  const choosePreset = (key: PresetKey) => {
    setPreset(key);
    setClock(initialClock(presets[key].halfSeconds, presets[key].noAddedTime));
    setCards([]);
  };
  const setSpeed = (speed: number) => {
    const t = wallClock();
    setSim((s) => ({ wallBase: t, simBase: simNow(s, t), speed }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section aria-label="Match clock" className="rounded-2xl border border-line bg-ink-raised p-5 sm:p-7 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label">{clock.period === null ? "Not started" : clock.period === 1 ? (halfOver ? "Half-time" : "1st half") : halfOver ? "Full time" : "2nd half"}</p>
          <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[0.6875rem]", d.paused ? "border-warn text-warn" : "border-line text-fg-subtle")}>
            {d.paused ? "PAUSED" : running ? "RUNNING" : "STOPPED"} · {sim.speed}×
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-6" aria-live="off">
          <p className="font-serif text-[5.5rem] leading-[0.8] tabular-nums sm:text-[7rem]">{d.label}</p>
          <div className="pb-2 text-right">
            <p className="font-mono text-2xl tabular-nums text-fg">{d.mmss}</p>
            {d.announced > 0 && <p className="mt-1 font-mono text-sm text-accent">+{d.announced} announced</p>}
          </div>
        </div>
        {d.timeUp && running && (
          <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-fg">
            Regulation time reached.{" "}
            {clock.noAddedTime ? "No added time: the clock holds until the referee ends the half." : "Play continues into added time until the half is ended."}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {clock.period === null && <Btn primary onClick={() => act((c, t) => startPeriod(c, 1, t))}>Kick off</Btn>}
          {halfOver && clock.period === 1 && <Btn primary onClick={() => act((c, t) => startPeriod(c, 2, t))}>Start 2nd half</Btn>}
          {running && (d.paused ? <Btn primary onClick={() => act(resume)}>Resume</Btn> : <Btn onClick={() => act(pause)}>Pause</Btn>)}
          {running && !clock.noAddedTime && <Btn onClick={() => act((c) => setStoppage(c, c.stoppageSeconds + 60))}>Announce +1 min</Btn>}
          {running && p.suspension && (
            <Btn onClick={() => setCards((cs) => [...cs, { id: nextId.current++, at: activeSeconds(clock, simNow(sim, wallClock())) }])}>Red card</Btn>
          )}
          {running && <Btn onClick={() => act(endPeriod)}>End half</Btn>}
          <Btn onClick={() => choosePreset(preset)} className="ml-auto">Reset</Btn>
        </div>

        {p.suspension && (
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm text-fg-muted">
              Temporary suspensions are served in <em>active playing time</em>: pauses and half-time don&rsquo;t count.
            </p>
            {cards.length === 0 ? (
              <p className="mt-3 text-sm text-fg-subtle">No cards yet. Show one, then pause the clock and watch the countdown hold.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {cards.map((card) => {
                  const left = p.suspension! - (active - card.at);
                  return (
                    <li key={card.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm">
                      <span>Red card #{card.id}</span>
                      <span className={cn("font-mono tabular-nums", left <= 0 ? "text-ok" : "text-fg")}>
                        {left <= 0 ? "Served · may return" : `${formatDuration(left)} left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      <div className="space-y-6 lg:col-span-5">
        <fieldset className="rounded-2xl border border-line p-5 sm:p-6">
          <legend className="label px-1">Competition rules</legend>
          <div className="mt-2 space-y-2">
            {(Object.keys(presets) as PresetKey[]).map((key) => (
              <label key={key} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3.5", preset === key ? "border-fg" : "border-line")}>
                <input type="radio" name="preset" checked={preset === key} onChange={() => choosePreset(key)} className="mt-1 accent-[color:var(--accent)]" />
                <span>
                  <span className="block text-sm text-fg">{presets[key].name}</span>
                  <span className="mt-0.5 block text-xs text-fg-subtle">{presets[key].detail}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-fg-muted">Simulation speed</p>
            <div role="group" aria-label="Simulation speed" className="mt-2 flex gap-2">
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={sim.speed === s}
                  onClick={() => setSpeed(s)}
                  className={cn("h-10 flex-1 rounded-full border font-mono text-sm", sim.speed === s ? "border-fg bg-fg text-ink" : "border-line text-fg-muted")}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        <div className="rounded-2xl border border-line p-5 font-mono text-xs leading-relaxed text-fg-muted sm:p-6">
          <p className="label mb-3 font-sans">Derived, not counted</p>
          <p>elapsed = offset + (end ?? now) − start − pauses</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt>offset</dt>
            <dd className="text-right tabular-nums text-fg">{formatDuration(clock.periodOffsetSeconds)}</dd>
            <dt>since start</dt>
            <dd className="text-right tabular-nums text-fg">{clock.periodStartedAt === null ? "—" : formatDuration(((clock.periodEndedAt ?? now) - clock.periodStartedAt) / 1000)}</dd>
            <dt>pauses</dt>
            <dd className="text-right tabular-nums text-fg">
              {formatDuration(clock.accumulatedPauseSeconds + (clock.pausedAt !== null ? ((clock.periodEndedAt ?? now) - clock.pausedAt) / 1000 : 0))}
            </dd>
            <dt>elapsed</dt>
            <dd className="text-right tabular-nums text-accent">{formatDuration(elapsedSeconds(clock, now))}</dd>
            <dt>active play</dt>
            <dd className="text-right tabular-nums text-fg">{formatDuration(active)}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, primary, className }: { children: React.ReactNode; onClick: () => void; primary?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full px-5 text-sm font-medium transition-colors",
        primary ? "bg-fg text-ink hover:bg-accent hover:text-accent-fg" : "border border-line-strong text-fg hover:border-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}
