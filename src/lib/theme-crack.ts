/*
 * The theme switch as a hit to the screen: a web of cracks spreads from an
 * impact point, the page shakes, "KRAK!" is lettered over it, and the new
 * edition splits the screen open along the main crack.
 *
 * Built on the View Transitions API: the cracks are an overlay in the DOM, so
 * they appear in both the old and the new snapshot and stay put while the new
 * snapshot is revealed through a clip-path that starts as a zero-width band
 * along the crack and opens to the whole screen. Browsers without the API, and
 * anyone who prefers reduced motion, get a plain switch.
 */

type Pt = [number, number];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const path = (pts: Pt[]) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")}`;

/** A jagged line from a to b, bent n times. */
function jag(a: Pt, b: Pt, n: number, amp: number): Pt[] {
  const pts: Pt[] = [a];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const o = rand(-amp, amp);
    pts.push([a[0] + (b[0] - a[0]) * t + nx * o, a[1] + (b[1] - a[1]) * t + ny * o]);
  }
  pts.push(b);
  return pts;
}

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };

export function crackTo(apply: () => void) {
  const doc = document as DocWithVT;
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }

  const W = innerWidth;
  const H = innerHeight;
  const impact: Pt = [W * rand(0.35, 0.65), H * rand(0.38, 0.58)];

  // The main crack, edge to edge through the impact point: the line the screen splits along.
  const left = jag([-20, impact[1] + rand(-H, H) * 0.18], impact, 5, H * 0.05);
  const right = jag(impact, [W + 20, impact[1] + rand(-H, H) * 0.18], 5, H * 0.05);
  const main = [...left, ...right.slice(1)];

  // The web: spokes out from the impact, and rings joining them, like glass hit by a stone.
  const spokes: Pt[][] = [];
  const SPOKES = 11;
  for (let i = 0; i < SPOKES; i++) {
    const a = (i / SPOKES) * Math.PI * 2 + rand(-0.15, 0.15);
    const r = Math.min(W, H) * rand(0.22, 0.42);
    spokes.push(jag(impact, [impact[0] + Math.cos(a) * r, impact[1] + Math.sin(a) * r], 4, 9));
  }
  const rings = [1, 2, 3].map((k) =>
    spokes.map((s) => s[k]).concat([spokes[0][k]]),
  );

  // The overlay.
  const ns = "http://www.w3.org/2000/svg";
  const overlay = document.createElement("div");
  overlay.className = "crack-overlay";
  overlay.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const strokes: SVGPathElement[] = [];
  const add = (d: string, cls: string) => {
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    svg.appendChild(p);
    strokes.push(p);
  };
  for (const cls of ["crack-ink", "crack-white"]) {
    add(path(main), `${cls} crack--main`);
    for (const s of spokes) add(path(s), cls);
    for (const r of rings) add(path(r), `${cls} crack--ring`);
  }
  overlay.appendChild(svg);
  const word = (text: string, x: number, y: number, size: string, tilt: number) => {
    const el = document.createElement("span");
    el.className = "sfx crack-word";
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = size;
    el.style.setProperty("--tilt", `${tilt}deg`);
    overlay.appendChild(el);
  };
  const flip = impact[0] > W / 2 ? -1 : 1;
  word("KRAK!", impact[0] + flip * Math.min(W * 0.18, 220), impact[1] - H * 0.2, "clamp(3.5rem, 9vw, 8rem)", -8 * flip);
  word("THWIP!", impact[0] - flip * Math.min(W * 0.22, 260), impact[1] + H * 0.18, "clamp(2rem, 4.5vw, 4rem)", 6 * flip);
  document.body.appendChild(overlay);

  // Ink the cracks outward, fast, and shake the page.
  for (const p of strokes) {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 240, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" });
  }
  // Shake the page (not <body>: a transform there would make it the overlay's containing block).
  for (const el of document.querySelectorAll<HTMLElement>("#main, .site-header")) {
    el.animate(
      [
        { transform: "none" },
        { transform: "translate(-7px, 4px)" },
        { transform: "translate(6px, -5px)" },
        { transform: "translate(-4px, -2px)" },
        { transform: "translate(2px, 3px)" },
        { transform: "none" },
      ],
      { duration: 300, easing: "steps(5, end)" },
    );
  }

  // A zero-width band along the crack, and the same crack pushed a screen up and down.
  const band = (spread: number) => {
    const top = main.map(([x, y]) => `${x.toFixed(1)}px ${(y - spread).toFixed(1)}px`);
    const bottom = [...main].reverse().map(([x, y]) => `${x.toFixed(1)}px ${(y + spread).toFixed(1)}px`);
    return `polygon(${[...top, ...bottom].join(", ")})`;
  };

  window.setTimeout(() => {
    const html = document.documentElement;
    html.classList.add("theme-cracking");
    const t = doc.startViewTransition!(apply);
    t.ready
      .then(() => {
        html.animate(
          { clipPath: [band(0), band(H * 1.3)] },
          { duration: 780, easing: "cubic-bezier(0.75, 0, 0.25, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    t.finished
      .catch(() => {})
      .finally(() => {
        html.classList.remove("theme-cracking");
        const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-out", fill: "forwards" });
        fade.onfinish = () => overlay.remove();
      });
  }, 330);
}
