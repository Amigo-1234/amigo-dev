import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

/*
 * The spider-bot: the site's own character, an original design (not anyone
 * else's hero). A mechanical spider hanging on a line of silk: a 10-tooth
 * gear for a head, eight legs built as two-bar linkages on pin joints, and a
 * red abdomen ruled with web lines. Spider, machine and web in one drawing.
 *
 * Pure SVG, server-rendered, decorative. Its parts carry class names so CSS
 * can animate them: .bot__legs-l / .bot__legs-r flex, .bot__wave raises the
 * right front leg, .bot__eyes blink.
 *
 * Coordinates: the silk meets the abdomen at (0, 0); the drawing hangs below it.
 */

const head = gearGeometry(10, 2.2);
const HEAD = compactPath(gearPath(head, 3));

// Left legs as hip → knee → foot. The right side is the mirror image.
const LEGS: [number, number, number, number, number, number][] = [
  [-7, 36, -28, 22, -42, 40],
  [-9, 40, -35, 33, -50, 52],
  [-9, 45, -33, 49, -45, 68],
  [-7, 49, -24, 61, -32, 80],
];

function Leg({ leg, mirror = false }: { leg: (typeof LEGS)[number]; mirror?: boolean }) {
  const s = mirror ? -1 : 1;
  const [hx, hy, kx, ky, fx, fy] = leg;
  return (
    <g>
      <path d={`M${hx * s} ${hy} L${kx * s} ${ky} L${fx * s} ${fy}`} className="bot__limb" />
      <circle cx={kx * s} cy={ky} r="2.4" className="bot__pin" />
      <circle cx={fx * s} cy={fy} r="1.3" className="bot__foot" />
    </g>
  );
}

export function SpiderBotArt({ className, line = true }: { className?: string; line?: boolean }) {
  return (
    <svg viewBox="-56 -24 112 112" aria-hidden="true" className={className}>
      {line && <path d="M0 -24 V0" className="bot__silk" />}

      <g className="bot__legs-l">
        {LEGS.map((leg, i) => (
          <Leg key={i} leg={leg} />
        ))}
      </g>
      <g className="bot__legs-r">
        {LEGS.slice(1).map((leg, i) => (
          <Leg key={i} leg={leg} mirror />
        ))}
      </g>
      {/* The right front leg, on its own so it can wave. */}
      <g className="bot__wave">
        <Leg leg={LEGS[0]} mirror />
      </g>

      {/* Abdomen: a red shell, ruled with a web, riveted to the spinneret at the top. */}
      <ellipse cx="0" cy="17" rx="13" ry="16" className="bot__shell" />
      <path d="M0 1 V33 M-13 17 H13 M-9 6 L9 28 M9 6 L-9 28" className="bot__web" />
      <path d="M-7 11 Q0 14 7 11 M-10 19 Q0 23 10 19 M-7 27 Q0 30 7 27" className="bot__web" />
      <rect x="-3.5" y="-1.5" width="7" height="4" rx="1" className="bot__cap" />

      {/* Head: a gear, with two big lenses and two small ones, like a real jumping spider. */}
      <path d={HEAD} transform="translate(0 42)" className="bot__head" />
      <g className="bot__eyes">
        <circle cx="-4.2" cy="43" r="3.6" className="bot__lens" />
        <circle cx="4.2" cy="43" r="3.6" className="bot__lens" />
        <circle cx="-5.2" cy="41.8" r="1.1" className="bot__glint" />
        <circle cx="3.2" cy="41.8" r="1.1" className="bot__glint" />
        <circle cx="-9" cy="38.5" r="1.4" className="bot__lens bot__lens--small" />
        <circle cx="9" cy="38.5" r="1.4" className="bot__lens bot__lens--small" />
      </g>
    </svg>
  );
}

/**
 * The bot hanging in a scene and talking: the drawing plus a speech balloon.
 * The balloon's words are real text (the drawing is not).
 */
export function SpiderBot({
  says,
  className,
  side = "left",
}: {
  says?: React.ReactNode;
  className?: string;
  /** Which side of the bot the balloon sits on. */
  side?: "left" | "right";
}) {
  return (
    <div className={["bot", `bot--${side}`, className].filter(Boolean).join(" ")}>
      <div className="bot__rig">
        <SpiderBotArt className="bot__art" />
      </div>
      {says && <p className="balloon bot__balloon">{says}</p>}
    </div>
  );
}
