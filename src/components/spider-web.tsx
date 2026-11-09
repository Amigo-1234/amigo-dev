"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's web: an orb web spun across the corner of the page. On load it is
 * spun in front of you (radial threads first, then the spiral from the outside
 * in); after that the threads are springs, so a pointer or finger drags the
 * strands it passes through and a tap sends a shiver across the whole web.
 *
 * It is a canvas behind the hero, decorative only. The loop sleeps as soon as
 * the web is still, and never runs off screen or in a hidden tab. With reduced
 * motion the finished web is drawn once and does not react.
 */

type Node = { rx: number; ry: number; x: number; y: number; vx: number; vy: number };

const SPOKES = 19;
const SPIN_MS = 1700;

/** Small deterministic PRNG so the web is the same shape on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function SpiderWeb({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let angles: number[] = [];
    let rings: Node[][] = []; // rings[j][i]: ring j on spoke i
    let anchors: Array<{ x: number; y: number }> = [];
    let ink = "#f3f3f1";
    let accent = "#ff4545";
    let raf = 0;
    let visible = true;
    let started = 0;
    let spun = reduce;
    const pointer = { x: -9999, y: -9999, active: false };

    const readColours = () => {
      const cs = getComputedStyle(document.documentElement);
      ink = cs.getPropertyValue("--fg").trim() || ink;
      accent = cs.getPropertyValue("--accent").trim() || accent;
    };

    const build = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = w < 768;
      cx = w * (narrow ? 0.86 : 0.8);
      cy = h * (narrow ? 0.1 : 0.22);
      const rand = rng(1907);
      angles = Array.from({ length: SPOKES }, (_, i) => ((i + (rand() - 0.5) * 0.5) / SPOKES) * Math.PI * 2);
      // Each radial thread runs until it leaves the canvas (or a long way out).
      const reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.05;
      anchors = angles.map((a) => ({ x: cx + Math.cos(a) * reach, y: cy + Math.sin(a) * reach }));

      rings = [];
      let radius = narrow ? 14 : 18;
      const max = Math.min(reach, narrow ? 520 : 900);
      while (radius < max) {
        rings.push(
          angles.map((a) => {
            const rr = radius * (0.94 + rand() * 0.12);
            const x = cx + Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr;
            return { rx: x, ry: y, x, y, vx: 0, vy: 0 };
          }),
        );
        radius = radius * 1.075 + (narrow ? 9 : 12);
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const p = spun ? 1 : Math.min(1, (now - started) / SPIN_MS);
      const spokeP = Math.min(1, p / 0.35); // radial threads go out first
      const ringP = Math.max(0, (p - 0.3) / 0.7); // then the spiral, from the outside in
      ctx.lineCap = "round";
      ctx.strokeStyle = ink;

      // Radial threads, through each ring's node so they bend with the spiral.
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let i = 0; i < SPOKES; i++) {
        ctx.moveTo(cx, cy);
        const a = anchors[i];
        const ex = cx + (a.x - cx) * spokeP;
        const ey = cy + (a.y - cy) * spokeP;
        const limit = Math.hypot(ex - cx, ey - cy);
        for (const ring of rings) {
          const n = ring[i];
          if (Math.hypot(n.rx - cx, n.ry - cy) > limit) break;
          ctx.lineTo(n.x, n.y);
        }
        ctx.lineTo(ex, ey);
      }
      ctx.stroke();

      // The capture spiral: each segment sags a little toward the hub, like silk under its own weight.
      const shown = Math.ceil(rings.length * ringP);
      ctx.lineWidth = 0.75;
      for (let j = rings.length - 1; j >= rings.length - shown; j--) {
        const ring = rings[j];
        ctx.globalAlpha = 0.07 + 0.11 * (1 - j / rings.length);
        ctx.beginPath();
        for (let i = 0; i <= SPOKES; i++) {
          const n = ring[i % SPOKES];
          if (i === 0) {
            ctx.moveTo(n.x, n.y);
            continue;
          }
          const m = ring[i - 1];
          const mx = (m.x + n.x) / 2;
          const my = (m.y + n.y) / 2;
          ctx.quadraticCurveTo(mx + (cx - mx) * 0.05, my + (cy - my) * 0.05, n.x, n.y);
        }
        ctx.stroke();
      }

      // Dew: a few drops that catch the light.
      if (ringP > 0.9) {
        ctx.fillStyle = ink;
        for (let j = 2; j < rings.length; j += 3) {
          const n = rings[j][(j * 7) % SPOKES];
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Where the pointer is caught in the web, the silk glows red.
      if (pointer.active && spun) {
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 90);
        g.addColorStop(0, accent);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = g;
        ctx.fillRect(pointer.x - 90, pointer.y - 90, 180, 180);
      }
      ctx.globalAlpha = 1;
      return p;
    };

    /** One physics step. Returns how much the web is still moving. */
    const step = () => {
      let energy = 0;
      const R = 110;
      for (const ring of rings)
        for (const n of ring) {
          let fx = (n.rx - n.x) * 0.06;
          let fy = (n.ry - n.y) * 0.06;
          if (pointer.active) {
            const dx = pointer.x - n.x;
            const dy = pointer.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < R && d > 0.01) {
              // Silk is sticky: strands near the pointer are pulled along with it.
              const f = (1 - d / R) ** 2 * 0.22;
              fx += dx * f;
              fy += dy * f;
            }
          }
          n.vx = (n.vx + fx) * 0.86;
          n.vy = (n.vy + fy) * 0.86;
          n.x += n.vx;
          n.y += n.vy;
          energy += Math.abs(n.vx) + Math.abs(n.vy) + Math.abs(n.x - n.rx) * 0.02;
        }
      return energy;
    };

    const frame = (now: number) => {
      raf = 0;
      const p = draw(now);
      if (p >= 1) spun = true;
      const moving = spun && !reduce ? step() : 0;
      if (visible && (!spun || pointer.active || moving > 0.5)) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && visible && !waiting) raf = requestAnimationFrame(frame);
    };

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      if (reduce || !spun) return;
      const { x, y } = toLocal(e);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      wake();
    };
    const onLeave = () => {
      pointer.active = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (reduce || !spun) return;
      // A tap shivers the web: every node is kicked away from the tap, weaker with distance.
      const { x, y } = toLocal(e);
      for (const ring of rings)
        for (const n of ring) {
          const dx = n.x - x;
          const dy = n.y - y;
          const d = Math.hypot(dx, dy) || 1;
          const k = 14 / (1 + d / 60);
          n.vx += (dx / d) * k;
          n.vy += (dy / d) * k;
        }
      wake();
    };

    // Behind the ignition intro the web waits, so it is spun where you can see it.
    const html = document.documentElement;
    const intro = () => ["idle", "spool", "launch"].includes(html.getAttribute("data-ignition") ?? "");
    let waiting = !reduce && intro();

    readColours();
    build();
    started = performance.now();
    if (!waiting) wake();

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    const ro = new ResizeObserver(() => {
      build();
      wake();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(host);
    const mo = new MutationObserver(() => {
      readColours();
      if (waiting && !intro()) {
        waiting = false;
        started = performance.now();
      }
      wake();
    });
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme", "data-ignition"] });
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
