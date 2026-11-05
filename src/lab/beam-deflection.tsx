"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { DrawingDefs } from "@/components/drawing/defs";
import { Dimension } from "@/components/drawing/dimension";
import { cn } from "@/lib/cn";
import { analyseBeam, type BeamInput, DEFLECTION_GUIDE, deflectionAt, type LoadType, MATERIALS, rectangleSection, sampleBeam, type Support } from "@/lib/engineering/beam";
import { formatSI, formatSig } from "@/lib/engineering/format";

import { NumberField } from "./number-field";

/*
 * Beam deflection instrument. Every number comes from lib/engineering/beam.
 * The elevation shows the supports, the load (drag a point load along the
 * span) and the deflected shape, exaggerated by a stated factor; the shear and
 * bending-moment diagrams below share its horizontal scale.
 */

export type BeamConfig = {
  support: Support;
  load: LoadType;
  /** m */
  length: number;
  /** kN for a point load, kN/m for a UDL */
  magnitude: number;
  /** m from the left support (simply supported point load only) */
  position: number;
  /** section width and depth, mm */
  b: number;
  h: number;
  material: string;
};

export const DEFAULT_BEAM: BeamConfig = {
  support: "simply-supported",
  load: "point",
  length: 4,
  magnitude: 4,
  position: 1.6,
  b: 75,
  h: 200,
  material: "timber-c24",
};

const LIMITS = { length: [0.5, 12], magnitude: [0, 200], b: [10, 500], h: [10, 1000] } as const;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const num = (v: string | null, fallback: number) => (v !== null && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : fallback);
const roundTo = (v: number, step: number) => Math.round(v / step) * step;

export function parseBeamConfig(sp: URLSearchParams | null): BeamConfig {
  if (!sp) return DEFAULT_BEAM;
  const support: Support = sp.get("s") === "cantilever" ? "cantilever" : sp.get("s") === "ss" ? "simply-supported" : DEFAULT_BEAM.support;
  const load: LoadType = sp.get("q") === "udl" ? "udl" : sp.get("q") === "point" ? "point" : DEFAULT_BEAM.load;
  const length = clamp(num(sp.get("L"), DEFAULT_BEAM.length), ...LIMITS.length);
  const material = MATERIALS.some((m) => m.id === sp.get("mat")) ? sp.get("mat")! : DEFAULT_BEAM.material;
  return {
    support,
    load,
    length,
    magnitude: clamp(num(sp.get("P"), DEFAULT_BEAM.magnitude), ...LIMITS.magnitude),
    position: clamp(num(sp.get("a"), Math.min(DEFAULT_BEAM.position, length / 2)), 0, length),
    b: clamp(num(sp.get("b"), DEFAULT_BEAM.b), ...LIMITS.b),
    h: clamp(num(sp.get("h"), DEFAULT_BEAM.h), ...LIMITS.h),
    material,
  };
}

function toSearch(c: BeamConfig) {
  const q = new URLSearchParams({
    s: c.support === "cantilever" ? "cantilever" : "ss",
    q: c.load,
    L: String(c.length),
    P: String(c.magnitude),
    b: String(c.b),
    h: String(c.h),
    mat: c.material,
  });
  if (c.support === "simply-supported" && c.load === "point") q.set("a", String(c.position));
  return `?${q.toString()}`;
}

/** Reads a shared configuration from the URL. Must sit inside <Suspense> on a static page. */
export function BeamDeflectionFromURL() {
  const sp = useSearchParams();
  return <BeamDeflection initial={parseBeamConfig(sp)} />;
}

