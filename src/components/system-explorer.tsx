"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";

import { layers, type LayerId } from "@/content/profile";
import { cn } from "@/lib/cn";
import { FINE_POINTER, MOTION, useGsap } from "@/lib/gsap";

/*
 * An exploded isometric drawing of the layers I work across. Visitors pick a
 * layer (tabs, or clicking a plate) to read what I do there. Without
 * JavaScript, every explanation is shown in a list instead.
 */

const A = 150; // half-width of a plate
const H = 86; // half-height of a plate
const T = 10; // plate thickness
const CX = 214;
const CY = [120, 212, 304, 396];

function plateTop(cy: number) {
  return `M${CX - A} ${cy} L${CX} ${cy - H} L${CX + A} ${cy} L${CX} ${cy + H} Z`;
}

function plateSides(cy: number) {
  return `M${CX - A} ${cy} L${CX - A} ${cy + T} L${CX} ${cy + H + T} L${CX + A} ${cy + T} L${CX + A} ${cy}`;
}

/** Maps unit coordinates (u along the upper-left edge, v along the lower-left edge) onto a plate's top face. */
function iso(cy: number, u: number, v: number) {
  return [CX - A + A * u + A * v, cy - H * u + H * v];
}

function polyline(cy: number, pts: [number, number][], close = false) {
  const d = pts.map(([u, v], i) => `${i ? "L" : "M"}${iso(cy, u, v).map((n) => n.toFixed(1)).join(" ")}`).join(" ");
  return close ? `${d} Z` : d;
}

function rect(cy: number, u: number, v: number, w: number, h: number) {
  return polyline(cy, [[u, v], [u + w, v], [u + w, v + h], [u, v + h]], true);
}

function ring(cy: number, u: number, v: number, r: number) {
  const pts = Array.from({ length: 24 }, (_, i): [number, number] => {
    const t = (i / 24) * Math.PI * 2;
    return [u + r * Math.cos(t), v + r * Math.sin(t)];
  });
  return polyline(cy, pts, true);
}

/** Line-work on each plate's top face: screens, services, tables, a server grid. */
function plateDetail(index: number, cy: number): string[] {
  switch (index) {
    case 0:
      return [rect(cy, 0.14, 0.14, 0.42, 0.3), rect(cy, 0.14, 0.54, 0.72, 0.14), rect(cy, 0.64, 0.14, 0.22, 0.3), polyline(cy, [[0.14, 0.8], [0.5, 0.8]])];
    case 1:
      return [
        polyline(cy, [[0.25, 0.28], [0.72, 0.3], [0.48, 0.72]], true),
        ring(cy, 0.25, 0.28, 0.07),
        ring(cy, 0.72, 0.3, 0.07),
        ring(cy, 0.48, 0.72, 0.07),
      ];
    case 2:
      return [
        rect(cy, 0.16, 0.18, 0.68, 0.64),
        polyline(cy, [[0.16, 0.34], [0.84, 0.34]]),
        polyline(cy, [[0.16, 0.5], [0.84, 0.5]]),
        polyline(cy, [[0.16, 0.66], [0.84, 0.66]]),
        polyline(cy, [[0.4, 0.18], [0.4, 0.82]]),
      ];
    default:
      return [0.25, 0.5, 0.75].flatMap((u) => [0.25, 0.5, 0.75].map((v) => ring(cy, u, v, 0.03)));
  }
}

