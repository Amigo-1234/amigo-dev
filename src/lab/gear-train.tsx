"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { DrawingDefs } from "@/components/drawing/defs";
import { Dimension } from "@/components/drawing/dimension";
import { cn } from "@/lib/cn";
import { formatSI, formatSig } from "@/lib/engineering/format";
import { analyseTrain, centreDistance, gearGeometry, gearPath, meshRotation, MIN_TEETH_NO_UNDERCUT } from "@/lib/engineering/gears";

import { NumberField } from "./number-field";

/*
 * Gear train instrument. Every number comes from lib/engineering/gears; the
 * drawing is the same geometry, positioned at the true centre distances and
 * turned by the same mesh relation, so what you see meshing is what was
 * calculated. Turn it by dragging any gear, with the arrow keys, or let it run.
 */

export type GearConfig = { teeth: number[]; module: number; rpm: number; torque: number; eta: number };

export const DEFAULT_GEARS: GearConfig = { teeth: [18, 42, 26], module: 2, rpm: 1450, torque: 12, eta: 0.98 };
const MODULES = [1, 1.25, 1.5, 2, 2.5, 3, 4] as const; // ISO 54 preferred series
const TEETH = { min: 8, max: 120 };
const LETTERS = "ABCD";
/** On-screen speed of the driver. Real speeds are far too fast to follow, so the drawing is slowed down. */
const SCREEN_RPM = 5;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const num = (v: string | null, fallback: number) => (v !== null && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : fallback);

export function parseGearConfig(sp: URLSearchParams | null): GearConfig {
  if (!sp) return DEFAULT_GEARS;
  const t = sp.get("t");
  const teeth = t
    ? t.split(",").slice(0, 4).map((s) => clamp(Math.round(num(s, 20)), TEETH.min, TEETH.max))
    : DEFAULT_GEARS.teeth;
  const m = num(sp.get("m"), DEFAULT_GEARS.module);
  return {
    teeth: teeth.length >= 2 ? teeth : DEFAULT_GEARS.teeth,
    module: (MODULES as readonly number[]).includes(m) ? m : DEFAULT_GEARS.module,
    rpm: clamp(num(sp.get("rpm"), DEFAULT_GEARS.rpm), 0, 6000),
    torque: clamp(num(sp.get("T"), DEFAULT_GEARS.torque), 0, 5000),
    eta: clamp(num(sp.get("eta"), DEFAULT_GEARS.eta * 100), 80, 100) / 100,
  };
}

function toSearch(c: GearConfig) {
  return `?t=${c.teeth.join(",")}&m=${c.module}&rpm=${c.rpm}&T=${c.torque}&eta=${Number((c.eta * 100).toFixed(1))}`;
}

