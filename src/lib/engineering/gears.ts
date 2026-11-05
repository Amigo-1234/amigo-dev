/*
 * Spur gears: geometry, tooth outlines and simple gear trains.
 *
 * Standard full-depth involute teeth (ISO 53 basic rack): pressure angle 20°,
 * addendum 1·m, dedendum 1.25·m, where m is the module (pitch diameter per
 * tooth, in mm). A simple train is a row of external gears, one per shaft,
 * each meshing with the next. Lengths are in millimetres, speeds in rpm,
 * torques in N·m.
 *
 * Simplifications, stated on the instrument page: rigid teeth, no backlash,
 * no profile shift, and below the base circle the flank is drawn as a radial
 * line (real teeth have a trochoidal root fillet, and undercut when cut with
 * fewer than about 17 teeth). Efficiency is a fixed fraction per mesh.
 *
 * Kept free of imports so the unit tests can run it directly under Node.
 */

export const PRESSURE_ANGLE = (20 * Math.PI) / 180;
export const ADDENDUM = 1;
export const DEDENDUM = 1.25;
/**
 * Fewest teeth a 20° full-depth gear can have before a rack-type cutter
 * undercuts it: 2 / sin²(20°) = 17.1, usually quoted as 17.
 */
export const MIN_TEETH_NO_UNDERCUT = Math.floor(2 / Math.sin(PRESSURE_ANGLE) ** 2);
/** A common practical minimum, accepting slight undercut. */
export const MIN_TEETH_PRACTICAL = 14;

/** Involute function: inv(α) = tan α − α. */
export const inv = (alpha: number) => Math.tan(alpha) - alpha;

export type GearGeometry = {
  teeth: number;
  module: number;
  pitchRadius: number;
  baseRadius: number;
  tipRadius: number;
  rootRadius: number;
  /** Distance between corresponding points on adjacent teeth, along the pitch circle: π·m. */
  circularPitch: number;
  /** Circular pitch measured along the base circle (and the line of action): π·m·cos α. */
  basePitch: number;
};

export function gearGeometry(teeth: number, module: number): GearGeometry {
  const pitchRadius = (module * teeth) / 2;
  return {
    teeth,
    module,
    pitchRadius,
    baseRadius: pitchRadius * Math.cos(PRESSURE_ANGLE),
    tipRadius: pitchRadius + ADDENDUM * module,
    rootRadius: pitchRadius - DEDENDUM * module,
    circularPitch: Math.PI * module,
    basePitch: Math.PI * module * Math.cos(PRESSURE_ANGLE),
  };
}

/**
 * Angular half-thickness of a tooth at radius r, measured from the tooth's
 * centre line (radians). On the involute (r ≥ base radius) it is
 * π/(2N) + inv(α) − inv(α_r) with cos α_r = r_b / r; below the base circle the
 * flank is radial, so the half-thickness stays at its base-circle value.
 * Returns a negative number above the point where the two flanks meet.
 */
export function toothHalfAngle(g: GearGeometry, r: number): number {
  const atPitch = Math.PI / (2 * g.teeth);
  const rr = Math.max(r, g.baseRadius);
  const alphaR = Math.acos(g.baseRadius / rr);
  return atPitch + inv(PRESSURE_ANGLE) - inv(alphaR);
}

/** Whether a point at polar (r, θ) in the gear's own frame lies inside the gear's material. */
export function insideGear(g: GearGeometry, r: number, theta: number): boolean {
  if (r <= g.rootRadius) return true;
  if (r > g.tipRadius) return false;
  const pitchAngle = (2 * Math.PI) / g.teeth;
  // Angle to the nearest tooth centre line (teeth are centred on k·2π/N).
  const rem = ((theta % pitchAngle) + pitchAngle) % pitchAngle;
  return Math.min(rem, pitchAngle - rem) <= toothHalfAngle(g, r);
}

/**
 * Closed SVG path of the gear outline, centred on (0, 0), with a tooth centred
 * on the positive x axis. `steps` points per involute flank.
 */