const narrowQuery = "(max-width: 40rem)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(narrowQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** A tidy exaggeration factor: 1, 2 or 5 times a power of ten. */
function niceFactor(raw: number) {
  if (!(raw > 1)) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

const pathOf = (pts: Array<[number, number]>) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");

export function BeamDeflection({ initial }: { initial: BeamConfig }) {
  const uid = useId().replace(/:/g, "");
  const [config, setConfig] = useState<BeamConfig>(initial);
  const compact = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false);

  const material = MATERIALS.find((m) => m.id === config.material) ?? MATERIALS[0];
  const section = rectangleSection(config.b / 1000, config.h / 1000);
  const pointLoadOnSpan = config.support === "simply-supported" && config.load === "point";
  const input: BeamInput = useMemo(
    () => ({
      support: config.support,
      load: config.load,
      length: config.length,
      magnitude: config.magnitude * 1000,
      position: pointLoadOnSpan ? config.position : undefined,
      E: material.E,
      I: section.I,
      c: section.c,
    }),
    [config.support, config.load, config.length, config.magnitude, config.position, pointLoadOnSpan, material.E, section.I, section.c],
  );
  const r = useMemo(() => analyseBeam(input), [input]);
  const samples = useMemo(() => sampleBeam(input, 160), [input]);

  // Keep the URL shareable without filling the history.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = toSearch(config);
      if (window.location.search !== next) window.history.replaceState(window.history.state, "", next);
    }, 300);
    return () => window.clearTimeout(id);
  }, [config]);

  // Drawing geometry, in viewBox units.
  const W = compact ? 440 : 960;
  const left = compact ? 34 : 90;
  const right = W - (compact ? 30 : 230); // room for the section inset on wide screens
  const span = right - left;
  const X = (x: number) => left + (x / config.length) * span;
  const beamY = 118;
  const beamDepth = compact ? 10 : 14;
  const maxDraw = compact ? 34 : 46; // the largest deflection is drawn this many units
  const factor = r.maxDeflection > 0 ? niceFactor((maxDraw / span) * config.length / r.maxDeflection) : 1;
  const drawn = (d: number) => (d * factor * span) / config.length;
  const diagram = { h: compact ? 54 : 64, gap: compact ? 46 : 52 };
  const dimY = beamY + maxDraw + 70; // span dimension, below the δmax note
  const sfdY = dimY + 58;
  const bmdY = sfdY + diagram.h * 2 + diagram.gap;
  const H = bmdY + diagram.h + (compact ? 40 : 46);

  const maxV = Math.max(...samples.map((s) => Math.abs(s.shear))) || 1;
  const maxM = Math.max(...samples.map((s) => Math.abs(s.moment))) || 1;
  const sfd = samples.map((s): [number, number] => [X(s.x), sfdY + diagram.h - (s.shear / maxV) * diagram.h]);
  const bmdPos = r.maxMoment >= 0; // sagging beams plot up, hogging (cantilever) down, both on the tension-free side
  const bmd = samples.map((s): [number, number] => [X(s.x), bmdY + (bmdPos ? diagram.h : 0) - (s.moment / maxM) * diagram.h]);
  const curve = samples.map((s): [number, number] => [X(s.x), beamY + drawn(s.deflection)]);
  // The bent beam as a closed outline: top edge left to right, bottom edge back.
  const beamTop = curve.map(([x, y]): [number, number] => [x, y - beamDepth / 2]);
  const beamBottom = curve.map(([x, y]): [number, number] => [x, y + beamDepth / 2]).reverse();

  // Dragging the point load along the span.
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<number | null>(null);
  const toBeamX = (e: React.PointerEvent) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return config.position;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return clamp(roundTo(((p.x - left) / span) * config.length, 0.05), 0, config.length);
  };
  const update = (patch: Partial<BeamConfig>) =>
    setConfig((c) => {
      const next = { ...c, ...patch };
      return { ...next, position: clamp(next.position, 0, next.length) };
    });

  const udlArrows = compact ? 9 : 15;
  const loadX = X(pointLoadOnSpan ? config.position : config.length);
  const ratio = r.maxDeflection > 0 ? config.length / r.maxDeflection : Infinity;
  const utilisation = r.maxStress / material.strength;
  const kN = config.load === "point" ? "kN" : "kN/m";
  const largeDeflection = r.maxDeflection > config.length / 50;
  const describe = `${config.support === "cantilever" ? "Cantilever" : "Simply supported beam"}, ${formatSig(config.length, 3)} m span, ${
    config.load === "point"
      ? `${formatSig(config.magnitude, 3)} kN point load ${pointLoadOnSpan ? `${formatSig(config.position, 3)} m from the left support` : "at the free end"}`
      : `${formatSig(config.magnitude, 3)} kN/m uniform load`
  }. Maximum deflection ${formatSI(r.maxDeflection, "m")}.`;

  return (
    <div className="grid gap-px border border-line-strong bg-line lg:grid-cols-12">
      <figure className="relative flex flex-col bg-ink-sunken [--drawing-bg:var(--ink-sunken)] lg:col-span-8">
        <div aria-hidden="true" className="grid-paper absolute inset-0 opacity-60" />
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="relative my-auto block h-auto w-full text-fg" role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
          <title id={`${uid}-t`}>Beam elevation with shear force and bending moment diagrams</title>
          <desc id={`${uid}-d`}>{describe}</desc>
          <DrawingDefs id={uid} />

          {/* Sheet labels */}
          <g className="dim-text text-fg-subtle" aria-hidden="true">
            <text x={left} y={26}>ELEVATION</text>
            <text x={left} y={sfdY - 14}>SHEAR FORCE V</text>
            <text x={left} y={bmdY - 14}>BENDING MOMENT M</text>
          </g>

          {/* Undeflected beam (construction) and deflected shape */}
          <rect x={left} y={beamY - beamDepth / 2} width={span} height={beamDepth} fill="none" stroke="var(--construction)" strokeDasharray="6 4" />
          <path
            d={`${pathOf(beamTop)}L${pathOf(beamBottom).slice(1)}Z`}
            fill={`url(#${uid}-hatch)`}
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />

          {/* Supports */}
          {config.support === "simply-supported" ? (
            <g stroke="currentColor" strokeWidth="1.1" fill="var(--ink-raised)" aria-hidden="true">
              {/* Pin */}
              <path d={`M${left} ${beamY + beamDepth / 2}l-11 19h22z`} />
              <line x1={left - 18} y1={beamY + beamDepth / 2 + 19} x2={left + 18} y2={beamY + beamDepth / 2 + 19} />
              {/* Roller */}
              <path d={`M${right} ${beamY + beamDepth / 2}l-11 15h22z`} />
              <circle cx={right - 6} cy={beamY + beamDepth / 2 + 19} r="3.5" />
              <circle cx={right + 6} cy={beamY + beamDepth / 2 + 19} r="3.5" />
              <line x1={right - 18} y1={beamY + beamDepth / 2 + 23} x2={right + 18} y2={beamY + beamDepth / 2 + 23} />
            </g>
          ) : (
            <g aria-hidden="true">
              <rect x={left - 16} y={beamY - 42} width="16" height="84" fill={`url(#${uid}-hatch)`} />
              <line x1={left} y1={beamY - 42} x2={left} y2={beamY + 42} stroke="currentColor" strokeWidth="1.6" />
            </g>
          )}

          {/* Loads */}
          {config.load === "udl" ? (
            <g className="text-accent" aria-hidden="true">
              <line x1={left} y1={beamY - 46} x2={right} y2={beamY - 46} stroke="currentColor" strokeWidth="1.2" />
              {Array.from({ length: udlArrows }, (_, i) => {
                const x = left + (span * i) / (udlArrows - 1);
                return <line key={i} x1={x} y1={beamY - 46} x2={x} y2={beamY - beamDepth / 2 - 2} stroke="currentColor" strokeWidth="1.1" markerEnd={`url(#${uid}-load)`} />;
              })}
              <text x={(left + right) / 2} y={beamY - 54} textAnchor="middle" className="dim-text" style={{ fontSize: 12 }}>
                w = {formatSig(config.magnitude, 3)} kN/m
              </text>
            </g>
          ) : (
            <g
              className={cn("text-accent", pointLoadOnSpan && "cursor-ew-resize touch-none")}
              onPointerDown={(e) => {
                if (!pointLoadOnSpan) return;
                (e.currentTarget as Element).setPointerCapture(e.pointerId);
                dragging.current = e.pointerId;
              }}
              onPointerMove={(e) => {
                if (dragging.current === e.pointerId) update({ position: toBeamX(e) });
              }}
              onPointerUp={() => (dragging.current = null)}
              onPointerCancel={() => (dragging.current = null)}
            >
              {/* Generous invisible hit area around the arrow. */}
              {pointLoadOnSpan && <rect x={loadX - 22} y={beamY - 84} width="44" height="80" fill="transparent" />}
              <line x1={loadX} y1={beamY - 74} x2={loadX} y2={beamY + drawn(pointLoadOnSpan ? deflectionAt(input, config.position) : r.maxDeflection) - beamDepth / 2 - 2} stroke="currentColor" strokeWidth="2" markerEnd={`url(#${uid}-load)`} />
              {pointLoadOnSpan && <circle cx={loadX} cy={beamY - 74} r="6" fill="var(--ink-sunken)" stroke="currentColor" strokeWidth="1.5" />}
              <text x={loadX + (loadX > right - 70 ? -12 : 12)} y={beamY - 66} textAnchor={loadX > right - 70 ? "end" : "start"} className="dim-text" style={{ fontSize: 12 }}>
                P = {formatSig(config.magnitude, 3)} kN
              </text>
            </g>
          )}

          {/* Maximum deflection marker */}
          {r.maxDeflection > 0 && (
            <g className="text-accent" aria-hidden="true">
              <circle cx={X(r.maxDeflectionAt)} cy={beamY + drawn(r.maxDeflection) + beamDepth / 2} r="3" fill="currentColor" />
              <line x1={X(r.maxDeflectionAt)} y1={beamY + drawn(r.maxDeflection) + beamDepth / 2 + 4} x2={X(r.maxDeflectionAt)} y2={beamY + maxDraw + beamDepth + 10} stroke="currentColor" strokeWidth="0.75" />
              <text x={X(r.maxDeflectionAt) + (r.maxDeflectionAt > config.length * 0.7 ? -6 : 6)} y={beamY + maxDraw + beamDepth + 22} textAnchor={r.maxDeflectionAt > config.length * 0.7 ? "end" : "start"} className="dim-text" style={{ fontSize: 12 }}>
                δmax {formatSI(r.maxDeflection, "m")} at {formatSig(r.maxDeflectionAt, 3)} m
              </text>
            </g>
          )}

          {/* Span dimension */}
          <Dimension defs={uid} x1={left} y1={dimY} x2={right} y2={dimY} offset={0} label={`L = ${formatSig(config.length, 3)} m`} className="text-fg-muted" />
          {pointLoadOnSpan && config.position > 0 && (
            <Dimension defs={uid} x1={left} y1={beamY - 84} x2={loadX} y2={beamY - 84} offset={0} label={`a = ${formatSig(config.position, 3)} m`} className="text-fg-muted" />
          )}

          {/* Shear force diagram */}
          <line x1={left} y1={sfdY + diagram.h} x2={right} y2={sfdY + diagram.h} stroke="var(--construction)" />
          <path d={`${pathOf([[left, sfdY + diagram.h], ...sfd, [right, sfdY + diagram.h]])}Z`} fill="var(--accent-soft)" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
          <text x={X(0) + 6} y={sfd[0][1] + (samples[0].shear >= 0 ? 14 : -6)} className="dim-text" style={{ fontSize: 11 }} aria-hidden="true">
            {formatSI(samples[0].shear, "N")}
          </text>
          {config.support === "simply-supported" && (
            <text x={right - 6} y={sfd[sfd.length - 1][1] + (samples[samples.length - 1].shear >= 0 ? 14 : -6)} textAnchor="end" className="dim-text" style={{ fontSize: 11 }} aria-hidden="true">
              {formatSI(samples[samples.length - 1].shear, "N")}
            </text>
          )}

          {/* Bending moment diagram */}
          <line x1={left} y1={bmdY + (bmdPos ? diagram.h : 0)} x2={right} y2={bmdY + (bmdPos ? diagram.h : 0)} stroke="var(--construction)" />
          <path
            d={`${pathOf([[left, bmdY + (bmdPos ? diagram.h : 0)], ...bmd, [right, bmdY + (bmdPos ? diagram.h : 0)]])}Z`}
            fill="var(--accent-soft)"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <g className="text-accent" aria-hidden="true">
            <circle cx={X(r.maxMomentAt)} cy={bmdY + (bmdPos ? diagram.h : 0) - (r.maxMoment / maxM) * diagram.h} r="3" fill="currentColor" />
            <text
              x={X(r.maxMomentAt) + (r.maxMomentAt > config.length * 0.7 ? -8 : 8)}
              y={bmdY + (bmdPos ? diagram.h : 0) - (r.maxMoment / maxM) * diagram.h + (bmdPos ? -6 : 16)}
              textAnchor={r.maxMomentAt > config.length * 0.7 ? "end" : "start"}
              className="dim-text"
              style={{ fontSize: 12 }}
            >
              M {formatSI(r.maxMoment, "N·m")}
            </text>
          </g>

          {/* Section inset */}
          {!compact && (
            <g aria-hidden="true">
              {(() => {
                const box = 120;
                const k = box / Math.max(config.b, config.h);
                const w = config.b * k;
                const hh = config.h * k;
                const cx = W - 110;
                const cy = 130;
                return (
                  <g>
                    <text x={cx} y={26} textAnchor="middle" className="dim-text text-fg-subtle">
                      SECTION A–A
                    </text>
                    <rect x={cx - w / 2} y={cy - hh / 2} width={w} height={hh} fill={`url(#${uid}-hatch)`} stroke="currentColor" strokeWidth="1.3" />
                    <line x1={cx - w / 2 - 14} y1={cy} x2={cx + w / 2 + 14} y2={cy} stroke="var(--construction)" strokeDasharray="14 4 2 4" />
                    <Dimension defs={uid} x1={cx - w / 2} y1={cy + hh / 2} x2={cx + w / 2} y2={cy + hh / 2} offset={18} label={`b ${formatSig(config.b, 3)}`} className="text-fg-muted" />
                    <Dimension defs={uid} x1={cx + w / 2} y1={cy + hh / 2} x2={cx + w / 2} y2={cy - hh / 2} offset={18} label={`h ${formatSig(config.h, 3)}`} className="text-fg-muted" />
                    <text x={cx} y={cy + hh / 2 + 58} textAnchor="middle" className="dim-text text-fg-subtle">
                      I = {formatSig(section.I * 1e6, 3)} × 10⁶ mm⁴
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>
        <figcaption className="relative flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 font-mono text-[0.6875rem] text-fg-subtle">
          <span>Deflection drawn ×{factor.toLocaleString("en-GB")} · diagrams to their own scale</span>
          {pointLoadOnSpan && <span>Drag the load along the span</span>}
        </figcaption>
      </figure>

      {/* Controls */}
      <div className="bg-ink-raised p-4 sm:p-6 lg:col-span-4">
        <fieldset>
          <legend className="label">Supports</legend>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-line-strong p-1">
            {(
              [
                ["simply-supported", "Simply supported"],
                ["cantilever", "Cantilever"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className={cn("grid h-10 cursor-pointer place-items-center rounded-md text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent", config.support === v ? "bg-fg text-ink" : "text-fg-muted hover:text-fg")}>
                <input type="radio" name={`${uid}-support`} value={v} checked={config.support === v} onChange={() => update({ support: v })} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="label">Load</legend>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-line-strong p-1">
            {(
              [
                ["point", config.support === "cantilever" ? "Point at tip" : "Point load"],
                ["udl", "Uniform"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className={cn("grid h-10 cursor-pointer place-items-center rounded-md text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent", config.load === v ? "bg-fg text-ink" : "text-fg-muted hover:text-fg")}>
                <input type="radio" name={`${uid}-load`} value={v} checked={config.load === v} onChange={() => update({ load: v })} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 block text-sm">
          <span className="flex justify-between">
            Span L <span className="font-mono tabular-nums text-fg">{formatSig(config.length, 3)} m</span>
          </span>
          <input
            type="range"
            min={LIMITS.length[0]}
            max={LIMITS.length[1]}
            step={0.1}
            value={config.length}
            aria-valuetext={`${formatSig(config.length, 3)} metres`}
            onChange={(e) => update({ length: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--accent)]"
          />
        </label>
        <label className="mt-5 block text-sm">
          <span className="flex justify-between">
            {config.load === "point" ? "Load P" : "Load w"}
            <span className="font-mono tabular-nums text-fg">
              {formatSig(config.magnitude, 3)} {kN}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={config.load === "point" ? 50 : 20}
            step={0.5}
            value={Math.min(config.magnitude, config.load === "point" ? 50 : 20)}
            aria-valuetext={`${formatSig(config.magnitude, 3)} ${config.load === "point" ? "kilonewtons" : "kilonewtons per metre"}`}
            onChange={(e) => update({ magnitude: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--accent)]"
          />
        </label>
        {pointLoadOnSpan && (
          <label className="mt-5 block text-sm">
            <span className="flex justify-between">
              Position a <span className="font-mono tabular-nums text-fg">{formatSig(config.position, 3)} m</span>
            </span>
            <input
              type="range"
              min={0}
              max={config.length}
              step={0.05}
              value={config.position}
              aria-valuetext={`${formatSig(config.position, 3)} metres from the left support`}
              onChange={(e) => update({ position: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </label>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <label className="text-sm">
            Width b
            <NumberField value={config.b} min={LIMITS.b[0]} max={LIMITS.b[1]} unit="mm" onCommit={(v) => update({ b: v })} className="mt-1.5 h-11 rounded-lg border border-line-strong bg-ink" inputClassName="h-full w-full px-3" />
          </label>
          <label className="text-sm">
            Depth h
            <NumberField value={config.h} min={LIMITS.h[0]} max={LIMITS.h[1]} unit="mm" onCommit={(v) => update({ h: v })} className="mt-1.5 h-11 rounded-lg border border-line-strong bg-ink" inputClassName="h-full w-full px-3" />
          </label>
        </div>
        <label className="mt-5 block text-sm">
          Material
          <select
            value={config.material}
            onChange={(e) => update({ material: e.target.value })}
            aria-describedby={`${uid}-mat`}
            className="mt-1.5 block h-11 w-full rounded-lg border border-line-strong bg-ink px-3 text-sm text-fg"
          >
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <p id={`${uid}-mat`} className="mt-1.5 font-mono text-[0.6875rem] text-fg-muted">
          E = {formatSI(material.E, "Pa")} · {material.strengthLabel.toLowerCase()} {formatSI(material.strength, "Pa")}
        </p>
      </div>

      {/* Readouts */}
      <div className="bg-ink p-4 sm:p-6 lg:col-span-12">
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="label">Max deflection</dt>
            <dd className="mt-3 font-serif text-[clamp(2.5rem,2rem+2vw,3.5rem)] leading-none tabular-nums">{formatSI(r.maxDeflection, "m")}</dd>
            <dd className="mt-2 font-mono text-xs text-fg-muted">at x = {formatSig(r.maxDeflectionAt, 3)} m</dd>
          </div>
          <div>
            <dt className="label">Span / deflection</dt>
            <dd className={cn("mt-3 font-serif text-[clamp(2.5rem,2rem+2vw,3.5rem)] leading-none tabular-nums", ratio < DEFLECTION_GUIDE && "text-warn")}>
              {Number.isFinite(ratio) ? `L/${formatSig(ratio, 3)}` : "—"}
            </dd>
            <dd className="mt-2 font-mono text-xs text-fg-muted">
              {ratio >= DEFLECTION_GUIDE ? "within" : "beyond"} the common L/{DEFLECTION_GUIDE} guideline
            </dd>
          </div>
          <div>
            <dt className="label">Bending stress</dt>
            <dd className={cn("mt-3 font-serif text-[clamp(2.5rem,2rem+2vw,3.5rem)] leading-none tabular-nums", utilisation > 1 && "text-warn")}>{formatSI(r.maxStress, "Pa")}</dd>
            <dd className="mt-3">
              <span className="block h-1.5 overflow-hidden rounded-full bg-surface-strong" aria-hidden="true">
                <span className={cn("block h-full rounded-full", utilisation > 1 ? "bg-warn" : "bg-accent")} style={{ width: `${Math.min(100, utilisation * 100)}%` }} />
              </span>
              <span className="mt-2 block font-mono text-xs text-fg-muted">
                {formatSig(utilisation * 100, 3)} % of {material.strengthLabel.toLowerCase()}
              </span>
            </dd>
          </div>
          <div>
            <dt className="label">Reactions</dt>
            <dd className="mt-3 space-y-1 font-mono text-sm tabular-nums">
              {r.reactions.map((v, i) => (
                <p key={i}>
                  {config.support === "cantilever" ? "Fixed end" : i === 0 ? "Left" : "Right"} {formatSI(v, "N")}
                </p>
              ))}
              {r.fixedEndMoment !== undefined && <p>Fixed-end moment {formatSI(r.fixedEndMoment, "N·m")}</p>}
              <p className="text-fg-muted">Max moment {formatSI(r.maxMoment, "N·m")}</p>
            </dd>
          </div>
        </dl>
        <p className="sr-only" aria-live="polite">
          Maximum deflection {formatSI(r.maxDeflection, "metres")}, span over deflection {Number.isFinite(ratio) ? formatSig(ratio, 3) : "not defined"}, bending stress{" "}
          {formatSig(utilisation * 100, 3)} percent of the material strength.
        </p>
        {(utilisation > 1 || largeDeflection) && (
          <ul className="mt-5 space-y-2 border-l-2 border-warn pl-4 text-sm text-warn">
            {utilisation > 1 && <li>The bending stress exceeds the material&apos;s {material.strengthLabel.toLowerCase()}: the beam would yield or break, and these linear-elastic results no longer apply.</li>}
            {largeDeflection && <li>The deflection is more than span/50, outside the small-deflection assumption this model relies on.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

