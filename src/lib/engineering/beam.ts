/*
 * Beam deflection by Euler–Bernoulli beam theory: small deflections, linear
 * elastic material, a straight prismatic beam, loads acting through the
 * section's centroid, and self-weight ignored. Shear deformation is neglected,
 * which is accurate for slender beams (span well over ten times the depth).
 *
 * SI units throughout: metres, newtons, pascals. Deflection is positive
 * downwards (sag). Sagging moments are positive, so a cantilever's moments
 * are negative (hogging). x runs from the left support, or from the fixed end
 * of a cantilever.
 *
 * Kept free of imports so the unit tests can run it directly under Node.
 */

export type Support = "simply-supported" | "cantilever";
export type LoadType = "point" | "udl";

export type BeamInput = {
  support: Support;
  load: LoadType;
  /** Span, m. */
  length: number;
  /** Point load P in N, or uniformly distributed load w in N/m. */
  magnitude: number;
  /** Position of a point load from the left support, m (simply supported only; a cantilever's point load is at the free end). */
  position?: number;
  /** Young's modulus, Pa. */
  E: number;
  /** Second moment of area, m⁴. */
  I: number;
  /** Distance from the neutral axis to the extreme fibre, m (for bending stress). */
  c: number;
};

export type BeamResult = {
  /** Support reactions, N, upward positive: [left, right] or [fixed end]. */
  reactions: number[];
  /** Moment at the fixed end of a cantilever, N·m (hogging, so negative). */
  fixedEndMoment?: number;
  maxDeflection: number;
  maxDeflectionAt: number;
  /** Largest bending moment by magnitude, N·m (signed). */
  maxMoment: number;
  maxMomentAt: number;
  /** Largest shear force by magnitude, N. */
  maxShear: number;
  /** Bending stress at the extreme fibre where |M| is largest, Pa. */
  maxStress: number;
  /** Total load carried, N. */
  totalLoad: number;
};

/** Second moment of area and extreme-fibre distance of a solid rectangle b × h (bending about the axis parallel to b). */
export function rectangleSection(b: number, h: number) {
  return { I: (b * h ** 3) / 12, c: h / 2, area: b * h };
}

function validate(input: BeamInput) {
  const { length, magnitude, E, I, c } = input;
  if (!(length > 0 && E > 0 && I > 0 && c > 0)) throw new RangeError("Length, E, I and c must be positive.");
  if (!Number.isFinite(magnitude) || magnitude < 0) throw new RangeError("Load must be zero or positive.");
  if (input.support === "simply-supported" && input.load === "point") {
    const a = input.position ?? length / 2;
    if (!(a >= 0 && a <= length)) throw new RangeError("Point load must lie on the span.");
  }
}

/** Downward deflection at x, m. */
export function deflectionAt(input: BeamInput, x: number): number {
  const { support, load, length: L, magnitude: F, E, I } = input;
  const EI = E * I;
  if (support === "simply-supported" && load === "point") {
    const a = input.position ?? L / 2;
    const b = L - a;
    if (x <= a) return (F * b * x * (L * L - b * b - x * x)) / (6 * EI * L);
    const u = L - x; // Same formula measured from the right support.
    return (F * a * u * (L * L - a * a - u * u)) / (6 * EI * L);
  }
  if (support === "simply-supported") return (F * x * (L ** 3 - 2 * L * x * x + x ** 3)) / (24 * EI);
  if (load === "point") return (F * x * x * (3 * L - x)) / (6 * EI);
  return (F * x * x * (6 * L * L - 4 * L * x + x * x)) / (24 * EI);
}

/** Bending moment at x, N·m (sagging positive). */
export function momentAt(input: BeamInput, x: number): number {
  const { support, load, length: L, magnitude: F } = input;
  if (support === "simply-supported" && load === "point") {
    const a = input.position ?? L / 2;
    const r1 = (F * (L - a)) / L;
    return x <= a ? r1 * x : r1 * x - F * (x - a);
  }
  if (support === "simply-supported") return (F * x * (L - x)) / 2;
  if (load === "point") return -F * (L - x);
  return (-F * (L - x) ** 2) / 2;
}

/** Shear force at x, N (positive when the left part is pushed up), the slope of the moment diagram. */
export function shearAt(input: BeamInput, x: number): number {
  const { support, load, length: L, magnitude: F } = input;
  if (support === "simply-supported" && load === "point") {
    const a = input.position ?? L / 2;
    const r1 = (F * (L - a)) / L;
    return x < a ? r1 : r1 - F;
  }
  if (support === "simply-supported") return F * (L / 2 - x);
  if (load === "point") return F;
  return F * (L - x);
}