export function gearPath(g: GearGeometry, steps = 8): string {
  const pts: Array<[number, number]> = [];
  const pitchAngle = (2 * Math.PI) / g.teeth;
  const flankStart = Math.max(g.baseRadius, g.rootRadius);
  // Radii along one flank, from the root up to the tip; the involute is sampled
  // evenly in roll angle so the curve is smooth near the base circle.
  const tRoll = (r: number) => Math.sqrt(Math.max(0, (r / g.baseRadius) ** 2 - 1));
  const t0 = tRoll(flankStart);
  const t1 = tRoll(g.tipRadius);
  const radii: number[] = [];
  if (g.rootRadius < g.baseRadius) radii.push(g.rootRadius);
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    radii.push(g.baseRadius * Math.sqrt(1 + t * t));
  }
  const polar = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)];
  for (let k = 0; k < g.teeth; k++) {
    const c = k * pitchAngle;
    // Leading flank: root → tip on the lower side of the tooth centre line.
    for (const r of radii) pts.push(polar(r, c - toothHalfAngle(g, r)));
    // Trailing flank: tip → root on the upper side.
    for (let i = radii.length - 1; i >= 0; i--) pts.push(polar(radii[i], c + toothHalfAngle(g, radii[i])));
  }
  const tipHalf = toothHalfAngle(g, g.tipRadius);
  const rootHalf = pitchAngle / 2 - toothHalfAngle(g, g.rootRadius);
  const f = (n: number) => Number(n.toFixed(3));
  const perTooth = radii.length * 2;
  let d = "";
  for (let k = 0; k < g.teeth; k++) {
    const flank = pts.slice(k * perTooth, (k + 1) * perTooth);
    const half = radii.length;
    d += k === 0 ? `M${f(flank[0][0])} ${f(flank[0][1])}` : "";
    for (let i = 1; i < half; i++) d += `L${f(flank[i][0])} ${f(flank[i][1])}`;
    // Tip land: an arc across the top of the tooth.
    if (tipHalf > 0) d += `A${f(g.tipRadius)} ${f(g.tipRadius)} 0 0 1 ${f(flank[half][0])} ${f(flank[half][1])}`;
    for (let i = half + 1; i < perTooth; i++) d += `L${f(flank[i][0])} ${f(flank[i][1])}`;
    // Root land: an arc along the root circle to the next tooth.
    const next = pts[((k + 1) % g.teeth) * perTooth];
    if (rootHalf > 0) d += `A${f(g.rootRadius)} ${f(g.rootRadius)} 0 0 1 ${f(next[0])} ${f(next[1])}`;
    else d += `L${f(next[0])} ${f(next[1])}`;
  }
  return d + "Z";
}

/** Centre distance for two external gears in mesh: m(N₁ + N₂)/2. */
export const centreDistance = (module: number, n1: number, n2: number) => (module * (n1 + n2)) / 2;

/**
 * Rotation of the driven gear that keeps a pair in mesh. Gear 2's centre lies
 * in direction `beta` (radians) from gear 1's. When gear 1 is rotated by θ₁,
 * gear 2 is rotated by β + π − π/N₂ − (N₁/N₂)(θ₁ − β): one of gear 1's teeth
 * pointing along β sits in the middle of one of gear 2's spaces, and the two
 * turn in opposite directions at the inverse ratio of their teeth.
 */
export const meshRotation = (n1: number, n2: number, beta: number, theta1: number) =>
  beta + Math.PI - Math.PI / n2 - (n1 / n2) * (theta1 - beta);

/**
 * Transverse contact ratio of an external pair: the average number of tooth
 * pairs in contact. Length of the path of contact divided by the base pitch:
 * (√(r_a1² − r_b1²) + √(r_a2² − r_b2²) − a·sin α) / (π·m·cos α).
 * Below 1 the gears lose contact between teeth; about 1.2 is the usual minimum.
 */
export function contactRatio(module: number, n1: number, n2: number): number {
  const g1 = gearGeometry(n1, module);
  const g2 = gearGeometry(n2, module);
  const a = centreDistance(module, n1, n2);
  const path =
    Math.sqrt(g1.tipRadius ** 2 - g1.baseRadius ** 2) + Math.sqrt(g2.tipRadius ** 2 - g2.baseRadius ** 2) - a * Math.sin(PRESSURE_ANGLE);
  return path / g1.basePitch;
}

/**
 * Involute interference: a gear's tip reaching inside the other gear's base
 * circle, where that gear has no involute to meet it. It happens when either
 * tip radius exceeds √(r_b² + (a·sin α)²), the distance from the gear's centre
 * to the far interference point on the line of action. Real gears avoid it with
 * profile shift or fewer/more teeth; drawn here, the teeth would overlap.
 */