/** Reads a shared configuration from the URL. Must sit inside <Suspense> on a static page. */
export function GearTrainFromURL() {
  const sp = useSearchParams();
  return <GearTrain initial={parseGearConfig(sp)} />;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const narrowQuery = "(max-width: 40rem)";
const subscribeMedia = (query: string) => (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const subscribeReducedMotion = subscribeMedia(reducedMotionQuery);
const subscribeNarrow = subscribeMedia(narrowQuery);

/** Centres zig-zag a little, so a train of four still fits a landscape drawing. */
function layout(teeth: number[], module: number) {
  const centres: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  const betas: number[] = [];
  for (let i = 0; i < teeth.length - 1; i++) {
    const beta = teeth.length === 2 ? -0.18 : i % 2 === 0 ? -0.42 : 0.42;
    const a = centreDistance(module, teeth[i], teeth[i + 1]);
    betas.push(beta);
    centres.push({ x: centres[i].x + a * Math.cos(beta), y: centres[i].y + a * Math.sin(beta) });
  }
  return { centres, betas };
}

/** Rotation of every gear for a given driver rotation, chained mesh by mesh. */
function rotations(teeth: number[], betas: number[], driver: number) {
  const out = [driver];
  for (let i = 0; i < betas.length; i++) out.push(meshRotation(teeth[i], teeth[i + 1], betas[i], out[i]));
  return out;
}

const deg = (rad: number) => (rad * 180) / Math.PI;

export function GearTrain({ initial }: { initial: GearConfig }) {
  const uid = useId().replace(/:/g, "");
  const [config, setConfig] = useState<GearConfig>(initial);
  const [selected, setSelected] = useState(0);
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(reducedMotionQuery).matches, () => false);
  const playing = userPlaying ?? !reducedMotion;
  // Phones get a narrower drawing frame, so annotations stay legible when it is scaled to fit.
  const compact = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false);

  const { teeth, module } = config;
  const result = useMemo(
    () => analyseTrain({ teeth, module, inputSpeed: config.rpm, inputTorque: config.torque, meshEfficiency: config.eta }),
    [teeth, module, config.rpm, config.torque, config.eta],
  );
  const geo = useMemo(() => teeth.map((n) => gearGeometry(n, module)), [teeth, module]);
  const paths = useMemo(() => geo.map((g) => gearPath(g, 7)), [geo]);
  const { centres, betas } = useMemo(() => layout(teeth, module), [teeth, module]);

  // Fit the scene (in mm) into a 960-wide drawing, keeping line weights and text constant.
  const W = compact ? 440 : 960;
  const pad = compact ? 36 : 70;
  const minX = Math.min(...centres.map((c, i) => c.x - geo[i].tipRadius));
  const maxX = Math.max(...centres.map((c, i) => c.x + geo[i].tipRadius));
  const minY = Math.min(...centres.map((c, i) => c.y - geo[i].tipRadius));
  const maxY = Math.max(...centres.map((c, i) => c.y + geo[i].tipRadius));
  const s = (W - 2 * pad) / (maxX - minX);
  const H = Math.round(Math.max(compact ? 260 : 380, (maxY - minY) * s + 2 * pad + 40));
  const ox = pad - minX * s;
  const oy = (H - (maxY - minY) * s) / 2 - minY * s + 10;
  const P = (c: { x: number; y: number }) => ({ x: ox + c.x * s, y: oy + c.y * s });

  // The drawing turns by direct DOM writes, never by re-rendering React.
  const angle = useRef(0);
  const gearRefs = useRef<Array<SVGGElement | null>>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const apply = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    apply.current = () => {
      const rot = rotations(teeth, betas, angle.current);
      gearRefs.current.forEach((el, i) => el?.setAttribute("transform", `rotate(${deg(rot[i]).toFixed(3)})`));
    };
    apply.current();
  }, [teeth, betas]);

  // Run loop: only while playing, on screen and in a visible tab.
  useEffect(() => {
    if (!playing) return;
    const svg = svgRef.current;
    let raf = 0;
    let last = 0;
    let onScreen = true;
    const omega = (SCREEN_RPM * 2 * Math.PI) / 60;
    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      angle.current += omega * dt;
      apply.current();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && onScreen && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    if (svg) io.observe(svg);
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", vis);
    start();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [playing]);

  // Keep the URL shareable without filling the history.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = toSearch(config);
      if (window.location.search !== next) window.history.replaceState(window.history.state, "", next);
    }, 300);
    return () => window.clearTimeout(id);
  }, [config]);

  // Turning by hand: the pointer's angle about the grabbed gear's centre drives that gear,
  // and the driver follows through the train's ratio.
  const drag = useRef<{ index: number; last: number; pointer: number } | null>(null);
  const pointerAngle = (e: React.PointerEvent, index: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return 0;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const c = P(centres[index]);
    return Math.atan2(pt.y - c.y, pt.x - c.x);
  };
  const slope = (index: number) => (index % 2 === 0 ? 1 : -1) * (teeth[0] / teeth[index]);
  const onPointerDown = (e: React.PointerEvent, index: number) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { index, last: pointerAngle(e, index), pointer: e.pointerId };
    setSelected(index);
    setUserPlaying(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const a = pointerAngle(e, d.index);
    let delta = a - d.last;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    d.last = a;
    angle.current += delta / slope(d.index);
    apply.current();
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = (Math.PI / teeth[0]) * (e.shiftKey ? 4 : 1);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") angle.current += step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") angle.current -= step;
    else return;
    e.preventDefault();
    setUserPlaying(false);
    apply.current();
  };

  const update = (patch: Partial<GearConfig>) => setConfig((c) => ({ ...c, ...patch }));
  const setTeeth = (i: number, n: number) =>
    update({ teeth: teeth.map((t, j) => (j === i ? clamp(Math.round(n), TEETH.min, TEETH.max) : t)) });
  const addGear = () => {
    if (teeth.length >= 4) return;
    update({ teeth: [...teeth, 24] });
    setSelected(teeth.length);
  };
  const removeGear = () => {
    if (teeth.length <= 2) return;
    update({ teeth: teeth.slice(0, -1) });
    setSelected((s) => Math.min(s, teeth.length - 2));
  };

  const out = result.gears[result.gears.length - 1];
  const last = teeth.length - 1;
  const rot0 = rotations(teeth, betas, 0);
  const describe = `${teeth.length} spur gears in a row, module ${module}: ${teeth
    .map((n, i) => `${LETTERS[i]} has ${n} teeth`)
    .join(", ")}. A is the driver.`;
  const summary = `Output gear ${LETTERS[last]}: ${formatSig(out.speed, 4)} rpm, ${
    out.direction === 1 ? "same direction as the driver" : "opposite direction to the driver"
  }, ${formatSig(out.torque, 3)} newton metres. Ratio ${formatSig(result.ratio, 4)} to 1.`;

  return (
    <div className="grid gap-px border border-line-strong bg-line lg:grid-cols-12">
      {/* Drawing */}
      <figure className="relative bg-ink-sunken [--drawing-bg:var(--ink-sunken)] lg:col-span-8">
        <div aria-hidden="true" className="grid-paper absolute inset-0 opacity-60" />
        <div
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label="Gear train drawing. Drag a gear, or use the arrow keys, to turn the train."
          role="group"
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        >
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-fg" role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
            <title id={`${uid}-t`}>Gear train</title>
            <desc id={`${uid}-d`}>{describe}</desc>
            <DrawingDefs id={uid} />

            {/* Centre lines and pitch circles, the construction layer. */}
            <g stroke="var(--construction)" strokeWidth="0.8" fill="none" strokeDasharray="14 4 2 4">
              {centres.map((c, i) => {
                const p = P(c);
                const r = geo[i].tipRadius * s + 14;
                return (
                  <g key={i}>
                    <line x1={p.x - r} y1={p.y} x2={p.x + r} y2={p.y} />
                    <line x1={p.x} y1={p.y - r} x2={p.x} y2={p.y + r} />
                    <circle cx={p.x} cy={p.y} r={geo[i].pitchRadius * s} />
                  </g>
                );
              })}
            </g>

            {/* Gears */}
            {centres.map((c, i) => {
              const p = P(c);
              const g = geo[i];
              // Screen-unit radii for the hub, bore and recessed web.
              const hub = Math.max(g.rootRadius * 0.34, g.module * 2.2) * s;
              const bore = hub * 0.45;
              const rim = (g.rootRadius - g.module * 1.4) * s;
              return (
                <g key={i} transform={`translate(${p.x} ${p.y})`}>
                  <g
                    ref={(el) => {
                      gearRefs.current[i] = el;
                    }}
                    transform={`rotate(${deg(rot0[i]).toFixed(3)})`}
                    onPointerDown={(e) => onPointerDown(e, i)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className="cursor-grab touch-none"
                  >
                    {/* Only the tooth outline is drawn in millimetres; the rest is in screen units so hatching stays even. */}
                    <path
                      d={paths[i]}
                      transform={`scale(${s})`}
                      fill="var(--ink-raised)"
                      stroke={i === selected ? "var(--accent)" : "currentColor"}
                      strokeWidth={i === selected ? 1.6 : 1.1}
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                    {/* Web: a recessed ring between rim and hub, hatched like a section. */}
                    {rim > hub + 4 && (
                      <>
                        <circle r={(rim + hub) / 2} fill="none" stroke={`url(#${uid}-hatch)`} strokeWidth={rim - hub} />
                        <circle r={rim} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
                      </>
                    )}
                    <circle r={hub} fill="var(--ink-raised)" stroke="currentColor" strokeWidth="1" />
                    {/* Bore with a keyway, so the rotation reads at a glance. */}
                    <path
                      d={`M${-bore * 0.3} ${-bore * 0.95}L${-bore * 0.3} ${-bore * 1.32}L${bore * 0.3} ${-bore * 1.32}L${bore * 0.3} ${-bore * 0.95}A${bore} ${bore} 0 1 1 ${-bore * 0.3} ${-bore * 0.95}Z`}
                      fill="var(--ink-sunken)"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    {/* A redline index mark on the rim of the driver. */}
                    {i === 0 && <circle cx={(g.rootRadius - g.module * 0.7) * s} cy={0} r={Math.max(3, g.module * 0.42 * s)} fill="var(--accent)" />}
                  </g>
                </g>
              );
            })}

            {/* Balloons, direction arrows and the first centre distance. */}
            {centres.map((c, i) => {
              const p = P(c);
              const r = geo[i].tipRadius * s;
              const above = i % 2 === 0 ? (teeth.length === 2 ? 1 : -1) : 1;
              const bx = p.x + (i === 0 ? -r * 0.72 : r * 0.72);
              const by = p.y + above * -r * 0.92;
              const dir = result.gears[i].direction;
              const arc = r + 12;
              const a0 = above === -1 ? -2.0 : 1.15;
              const a1 = a0 + 0.62 * dir;
              return (
                <g key={i} aria-hidden="true">
                  <line x1={p.x + (bx - p.x) * 0.72} y1={p.y + (by - p.y) * 0.72} x2={bx} y2={by} stroke="currentColor" strokeOpacity="0.6" strokeWidth="0.75" />
                  <circle cx={bx} cy={by} r="13" fill="var(--ink-sunken)" stroke={i === selected ? "var(--accent)" : "currentColor"} strokeWidth="1" />
                  <text x={bx} y={by + 0.5} textAnchor="middle" dominantBaseline="middle" className="dim-text" style={{ fontSize: 12 }}>
                    {LETTERS[i]}
                  </text>
                  <path
                    d={`M${p.x + arc * Math.cos(a0)} ${p.y + arc * Math.sin(a0)} A${arc} ${arc} 0 0 ${dir === 1 ? 1 : 0} ${p.x + arc * Math.cos(a1)} ${p.y + arc * Math.sin(a1)}`}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.2"
                    markerEnd={`url(#${uid}-arrow)`}
                    className="text-accent"
                  />
                </g>
              );
            })}
            {(() => {
              const a = P(centres[0]);
              const b = P(centres[1]);
              return (
                <Dimension
                  defs={uid}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  offset={compact ? 28 : teeth.length === 2 ? 48 : 40}
                  label={`a = ${formatSig(result.meshes[0].centreDistance, 4)} mm`}
                  className="text-fg-muted"
                />
              );
            })()}
          </svg>
        </div>

        <figcaption className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={() => setUserPlaying(!playing)}
            aria-pressed={playing}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 font-mono text-xs text-fg transition-colors hover:border-fg"
          >
            <span aria-hidden="true" className="text-accent">
              {playing ? "❚❚" : "▶"}
            </span>
            {playing ? "Pause" : "Run"}
          </button>
          <p className="font-mono text-[0.6875rem] text-fg-subtle">
            Drawn slowed down: driver at {SCREEN_RPM} rpm on screen · drag a gear to turn it
          </p>
        </figcaption>
      </figure>

      {/* Controls */}
      <div className="bg-ink-raised p-4 sm:p-6 lg:col-span-4">
        <fieldset>
          <legend className="label">Gears · driver first</legend>
          <ol className="mt-3 space-y-2">
            {teeth.map((n, i) => (
              <li
                key={i}
                onFocus={() => setSelected(i)}
                onPointerEnter={() => setSelected(i)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                  i === selected ? "border-accent bg-accent-soft" : "border-line",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current font-mono text-xs" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <label htmlFor={`${uid}-n${i}`} className="min-w-0 flex-1 text-sm">
                  {i === 0 ? "Driver" : i === last ? "Output" : "Idler"}
                  <span className="block font-mono text-[0.6875rem] text-fg-muted">⌀ {formatSig(geo[i].pitchRadius * 2, 4)} mm pitch</span>
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setTeeth(i, n - 1)}
                    disabled={n <= TEETH.min}
                    aria-label={`One tooth fewer on gear ${LETTERS[i]}`}
                    className="grid size-11 place-items-center rounded-l-lg border border-line-strong text-lg text-fg-muted hover:text-fg disabled:opacity-40"
                  >
                    −
                  </button>
                  <NumberField
                    id={`${uid}-n${i}`}
                    value={n}
                    min={TEETH.min}
                    max={TEETH.max}
                    integer
                    onCommit={(v) => setTeeth(i, v)}
                    aria-describedby={`${uid}-teeth-unit`}
                    className="h-11 w-14 border-y border-line-strong bg-ink"
                    inputClassName="h-full w-full text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setTeeth(i, n + 1)}
                    disabled={n >= TEETH.max}
                    aria-label={`One tooth more on gear ${LETTERS[i]}`}
                    className="grid size-11 place-items-center rounded-r-lg border border-line-strong text-lg text-fg-muted hover:text-fg disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <span id={`${uid}-teeth-unit`} className="sr-only">
            teeth
          </span>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={addGear} disabled={teeth.length >= 4} className="h-10 flex-1 rounded-lg border border-line-strong text-sm text-fg-muted hover:text-fg disabled:opacity-40">
              + Add gear
            </button>
            <button type="button" onClick={removeGear} disabled={teeth.length <= 2} className="h-10 flex-1 rounded-lg border border-line-strong text-sm text-fg-muted hover:text-fg disabled:opacity-40">
              − Remove last
            </button>
          </div>
        </fieldset>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="text-sm">
            Module
            <select
              value={module}
              onChange={(e) => update({ module: Number(e.target.value) })}
              className="mt-1.5 block h-11 w-full rounded-lg border border-line-strong bg-ink px-3 font-mono text-sm text-fg"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  m {m} mm
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Input torque
            <NumberField
              value={config.torque}
              min={0}
              max={5000}
              step={0.5}
              unit="N·m"
              onCommit={(v) => update({ torque: v })}
              className="mt-1.5 h-11 rounded-lg border border-line-strong bg-ink"
              inputClassName="h-full w-full px-3"
            />
          </label>
        </div>

        <label className="mt-5 block text-sm">
          <span className="flex justify-between">
            Input speed <output className="font-mono tabular-nums text-fg">{config.rpm} rpm</output>
          </span>
          <input
            type="range"
            min={0}
            max={3000}
            step={10}
            value={config.rpm}
            onChange={(e) => update({ rpm: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="mt-5 block text-sm">
          <span className="flex justify-between">
            Efficiency per mesh <output className="font-mono tabular-nums text-fg">{formatSig(config.eta * 100, 3)} %</output>
          </span>
          <input
            type="range"
            min={90}
            max={100}
            step={0.5}
            value={config.eta * 100}
            onChange={(e) => update({ eta: Number(e.target.value) / 100 })}
            className="mt-2 w-full accent-[var(--accent)]"
          />
        </label>
      </div>

      {/* Readouts */}
      <div className="bg-ink p-4 sm:p-6 lg:col-span-12">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label">Output · gear {LETTERS[last]}</p>
            <p className="mt-3 font-serif text-[clamp(2.75rem,2rem+2.5vw,4rem)] leading-none tabular-nums">
              {formatSig(out.speed, 4)}
              <span className="ml-2 font-mono text-sm text-fg-muted">rpm</span>
            </p>
            <p className="mt-3 font-mono text-sm text-fg-muted">
              {formatSig(out.torque, 3)} N·m · {out.direction === 1 ? "same way as A ↻" : "against A ↺"}
            </p>
            <p className="mt-1 font-mono text-sm text-fg-muted">
              ratio {formatSig(result.ratio, 4)} : 1 · {formatSig(result.efficiency * 100, 3)} % overall
            </p>
            <p className="sr-only" aria-live="polite">
              {summary}
            </p>
          </div>
          <div className="overflow-x-auto lg:col-span-8">
            <table className="w-full min-w-[30rem] text-left font-mono text-xs tabular-nums">
              <caption className="sr-only">Speed, direction, torque and power of every gear</caption>
              <thead className="text-fg-subtle">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-3 font-normal">Gear</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Teeth</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Speed</th>
                  <th scope="col" className="py-2 pr-3 font-normal">Turns</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Torque</th>
                  <th scope="col" className="py-2 text-right font-normal">Power</th>
                </tr>
              </thead>
              <tbody>
                {result.gears.map((g, i) => (
                  <tr key={i} className={cn("border-b border-line", i === selected && "text-accent")}>
                    <th scope="row" className="py-2 pr-3 font-normal">
                      {LETTERS[i]}
                    </th>
                    <td className="py-2 pr-3 text-right">{g.teeth}</td>
                    <td className="py-2 pr-3 text-right">{formatSig(g.speed, 4)} rpm</td>
                    <td className="py-2 pr-3">{i === 0 ? "driver" : g.direction === 1 ? "with A" : "against A"}</td>
                    <td className="py-2 pr-3 text-right">{formatSig(g.torque, 3)} N·m</td>
                    <td className="py-2 text-right">{formatSI(g.power, "W")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="mt-4 w-full min-w-[30rem] text-left font-mono text-xs tabular-nums">
              <caption className="sr-only">Centre distance and contact ratio of every mesh</caption>
              <thead className="text-fg-subtle">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-3 font-normal">Mesh</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Centre distance</th>
                  <th scope="col" className="py-2 pr-3 text-right font-normal">Contact ratio</th>
                  <th scope="col" className="py-2 text-right font-normal">Pitch-line speed</th>
                </tr>
              </thead>
              <tbody>
                {result.meshes.map((m) => (
                  <tr key={m.index} className="border-b border-line">
                    <th scope="row" className="py-2 pr-3 font-normal">
                      {LETTERS[m.index]}–{LETTERS[m.index + 1]}
                    </th>
                    <td className="py-2 pr-3 text-right">{formatSig(m.centreDistance, 4)} mm</td>
                    <td className={cn("py-2 pr-3 text-right", (m.interference || m.contactRatio < 1.2) && "text-warn")}>
                      {m.interference ? "interference" : formatSig(m.contactRatio, 3)}
                    </td>
                    <td className="py-2 text-right">{formatSig(m.pitchLineVelocity, 3)} m/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {result.warnings.length > 0 && (
          <ul className="mt-5 space-y-2 border-l-2 border-warn pl-4 text-sm text-warn" aria-live="polite">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        {result.warnings.length === 0 && teeth.every((n) => n >= MIN_TEETH_NO_UNDERCUT) && (
          <p className="mt-5 font-mono text-[0.6875rem] text-fg-subtle">No undercut or interference: every gear has at least {MIN_TEETH_NO_UNDERCUT} teeth and every contact ratio is above 1.2.</p>
        )}
      </div>
    </div>
  );
}