function Drawing({ active, onPick }: { active: LayerId; onPick: (id: LayerId) => void }) {
  const top = CY[0] - H;
  const bottom = CY[3] + H + T;
  const mid = (top + bottom) / 2;

  return (
    <svg viewBox="0 0 640 520" role="img" aria-labelledby="system-title system-desc" className="w-full overflow-visible">
      <title id="system-title">The layers I work across</title>
      <desc id="system-desc">
        An exploded isometric drawing of four stacked layers: interface, application, data and infrastructure. The
        infrastructure layer is dashed, marking the direction I am growing toward: DevOps.
      </desc>

      <g fontFamily="var(--font-geist-mono), monospace">
        <g stroke="var(--line-strong)" strokeWidth={1}>
          <line x1={26} y1={top} x2={26} y2={bottom} />
          <line x1={18} y1={top} x2={34} y2={top} />
          <line x1={18} y1={bottom} x2={34} y2={bottom} />
        </g>
        <text x={12} y={mid} fill="var(--fg-subtle)" fontSize={10} letterSpacing="0.14em" textAnchor="middle" transform={`rotate(-90 12 ${mid})`}>
          INTERFACE → INFRASTRUCTURE
        </text>

        <g stroke="var(--line-strong)" strokeWidth={1} strokeDasharray="3 5">
          <line x1={CX - A} y1={CY[0] + T} x2={CX - A} y2={CY[3]} />
          <line x1={CX + A} y1={CY[0] + T} x2={CX + A} y2={CY[3]} />
          <line x1={CX} y1={CY[0] + H + T} x2={CX} y2={CY[3] + H} />
        </g>

        {/* Plates, drawn bottom-up so upper plates sit in front */}
        {[...layers].reverse().map((layer) => {
          const i = layers.findIndex((l) => l.id === layer.id);
          const cy = CY[i];
          const isActive = layer.id === active;
          const direction = layer.id === "infrastructure";
          const stroke = isActive || direction ? "var(--accent)" : "var(--fg)";
          return (
            <g key={layer.id} data-plate={i}>
              <g
                onClick={() => onPick(layer.id)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") onPick(layer.id);
                }}
                className="cursor-pointer transition-transform duration-500 ease-[var(--ease-out-expo)]"
                style={{ transform: `translateY(${isActive ? -12 : 0}px)` }}
              >
                <path d={plateSides(cy)} fill="var(--ink-sunken)" stroke={stroke} strokeOpacity={0.5} strokeWidth={1} />
                <path
                  d={plateTop(cy)}
                  fill={isActive ? "var(--accent-soft)" : "var(--ink-raised)"}
                  fillOpacity={direction && !isActive ? 0.6 : 0.94}
                  stroke={stroke}
                  strokeWidth={isActive ? 1.75 : 1.25}
                  strokeDasharray={direction ? "6 5" : undefined}
                  className="transition-[fill,stroke-width] duration-300"
                />
                <g
                  fill={direction ? "var(--accent)" : "none"}
                  stroke={direction ? "none" : isActive ? "var(--accent)" : "var(--fg-muted)"}
                  strokeWidth={1}
                  opacity={0.8}
                >
                  {plateDetail(i, cy).map((d, k) => (
                    <path key={k} d={d} />
                  ))}
                </g>
              </g>
              <g className="transition-opacity duration-300" opacity={isActive ? 1 : 0.75}>
                <line x1={CX + A + 6} y1={cy} x2={398} y2={cy} stroke={isActive ? "var(--accent)" : "var(--line-strong)"} strokeWidth={1} />
                <circle cx={CX + A} cy={cy} r={isActive ? 3.5 : 2.5} fill={isActive || direction ? "var(--accent)" : "var(--fg)"} />
                <text x={406} y={cy - 4} fontSize={11.5} letterSpacing="0.12em" fill={isActive || direction ? "var(--accent)" : "var(--fg)"}>
                  {String(i + 1).padStart(2, "0")} — {layer.name.toUpperCase()}
                </text>
                <text x={406} y={cy + 14} fontSize={10.5} letterSpacing="0.02em" fill="var(--fg-subtle)">
                  {layer.tech}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

const noop = () => () => {};

export function SystemExplorer({ projectNames }: { projectNames: Record<string, string> }) {
  const [active, setActive] = useState<LayerId>("interface");
  const scope = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Tabs replace the full list only once JavaScript is running (false on the server).
  const interactive = useSyncExternalStore(noop, () => true, () => false);

  useGsap(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        // The plates start stacked and separate as the drawing scrolls into view.
        const plates = gsap.utils.toArray<SVGGElement>("[data-plate]", scope.current);
        gsap.from(plates, {
          y: (i) => (1.5 - i) * 46,
          ease: "none",
          scrollTrigger: { trigger: scope.current, start: "top 85%", end: "center 55%", scrub: 0.6 },
        });
      });
      mm.add(`${MOTION} and ${FINE_POINTER}`, () => {
        // A gentle tilt toward the pointer.
        const art = scope.current?.querySelector<HTMLElement>("[data-art]");
        if (!art) return;
        const rx = gsap.quickTo(art, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(art, "rotationY", { duration: 0.8, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = art.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        art.addEventListener("pointermove", move);
        art.addEventListener("pointerleave", leave);
        return () => {
          art.removeEventListener("pointermove", move);
          art.removeEventListener("pointerleave", leave);
        };
      });
    },
    [],
    { scope, defer: true },
  );

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const last = layers.length - 1;
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? index + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? index - 1 : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    const target = (next + layers.length) % layers.length;
    setActive(layers[target].id);
    tabRefs.current[target]?.focus();
  };

  return (
    <div ref={scope} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7 [perspective:1200px]">
        <div data-art className="mx-auto max-w-[40rem] will-change-transform">
          <Drawing active={active} onPick={setActive} />
        </div>
      </div>

      <div className="relative isolate lg:col-span-5">
        {/* Light behind the glass so the blur has something to work with */}
        <div aria-hidden="true" className="absolute right-0 top-6 -z-10 size-48 sm:-right-6 rounded-full bg-accent opacity-25 blur-3xl" />
        <div aria-hidden="true" className="grid-paper absolute -inset-y-6 inset-x-0 -z-10 rounded-3xl sm:-inset-x-6 opacity-80 [mask-image:radial-gradient(closest-side,#000,transparent)]" />
        <div className="glass relative overflow-hidden rounded-2xl p-6 md:p-8">
          {/* The tabs only work with JavaScript; without it every panel is listed. */}
          <div role="tablist" aria-label="Layers" className="js-only grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {layers.map((layer, i) => {
              const selected = layer.id === active;
              return (
                <button
                  key={layer.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`tab-${layer.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`panel-${layer.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(layer.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    selected ? "bg-fg text-ink" : "text-fg-muted hover:bg-surface-strong hover:text-fg",
                  )}
                >
                  <span className={cn("block font-mono text-[0.625rem]", selected ? "text-ink/60" : "text-fg-subtle")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {layer.name}
                </button>
              );
            })}
          </div>
          {layers.map((layer) => {
            const selected = layer.id === active;
            return (
              <div
                key={layer.id}
                id={`panel-${layer.id}`}
                role={interactive ? "tabpanel" : undefined}
                aria-labelledby={interactive ? `tab-${layer.id}` : undefined}
                hidden={interactive ? !selected : undefined}
                className={cn(
                  "mt-6 min-h-[13rem] [&:not([hidden])]:animate-[page-enter_0.45s_var(--ease-out-expo)_both]",
                  !selected && "js-hide",
                )}
              >
                <LayerBody layer={layer} projectNames={projectNames} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LayerBody({ layer, projectNames }: { layer: (typeof layers)[number]; projectNames: Record<string, string> }) {
  return (
    <>
      <p className="label text-accent">{layer.tech}</p>
      <h3 className="mt-3 font-serif text-4xl">{layer.name}</h3>
      <p className="mt-3 leading-relaxed text-fg-muted">{layer.body}</p>
      <p className="mt-5 text-sm">
        <span className="label">See it in</span>{" "}
        {layer.evidence.map((slug, j) => (
          <span key={slug}>
            {j > 0 && <span className="text-fg-subtle"> · </span>}
            <Link href={`/projects/${slug}`} className="link-underline text-fg">
              {projectNames[slug] ?? slug}
            </Link>
          </span>
        ))}
      </p>
    </>
  );
}