export function interferes(module: number, n1: number, n2: number): boolean {
  const g1 = gearGeometry(n1, module);
  const g2 = gearGeometry(n2, module);
  const reach = centreDistance(module, n1, n2) * Math.sin(PRESSURE_ANGLE);
  const limit = (g: GearGeometry) => Math.sqrt(g.baseRadius ** 2 + reach ** 2);
  return g1.tipRadius > limit(g1) + 1e-9 || g2.tipRadius > limit(g2) + 1e-9;
}

export type TrainInput = {
  /** Tooth counts, driver first; each gear meshes with the next. */
  teeth: number[];
  module: number;
  /** Driver speed, rpm. */
  inputSpeed: number;
  /** Torque applied to the driver, N·m. */
  inputTorque: number;
  /** Efficiency of each mesh, 0–1 (0.98 is typical for well-lubricated spur gears). */
  meshEfficiency: number;
};

export type GearState = {
  teeth: number;
  /** rpm, always positive; see `direction`. */
  speed: number;
  /** +1 turns the same way as the driver, −1 the opposite way. */
  direction: 1 | -1;
  torque: number;
  /** W */
  power: number;
  pitchDiameter: number;
};

export type MeshState = {
  /** Index of the first gear of the pair. */
  index: number;
  centreDistance: number;
  contactRatio: number;
  /** True when a tip cuts below the other gear's base circle (see `interferes`). */
  interference: boolean;
  /** Pitch-line velocity, m/s; equal on both gears of a mesh. */
  pitchLineVelocity: number;
};

export type TrainResult = {
  gears: GearState[];
  meshes: MeshState[];
  /** Speed ratio n_in / n_out (> 1 is a reduction). Idlers do not change it. */
  ratio: number;
  /** Overall efficiency, η^meshes. */
  efficiency: number;
  warnings: string[];
};

const rpmToRad = (rpm: number) => (rpm * 2 * Math.PI) / 60;

export function analyseTrain(input: TrainInput): TrainResult {
  const { teeth, module, inputSpeed, inputTorque, meshEfficiency } = input;
  if (teeth.length < 2) throw new RangeError("A train needs at least two gears.");
  if (!(module > 0)) throw new RangeError("Module must be positive.");
  if (!(meshEfficiency > 0 && meshEfficiency <= 1)) throw new RangeError("Mesh efficiency must be in (0, 1].");
  if (teeth.some((n) => !Number.isInteger(n) || n < 6)) throw new RangeError("Each gear needs a whole number of teeth, at least 6.");

  const n0 = teeth[0];
  const inputPower = inputTorque * rpmToRad(inputSpeed);
  const gears: GearState[] = teeth.map((n, i) => {
    const speed = (inputSpeed * n0) / n;
    const power = inputPower * meshEfficiency ** i;
    return {
      teeth: n,
      speed,
      direction: i % 2 === 0 ? 1 : -1,
      // T = P / ω = T₀ · η^i · N_i / N₀ (written this way so a stopped train still has torque).
      torque: inputTorque * meshEfficiency ** i * (n / n0),
      power,
      pitchDiameter: module * n,
    };
  });
  const meshes: MeshState[] = teeth.slice(1).map((n, i) => ({
    index: i,
    centreDistance: centreDistance(module, teeth[i], n),
    contactRatio: contactRatio(module, teeth[i], n),
    interference: interferes(module, teeth[i], n),
    // v = π·d·n / 60 with d in metres; the same for every mesh of a simple train.
    pitchLineVelocity: (Math.PI * module * n0 * inputSpeed) / 60000,
  }));

  const warnings: string[] = [];
  const small = teeth.filter((n) => n < MIN_TEETH_NO_UNDERCUT);
  if (small.some((n) => n < MIN_TEETH_PRACTICAL))
    warnings.push(`Gears with fewer than ${MIN_TEETH_PRACTICAL} teeth undercut badly when cut with a standard 20° cutter; real designs use profile shift.`);
  else if (small.length) warnings.push(`Gears with fewer than ${MIN_TEETH_NO_UNDERCUT} teeth are slightly undercut by a standard 20° cutter.`);
  if (meshes.some((m) => m.interference))
    warnings.push("A tooth tip reaches below the other gear's base circle (involute interference). Real gears would need profile shift or a different tooth count.");
  else if (meshes.some((m) => m.contactRatio < 1.2)) warnings.push("A contact ratio below 1.2 gives rough, noisy engagement.");

  return {
    gears,
    meshes,
    ratio: teeth[teeth.length - 1] / n0,
    efficiency: meshEfficiency ** meshes.length,
    warnings,
  };
}
