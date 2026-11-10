import Image from "next/image";

import { getProject } from "@/content/projects";
import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

import { Caption } from "./comic";
import { DragBoard } from "./drag-board";

/*
 * The workbench: things from the work and the person, scattered on a cutting
 * mat for the visitor to push around. Real phone screens from three projects,
 * a sticky note, a drawing from the engineering side, a comic panel and a chess
 * piece, each with a scribbled note. Every fact comes from src/content.
 */

const gear = gearGeometry(24, 4);
const GEAR = compactPath(gearPath(gear, 4));

type Spot = { x: string; y: string; xs: string; ys: string; r: string };
const at = ({ x, y, xs, ys, r }: Spot) => ({ "--x": x, "--y": y, "--xs": xs, "--ys": ys, "--r": r }) as React.CSSProperties;

function phone(slug: string, i = 0) {
  const p = getProject(slug);
  const shot = p?.shots.filter((s) => s.device === "mobile")[i];
  return p && shot ? { name: p.name, shot } : null;
}

export function Workbench() {
  const amigo = phone("amigo-world");
  const eksu = phone("eksu-sports-hub");
  const markaz = phone("markaz-il-ginna");

  return (
    <section aria-labelledby="bench-heading" className="defer-render shell pt-16 md:pt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Caption>Scene 02 · The workbench</Caption>
          <h2 id="bench-heading" className="mt-4 font-serif text-headline">
            What&apos;s on the <em className="text-accent">bench.</em>
          </h2>
        </div>
        <p className="bench-hint" aria-hidden="true">
          ✋ Drag things around
        </p>
      </div>

      <DragBoard className="bench">
        {amigo && (
          <figure data-drag className="bench-item bench-phone" style={at({ x: "30%", y: "4%", xs: "52%", ys: "3%", r: "-4deg" })}>
            <Image src={amigo.shot.image} alt={amigo.shot.alt} sizes="160px" draggable={false} />
            <figcaption className="bench-note bench-note--below">{amigo.name}: the social network ↑</figcaption>
          </figure>
        )}
        {eksu && (
          <figure data-drag className="bench-item bench-phone" style={at({ x: "60%", y: "10%", xs: "5%", ys: "27%", r: "5deg" })}>
            <Image src={eksu.shot.image} alt={eksu.shot.alt} sizes="160px" draggable={false} />
            <figcaption className="bench-note bench-note--above">live scores, every match ↓</figcaption>
          </figure>
        )}
        {markaz && (
          <figure data-drag className="bench-item bench-phone" style={at({ x: "82%", y: "12%", xs: "54%", ys: "50%", r: "-3deg" })}>
            <Image src={markaz.shot.image} alt={markaz.shot.alt} sizes="160px" draggable={false} />
            <figcaption className="bench-note bench-note--above">right to left, on purpose ↓</figcaption>
          </figure>
        )}

        <div data-drag className="bench-item bench-sticky" style={at({ x: "3%", y: "56%", xs: "3%", ys: "3%", r: "-3deg" })}>
          <p className="bench-sticky__route">Mech. Eng → Web apps → DevOps</p>
          <p className="bench-sticky__line">Same habit, three jobs: make it hold.</p>
        </div>

        <figure data-drag className="bench-item bench-drawing" style={at({ x: "11%", y: "6%", xs: "4%", ys: "61%", r: "3deg" })}>
          <svg viewBox="-60 -60 120 120" aria-hidden="true">
            <path d={GEAR} className="bench-drawing__gear" />
            <circle r={gear.pitchRadius} className="bench-drawing__pitch" />
            <circle r="9" className="bench-drawing__bore" />
            <path d="M-56 0 H56 M0 -56 V56" className="bench-drawing__axis" />
          </svg>
          <figcaption>
            <span className="label">Fig. 02</span> Spur gear · 24 teeth · module 4
          </figcaption>
        </figure>

        <div data-drag className="bench-item bench-panel" style={at({ x: "45%", y: "70%", xs: "36%", ys: "85%", r: "2deg" })}>
          <span className="sfx bench-panel__sfx" aria-hidden="true">
            Pow!
          </span>
          <p>First client site live on its own domain.</p>
          <p className="label mt-2">2025 · Healthcare</p>
        </div>

        <div data-drag className="bench-item bench-knight" style={at({ x: "68%", y: "76%", xs: "66%", ys: "36%", r: "-6deg" })}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <path d="M18 54 H48 V49 H44 C42 41 44 34 47 28 C50 21 47 12 38 9 L35 4 L31 10 C23 12 17 18 15 26 L12 32 C11 35 14 37 17 35 L22 32 C24 31 27 32 26 35 C25 39 20 43 21 49 H18 Z" />
            <circle cx="33" cy="17" r="2.2" className="bench-knight__eye" />
          </svg>
          <p className="bench-note">← two moves past the obvious</p>
        </div>
      </DragBoard>
    </section>
  );
}