export function analyseBeam(input: BeamInput): BeamResult {
  validate(input);
  const { support, load, length: L, magnitude: F, E, I, c } = input;
  const EI = E * I;
  let result: Omit<BeamResult, "maxStress">;

  if (support === "simply-supported" && load === "point") {
    const a = input.position ?? L / 2;
    const b = L - a;
    // dy/dx = 0 in the longer segment: x = √((L² − b²)/3) from the support farther from the load.
    const xm = a >= b ? Math.sqrt((L * L - b * b) / 3) : L - Math.sqrt((L * L - a * a) / 3);
    result = {
      reactions: [(F * b) / L, (F * a) / L],
      maxDeflection: deflectionAt(input, xm),
      maxDeflectionAt: xm,
      maxMoment: (F * a * b) / L,
      maxMomentAt: a,
      maxShear: Math.max(F * b, F * a) / L,
      totalLoad: F,
    };
  } else if (support === "simply-supported") {
    result = {
      reactions: [(F * L) / 2, (F * L) / 2],
      maxDeflection: (5 * F * L ** 4) / (384 * EI),
      maxDeflectionAt: L / 2,
      maxMoment: (F * L * L) / 8,
      maxMomentAt: L / 2,
      maxShear: (F * L) / 2,
      totalLoad: F * L,
    };
  } else if (load === "point") {
    result = {
      reactions: [F],
      fixedEndMoment: -F * L,
      maxDeflection: (F * L ** 3) / (3 * EI),
      maxDeflectionAt: L,
      maxMoment: -F * L,
      maxMomentAt: 0,
      maxShear: F,
      totalLoad: F,
    };
  } else {
    result = {
      reactions: [F * L],
      fixedEndMoment: (-F * L * L) / 2,
      maxDeflection: (F * L ** 4) / (8 * EI),
      maxDeflectionAt: L,
      maxMoment: (-F * L * L) / 2,
      maxMomentAt: 0,
      maxShear: F * L,
      totalLoad: F * L,
    };
  }
  return { ...result, maxStress: (Math.abs(result.maxMoment) * c) / I };
}

/** Evenly spaced samples of deflection, shear and moment for plotting. Includes the point-load position so the diagrams keep their corners. */
export function sampleBeam(input: BeamInput, count = 120) {
  const L = input.length;
  const xs = Array.from({ length: count + 1 }, (_, i) => (L * i) / count);
  if (input.support === "simply-supported" && input.load === "point") {
    const a = input.position ?? L / 2;
    xs.push(a, Math.min(L, a + L * 1e-9));
    xs.sort((p, q) => p - q);
  }
  return xs.map((x) => ({ x, deflection: deflectionAt(input, x), shear: shearAt(input, x), moment: momentAt(input, x) }));
}

export type Material = {
  id: string;
  name: string;
  /** Young's modulus, Pa. */
  E: number;
  /** Yield strength (metals) or characteristic bending strength (timber), Pa. */
  strength: number;
  strengthLabel: string;
  source: string;
};

/** Typical, educational values. Real values vary with grade, product form and temperature. */
export const MATERIALS: Material[] = [
  {
    id: "steel-s275",
    name: "Structural steel S275",
    E: 210e9,
    strength: 275e6,
    strengthLabel: "Yield strength",
    source: "EN 1993-1-1 (E = 210 GPa) and EN 10025-2 (fy = 275 MPa, t ≤ 16 mm)",
  },
  {
    id: "steel-304",
    name: "Stainless steel 304",
    E: 193e9,
    strength: 205e6,
    strengthLabel: "0.2% proof strength (min.)",
    source: "ASTM A240 (minimum 205 MPa); E as commonly published for 304",
  },
  {
    id: "al-6061-t6",
    name: "Aluminium 6061-T6",
    E: 68.9e9,
    strength: 276e6,
    strengthLabel: "Yield strength (typical)",
    source: "ASM handbook typical values for 6061-T6",
  },
  {
    id: "timber-c24",
    name: "Softwood timber C24",
    E: 11e9,
    strength: 24e6,
    strengthLabel: "Characteristic bending strength",
    source: "EN 338 strength class C24 (E₀,mean = 11 GPa, f_m,k = 24 MPa)",
  },
];

/** A common serviceability guideline (e.g. floors under live load): deflection no more than span / 360. Not a universal requirement. */
export const DEFLECTION_GUIDE = 360;
