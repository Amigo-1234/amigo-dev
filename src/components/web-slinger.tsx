import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

/*
 * The site's hero: an original masked web-slinger, the engineer in costume.
 * Not anyone else's character: a black suit with red racing stripes, red
 * gloves and boots, a blueprint-blue utility belt, a gear on the chest and
 * round amber goggle lenses. Drawn in comic ink: every part is outlined in
 * the page's text colour first, then filled.
 *
 * One body, two poses, set by joint positions:
 *   swing  the raised hand holds a web line at (150, 24) that runs up out of
 *          frame, so the figure can swing about it (the opening scene)
 *   sit    on a rooftop ledge at y = 240, legs over the edge, typing on a
 *          laptop that lights his face (the footer)
 *
 * Pure SVG and decorative. The irises follow the pointer (EyeTracker).
 */

const emblem = compactPath(gearPath(gearGeometry(8, 3.4), 4));
const lidMark = compactPath(gearPath(gearGeometry(8, 1.6), 2));

type Pt = [number, number];
/** One piece of a limb: from a to b, w wide. */
type Seg = { a: Pt; b: Pt; w: number };

/** Arms and legs as shoulder → elbow → hand and hip → knee → ankle → toe. "Far" limbs are drawn first. */
type Pose = {
  armFar: [Pt, Pt, Pt];
  armNear: [Pt, Pt, Pt];
  legFar: [Pt, Pt, Pt, Pt];
  legNear: [Pt, Pt, Pt, Pt];
  head: Pt;
  /** Goggle lens centres. */
  eyes: [Pt, Pt];
};

const POSES: Record<"swing" | "sit", Pose> = {
  swing: {
    armFar: [
      [89, 129],
      [58, 152],
      [34, 128],
    ],
    armNear: [
      [143, 124],
      [157, 76],
      [150, 24],
    ],
    legFar: [
      [104, 209],
      [80, 264],
      [90, 322],
      [104, 336],
    ],
    legNear: [
      [123, 208],
      [162, 246],
      [152, 300],
      [138, 314],
    ],
    head: [115, 90],
    eyes: [
      [105, 90],
      [125, 87],
    ],
  },
  sit: {
    armFar: [
      [88, 130],
      [72, 178],
      [100, 206],
    ],
    armNear: [
      [144, 126],
      [160, 176],
      [132, 205],
    ],
    // Thighs come towards us, so they read short; the shins hang over the ledge.
    legFar: [
      [104, 209],
      [92, 238],
      [86, 300],
      [100, 312],
    ],
    legNear: [
      [124, 208],
      [140, 238],
      [148, 298],
      [162, 310],
    ],
    head: [116, 92],
    eyes: [
      [107, 96],
      [126, 96],
    ],
  },
};

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const line = (a: Pt, b: Pt) => `M${a.join(" ")} L${b.join(" ")}`;

// A V: broad shoulders tapering to the waist, then the hips.
const TORSO = "M80 126 Q114 108 152 120 C148 152 140 184 132 208 L96 210 C90 184 82 154 80 126 Z";

