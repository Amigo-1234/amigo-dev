"use client";

import { useEffect } from "react";

import { sfx } from "@/lib/sound";

/*
 * Click anywhere that isn't a control and a web shoots there: a line whips in
 * from the hanging spider-bot (or from above the screen when it isn't out),
 * splats into a web where you clicked, says THWIP! and then lets go. The web
 * stays stuck to the page as you scroll, and fades a couple of seconds later.
 *
 * Built by hand in one fixed layer: the line is drawn in screen coordinates
 * (it only lasts a moment), the webs in page coordinates inside a group that
 * follows the scroll. Nothing here is content, so it is all aria-hidden; it is
 * off with reduced motion, while the intro is up, and while text is selected.
 */

const SVG = "http://www.w3.org/2000/svg";
const MAX_WEBS = 8;
const LIVE_MS = 2600;
const SKIP =
  "a, button, input, textarea, select, label, summary, video, iframe, dialog, [role=button], [role=tab], [role=dialog], [contenteditable], [data-drag], .buddy";

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** A web splat around (0, 0): uneven spokes, and threads that sag between them. */
function splat() {
  const g = el("g", { class: "webshot__web" });
  const n = 9;
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    return { a, r: 24 + Math.random() * 14 };
  });
  let d = "";
  for (const s of spokes) d += `M0 0 L${(Math.cos(s.a) * s.r).toFixed(1)} ${(Math.sin(s.a) * s.r).toFixed(1)} `;
  for (const ring of [0.38, 0.66, 0.92]) {
    spokes.forEach((s, i) => {
      const t = spokes[(i + 1) % n];
      const p = (q: typeof s) => [Math.cos(q.a) * q.r * ring, Math.sin(q.a) * q.r * ring];
      const [x1, y1] = p(s);
      const [x2, y2] = p(t);
      // The thread sags towards the centre.
      const mid = (s.a + (t.a < s.a ? t.a + Math.PI * 2 : t.a)) / 2;
      const mr = ((s.r + t.r) / 2) * ring * 0.8;
      d += `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(Math.cos(mid) * mr).toFixed(1)} ${(Math.sin(mid) * mr).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} `;
    });
  }
  g.append(el("path", { d, class: "webshot__ink" }), el("path", { d, class: "webshot__silk" }));
  return g;
}

/** The swinging hero's free hand, in WebSlingerArt's own coordinates. */
const HAND = { x: 34, y: 128 };

/**
 * Where the web comes from: the swinging hero's free hand when he is on
 * screen, else the hanging spider-bot when it is out, else from above the
 * screen, off to one side of the click.
 */
function origin(x: number): [number, number] {
  for (const svg of document.querySelectorAll<SVGSVGElement>("svg:has(> .slinger__thwip)")) {
    if (svg.closest(".buddy") && getComputedStyle(svg.closest(".buddy")!).visibility === "hidden") continue;
    const r = svg.getBoundingClientRect();
    const ctm = svg.getScreenCTM();
    if (!ctm || r.width === 0 || r.bottom < 0 || r.top > innerHeight) continue;
    const p = new DOMPoint(HAND.x, HAND.y).matrixTransform(ctm);
    return [p.x, p.y];
  }
  const bob = document.querySelector<HTMLElement>(".plumb [data-bob]");
  const r = bob && getComputedStyle(bob.closest(".plumb")!).display !== "none" ? bob.getBoundingClientRect() : null;
  if (r && r.width) return [r.left + r.width / 2, r.top + r.height * 0.7];
  return [x + (x < innerWidth / 2 ? 1 : -1) * Math.min(220, innerWidth * 0.3), -10];
}

export function WebShooter() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = el("svg", { class: "webshot", "aria-hidden": "true", width: "100%", height: "100%" });
    const page = el("g", {});
    layer.append(page);
    document.body.append(layer);

    let webs = 0;
    let raf = 0;
    const follow = () => {
      raf = 0;
      page.setAttribute("transform", `translate(${-scrollX} ${-scrollY})`);
    };
    const onScroll = () => {
      if (webs && !raf) raf = requestAnimationFrame(follow);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as Element | null;
      if (!t || t.closest(SKIP)) return;
      if (/^(idle|spool|launch)$/.test(document.documentElement.dataset.ignition ?? "")) return;
      if (String(getSelection() ?? "").trim()) return;

      const x = e.clientX;
      const y = e.clientY;
      const [ox, oy] = origin(x);

      sfx("thwip");

      // The line: drawn out to the point, then let go.
      const sag = Math.min(60, Math.hypot(x - ox, y - oy) * 0.08);
      const line = el("path", {
        d: `M${ox.toFixed(1)} ${oy.toFixed(1)} Q${((ox + x) / 2).toFixed(1)} ${((oy + y) / 2 + sag).toFixed(1)} ${x} ${y}`,
        class: "webshot__line",
        pathLength: 1,
      });
      layer.append(line);
      line
        .animate(
          [
            { strokeDashoffset: 1, opacity: 1 },
            { strokeDashoffset: 0, opacity: 1, offset: 0.35 },
            { strokeDashoffset: 0, opacity: 1, offset: 0.7 },
            { strokeDashoffset: -1, opacity: 0 },
          ],
          { duration: 520, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
        )
        .finished.then(() => line.remove(), () => line.remove());

      // The web, stuck to the page where it landed.
      page.setAttribute("transform", `translate(${-scrollX} ${-scrollY})`);
      const shot = el("g", { transform: `translate(${x + scrollX} ${y + scrollY})` });
      const web = splat();
      const tilt = el("g", { transform: `rotate(${(Math.random() * 16 - 8).toFixed(1)})` });
      const word = el("text", { class: "webshot__word", x: 18, y: -26 });
      word.textContent = "THWIP!";
      tilt.append(word);
      shot.append(web, tilt);
      page.append(shot);
      webs++;
      while (page.childElementCount > MAX_WEBS) {
        page.firstElementChild?.remove();
        webs--;
      }

      const spin = Math.random() * 40 - 20;
      web.animate(
        [
          { transform: `scale(0.1) rotate(${spin}deg)`, opacity: 0 },
          { transform: `scale(1.12) rotate(0deg)`, opacity: 1, offset: 0.6 },
          { transform: "scale(1) rotate(0deg)", opacity: 1 },
        ],
        { duration: 300, delay: 130, easing: "cubic-bezier(0.2, 0.8, 0.3, 1.2)", fill: "backwards" },
      );
      word.animate(
        [
          { opacity: 0, transform: "scale(0.4)" },
          { opacity: 1, transform: "scale(1.1)", offset: 0.5 },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 260, delay: 160, fill: "backwards" },
      );
      shot
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: LIVE_MS, fill: "forwards" })
        .finished.then(
          () => {
            if (shot.isConnected) {
              shot.remove();
              webs--;
            }
          },
          () => {},
        );
    };

    document.addEventListener("click", onClick);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      layer.remove();
    };
  }, []);

  return null;
}
