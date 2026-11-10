import { cn } from "@/lib/cn";

/*
 * Villains of the issue. Every project's hard problem (its `challenges` in
 * src/content/projects.ts) is cast as a villain: a mugshot, the threat it
 * posed and the takedown. The alias is the only playful part; the threat and
 * the takedown are the case study's own facts.
 *
 * The villains are original bugs (as in software, drawn as in insects): a
 * cracked shell, jagged legs and an angry glare. Each one is built from its
 * name, so the same villain always looks the same: shell colour, how many
 * eyes, and what grows on its head. Pure SVG; the pupils follow the pointer
 * (EyeTracker, through [data-eyes]).
 */

const SHELLS = ["#7ad83f", "#a46bff", "#ffb21a", "#2fd4c4", "#ff5fa2"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  // Mix the bits, so names that differ by a letter or two still look different.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

const EYES: Record<1 | 2 | 3, number[]> = { 1: [60], 2: [50, 70], 3: [44, 60, 76] };

export function VillainArt({ name, className }: { name: string; className?: string }) {
  const h = hash(name);
  const shell = SHELLS[h % SHELLS.length];
  const eyes = EYES[((Math.floor(h / 5) % 3) + 1) as 1 | 2 | 3];
  const top = Math.floor(h / 15) % 3; // 0 antennae, 1 horns, 2 spikes
  const tilt = (Math.floor(h / 45) % 2 ? 1 : -1) * 4;

  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={cn("villain-art", className)} data-eyes="">
      <g transform={`rotate(${tilt} 60 64)`}>
        {/* Legs: three a side, kinked like a broken circuit trace. */}
        <path
          d="M36 70 L18 62 L10 72 M34 80 L14 84 L8 98 M38 90 L24 102 L22 114 M84 70 L102 62 L110 72 M86 80 L106 84 L112 98 M82 90 L96 102 L98 114"
          className="villain-art__legs"
        />
        {/* What grows on its head. */}
        {top === 0 && <path d="M50 34 Q40 16 30 14 M70 34 Q80 16 90 14" className="villain-art__legs" />}
        {top === 0 && (
          <g className="villain-art__bulb">
            <circle cx="30" cy="14" r="4.5" />
            <circle cx="90" cy="14" r="4.5" />
          </g>
        )}
        {top === 1 && <path d="M44 38 L32 14 L54 32 Z M76 38 L88 14 L66 32 Z" className="villain-art__horn" />}
        {top === 2 && <path d="M40 40 L44 22 L50 36 L56 16 L62 34 L70 18 L74 36 L82 24 L80 42 Z" className="villain-art__horn" />}

        {/* The shell, split down the middle, with a crack. */}
        <ellipse cx="60" cy="80" rx="28" ry="30" className="villain-art__shell" style={{ fill: shell }} />
        <path d="M60 52 V110 M44 66 L50 74 L46 82 M76 90 L70 96 L74 104" className="villain-art__crack" />
        <circle cx="48" cy="96" r="3" className="villain-art__spot" />
        <circle cx="73" cy="72" r="2.4" className="villain-art__spot" />

        {/* Head and glare. */}
        <ellipse cx="60" cy="48" rx="26" ry="18" className="villain-art__head" />
        <path d={`M${eyes[0] - 10} 38 L60 46 L${eyes[eyes.length - 1] + 10} 38`} className="villain-art__brow" />
        {eyes.map((x) => (
          <g key={x}>
            <circle cx={x} cy="49" r="6.2" className="villain-art__eye" style={{ fill: shell }} />
            <circle cx={x} cy="49" r="2.6" className="villain-art__pupil pupil" />
          </g>
        ))}
        {/* Teeth. */}
        <path d="M47 58 L51 63 L55 58 L59 63 L63 58 L67 63 L71 58" className="villain-art__teeth" />
      </g>
    </svg>
  );
}

type Challenge = { title: string; villain?: string; problem: string; solution: string };

/** A villain's file: mugshot, alias, the threat it posed and how it was taken down. */
export function VillainFile({
  challenge,
  heading: Heading = "p",
  size = "compact",
  className,
}: {
  challenge: Challenge;
  heading?: "p" | "h3";
  size?: "compact" | "full";
  className?: string;
}) {
  const name = challenge.villain ?? challenge.title;
  return (
    <div className={cn("villain", size === "full" && "villain--full", className)}>
      <div className="villain__mug" aria-hidden="true">
        <VillainArt name={name} />
        <span className="villain__plate">{name}</span>
      </div>
      <div className="villain__file">
        <p className="chapter__label">Villain of the issue</p>
        <Heading className="villain__name font-serif">{name}</Heading>
        {challenge.villain && <p className="villain__aka">Real name: {challenge.title}</p>}
        <p className="villain__threat">
          <span className="villain__tag">The threat</span>
          {challenge.problem}
        </p>
        <p className="villain__ko">
          <span className="villain__tag villain__tag--ko">The takedown</span>
          {challenge.solution}
        </p>
      </div>
      <span className="villain__stamp" aria-hidden="true">
        KO!
      </span>
    </div>
  );
}