export function WebSlingerArt({ className, pose: name = "swing" }: { className?: string; pose?: "swing" | "sit" }) {
  const p = POSES[name];
  const [sF, eF, hF] = p.armFar;
  const [sN, eN, hN] = p.armNear;
  const [hipF, kF, aF, tF] = p.legFar;
  const [hipN, kN, aN, tN] = p.legNear;
  const sitting = name === "sit";

  // Back to front, so nearer limbs overlap farther ones.
  const suit: Seg[] = [
    { a: hipF, b: kF, w: 31 },
    { a: kF, b: aF, w: 23 },
    { a: hipN, b: kN, w: 32 },
    { a: kN, b: aN, w: 24 },
    { a: sF, b: eF, w: 25 },
    { a: eF, b: hF, w: 20 },
    { a: sN, b: eN, w: 25 },
    { a: eN, b: hN, w: 20 },
    { a: [p.head[0], p.head[1] + 18], b: [116, 122], w: 15 },
  ];
  // Gloves and boots.
  const red: Seg[] = [
    { a: lerp(kF, aF, 0.5), b: aF, w: 24 },
    { a: aF, b: tF, w: 19 },
    { a: lerp(kN, aN, 0.5), b: aN, w: 25 },
    { a: aN, b: tN, w: 19 },
    { a: lerp(eF, hF, 0.5), b: hF, w: 21 },
    { a: lerp(eN, hN, 0.5), b: hN, w: 21 },
  ];
  // Web-shooter cuffs: the engineering on the wrists.
  const cuffs: Seg[] = [
    { a: lerp(eF, hF, 0.42), b: lerp(eF, hF, 0.54), w: 24 },
    { a: lerp(eN, hN, 0.42), b: lerp(eN, hN, 0.54), w: 24 },
  ];
  // Racing stripes down each limb, bending at the joint.
  const stripes: Pt[][] = [
    [hipF, kF, lerp(kF, aF, 0.42)],
    [hipN, kN, lerp(kN, aN, 0.42)],
    [sF, eF, lerp(eF, hF, 0.35)],
    [sN, eN, lerp(eN, hN, 0.35)],
  ];
  const fists = [hF, hN];
  const body = [...suit, ...red];

  // Sitting, the arms reach round the laptop, so it sits between the body and the hands.
  const laptop = sitting && (
    <g className="slinger__laptop">
      <defs>
        <radialGradient id="slinger-glow">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff6a2b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* The screen's light on his chest and face, under the lid. */}
      <ellipse cx="116" cy="150" rx="62" ry="80" fill="url(#slinger-glow)" className="slinger__glow" />
      <path d="M86 216 L146 216 L152 228 L80 228 Z" className="slinger__laptop-base" />
      <path d="M90 168 H142 L146 216 H86 Z" className="slinger__laptop-lid" />
      <path d={lidMark} transform="translate(116 192)" className="slinger__laptop-mark" />
    </g>
  );

  return (
    <svg viewBox={sitting ? "-20 20 240 310" : "-20 -40 240 390"} aria-hidden="true" className={className} data-eyes="">
      {/* The web line, from the raised hand up out of frame. */}
      {!sitting && <path d="M150 24 V-40" className="slinger__line" />}

      {/* Ink outline first, all parts together, so overlaps read as one body. */}
      <g className="slinger__outline">
        {body.map((g, i) => (
          <path key={i} d={line(g.a, g.b)} strokeWidth={g.w + 7} />
        ))}
        <path d={TORSO} strokeWidth={7} />
        <ellipse cx="114" cy="210" rx="20" ry="13" strokeWidth={7} />
        <circle cx={p.head[0]} cy={p.head[1]} r="21" strokeWidth={7} />
        {fists.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="12.5" strokeWidth={7} />
        ))}
      </g>

      <g className="slinger__suit">
        {suit.map((g, i) => (
          <path key={i} d={line(g.a, g.b)} strokeWidth={g.w} />
        ))}
        <path d={TORSO} />
        <ellipse cx="114" cy="210" rx="20" ry="13" />
        <circle cx={p.head[0]} cy={p.head[1]} r="21" />
      </g>

      {/* Muscle lines: chest, ribs and abdomen, as a comic inker would mark them. */}
      <path d="M92 138 Q104 150 116 142 Q128 150 142 136 M116 142 V200 M100 166 Q116 172 134 164 M103 184 Q116 189 130 182" className="slinger__ink" />

      <g className="slinger__stripe">
        {stripes.map((pts, i) => (
          <path key={i} d={`M${pts.map((q) => q.join(" ")).join(" L")}`} />
        ))}
      </g>

      {/* Belt, buckle and the gear on the chest. */}
      <path d="M95 200 L133 198" className="slinger__belt" />
      <rect x="109" y="194" width="10" height="10" className="slinger__buckle" />
      <path d={emblem} transform="translate(116 158)" className="slinger__emblem" />
      <circle cx="116" cy="158" r="4" className="slinger__emblem-hub" />

      {laptop}

      <g className="slinger__red">
        {red.map((g, i) => (
          <path key={i} d={line(g.a, g.b)} strokeWidth={g.w} />
        ))}
        {fists.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="12.5" />
        ))}
      </g>
      <g className="slinger__cuff">
        {cuffs.map((g, i) => (
          <path key={i} d={line(g.a, g.b)} strokeWidth={g.w} />
        ))}
      </g>

      {/* Head: the goggle strap, then the lenses. */}
      <path
        d={`M${p.head[0] - 20} ${p.eyes[0][1] - 2} Q${p.head[0]} ${Math.min(p.eyes[0][1], p.eyes[1][1]) - 10} ${p.head[0] + 21} ${p.eyes[1][1] - 3}`}
        className="slinger__strap"
      />
      <g className="slinger__goggles">
        {p.eyes.map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r="8.6" className="slinger__lens" />
            <circle cx={cx} cy={cy + (sitting ? 2 : 0)} r="3.8" className="slinger__iris pupil" />
            <circle cx={cx - 3} cy={cy - 3.6} r="1.7" className="slinger__glint" />
          </g>
        ))}
      </g>
      {/* Highlights on the mask and shoulders, comic-style. */}
      <path
        d={`M${p.head[0] - 13} ${p.head[1] - 16} Q${p.head[0] - 3} ${p.head[1] - 22} ${p.head[0] + 9} ${p.head[1] - 20} M88 122 Q98 116 108 116`}
        className="slinger__shine"
      />

      {/* The web shot from the outstretched hand. */}
      {!sitting && (
        <g className="slinger__thwip">
          <path d="M22 122 L-6 104 M20 128 L-10 126 M22 134 L-4 148" />
        </g>
      )}
    </svg>
  );
}
