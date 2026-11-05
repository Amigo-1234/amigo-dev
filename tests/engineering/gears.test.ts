/*
 * Gear checks against independent methods: hand-worked geometry, the
 * unwound-string definition of the involute, tooth thickness measured off the
 * drawn outline, a mesh simulation that turns two gears through a full tooth
 * pitch and checks they touch without overlapping, the contact ratio from a
 * direct construction of the line of action, and power balance through a
 * train.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  analyseTrain,
  centreDistance,
  contactRatio,
  gearGeometry,
  gearPath,
  insideGear,
  interferes,
  inv,
  meshRotation,
  MIN_TEETH_NO_UNDERCUT,
  PRESSURE_ANGLE,
  toothHalfAngle,
} from "../../src/lib/engineering/gears.ts";

const close = (actual: number, expected: number, tol: number, label = "") =>
  assert.ok(Math.abs(actual - expected) <= tol, `${label} expected ${expected}, got ${actual}`);

/** Vertices of an SVG path made of M, L and A commands (arc end points only). */
function vertices(d: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const [, cmd, args] of d.matchAll(/([MLA])([^MLAZ]*)/g)) {
    const n = args.trim().split(/[\s,]+/).map(Number);
    out.push(cmd === "A" ? [n[5], n[6]] : [n[0], n[1]]);
  }
  return out;
}

describe("geometry of a 20-tooth, module 2 gear (hand-worked)", () => {
  const g = gearGeometry(20, 2);
  test("diameters", () => {
    close(2 * g.pitchRadius, 40, 1e-12, "pitch d = mN = 40 mm");
    close(2 * g.tipRadius, 44, 1e-12, "tip d = m(N + 2) = 44 mm");
    close(2 * g.rootRadius, 35, 1e-12, "root d = m(N − 2.5) = 35 mm");
    close(2 * g.baseRadius, 37.58770483, 1e-8, "base d = 40·cos 20° = 37.588 mm");
  });
  test("pitches", () => {
    close(g.circularPitch, 6.283185307, 1e-9, "p = πm");
    close(g.basePitch, 5.904262, 1e-6, "pb = πm·cos 20°");
  });
  test("undercut limit is 2/sin²20° = 17.1, quoted as 17", () => {
    close(2 / Math.sin(PRESSURE_ANGLE) ** 2, 17.097, 1e-3);
    assert.equal(MIN_TEETH_NO_UNDERCUT, 17);
  });
});

describe("tooth outline", () => {
  for (const [teeth, module] of [[12, 3], [20, 2], [33, 1.5], [60, 1]] as const) {
    const g = gearGeometry(teeth, module);
    const pts = vertices(gearPath(g, 24));

    test(`${teeth}T: every flank point above the base circle lies on the involute (unwound string)`, () => {
      // An involute from base radius rb, unwound by roll angle t, sits at radius rb√(1+t²)
      // and is offset from where it left the base circle by the polar angle t − atan t.
      // So on a tooth, the polar half-angle at radius r must equal half-angle(rb) − (t − atan t).
      const halfAtBase = toothHalfAngle(g, g.baseRadius);
      let checked = 0;
      for (const [x, y] of pts) {
        const r = Math.hypot(x, y);
        if (r < g.baseRadius * 1.0001 || r > g.tipRadius * 0.9999) continue;
        const t = Math.sqrt((r / g.baseRadius) ** 2 - 1);
        const pitch = (2 * Math.PI) / teeth;
        const a = Math.atan2(y, x);
        const rem = ((a % pitch) + pitch) % pitch;
        const fromCentre = Math.min(rem, pitch - rem);
        // Path coordinates are rounded to 0.001 mm (up to 0.0007 mm per point), so allow 0.002 mm along the arc.
        close(fromCentre, halfAtBase - (t - Math.atan(t)), 0.002 / r, `r=${r}`);
        checked++;
      }
      assert.ok(checked > teeth * 20, "checked enough points");
    });

    test(`${teeth}T: tooth thickness on the pitch circle is πm/2, measured off the drawing`, () => {
      // Interpolate where the first tooth's two flanks cross the pitch circle.
      const flank = pts.slice(0, 2 * 26);
      const crossings: number[] = [];
      for (let i = 1; i < flank.length; i++) {
        const [x0, y0] = flank[i - 1];
        const [x1, y1] = flank[i];
        const r0 = Math.hypot(x0, y0);
        const r1 = Math.hypot(x1, y1);
        if ((r0 - g.pitchRadius) * (r1 - g.pitchRadius) <= 0 && r0 !== r1) {
          const f = (g.pitchRadius - r0) / (r1 - r0);
          crossings.push(Math.atan2(y0 + (y1 - y0) * f, x0 + (x1 - x0) * f));
        }
      }
      assert.equal(crossings.length, 2);
      const arc = Math.abs(crossings[1] - crossings[0]) * g.pitchRadius;
      close(arc, (Math.PI * module) / 2, 2e-3 * module, "s = πm/2");
    });

    test(`${teeth}T: outline stays between the root and tip circles`, () => {
      for (const [x, y] of pts) {
        const r = Math.hypot(x, y);
        assert.ok(r >= g.rootRadius - 1e-3 && r <= g.tipRadius + 1e-3, `r=${r}`);
      }
    });
  }
});

describe("mesh engagement", () => {
  /**
   * Turn gear 1 through one full tooth pitch, rotating gear 2 by meshRotation,
   * and test every vertex of gear 2's outline against gear 1's material. Returns
   * the deepest penetration, the radius on gear 1 where it happened, and the
   * closest approach (mm). Path coordinates are rounded to 0.001 mm, so a
   * correct mesh shows up to about 0.001 mm of apparent overlap.
   */
  function simulate(n1: number, n2: number, module: number, beta: number, phaseError = 0) {
    const g1 = gearGeometry(n1, module);
    const g2 = gearGeometry(n2, module);
    const a = centreDistance(module, n1, n2);
    const c2 = [a * Math.cos(beta), a * Math.sin(beta)];
    const outline2 = vertices(gearPath(g2, 40));
    let penetration = 0;
    let penetrationAt = 0;
    let closest = Infinity;
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const th1 = beta + ((2 * Math.PI) / n1) * (s / steps);
      const th2 = meshRotation(n1, n2, beta, th1) + phaseError;
      for (const [px, py] of outline2) {
        // Gear 2's vertex in world coordinates, then in gear 1's rotating frame.
        const wx = c2[0] + px * Math.cos(th2) - py * Math.sin(th2);
        const wy = c2[1] + px * Math.sin(th2) + py * Math.cos(th2);
        const r = Math.hypot(wx, wy);
        if (r > g1.tipRadius + module) continue;
        const theta = Math.atan2(wy, wx) - th1;
        const pitch = (2 * Math.PI) / n1;
        const rem = ((theta % pitch) + pitch) % pitch;
        const gap = (Math.min(rem, pitch - rem) - toothHalfAngle(g1, r)) * r; // > 0 outside gear 1's tooth
        if (insideGear(g1, r, theta) && r > g1.rootRadius && -gap > penetration) {
          penetration = -gap;
          penetrationAt = r;
        }
        if (r <= g1.tipRadius && r >= g1.baseRadius) closest = Math.min(closest, Math.abs(gap));
      }
    }
    return { penetration, penetrationAt, closest, baseRadius: g1.baseRadius };
  }

  for (const [n1, n2, m, beta] of [[20, 40, 2, 0], [14, 22, 3, 0.7], [17, 17, 1, -1.9], [25, 61, 1.5, 2.4], [18, 80, 2, 1.2]] as const) {
    test(`${n1}T–${n2}T, module ${m}: teeth touch through a full pitch without overlapping`, () => {
      assert.equal(interferes(m, n1, n2), false);
      const { penetration, closest } = simulate(n1, n2, m, beta);
      assert.ok(penetration < 0.002, `penetration ${penetration} mm (drawing precision is 0.001 mm)`);
      assert.ok(closest < 0.02 * m, `teeth stay in contact (closest approach ${closest} mm)`);
    });
  }

  test("12T–30T: the interference check and the simulation agree that the tips cut in", () => {
    // Gear 2's tip (48 mm) exceeds √(rb₂² + (a·sin20°)²) = √(42.286² + 21.547²) = 47.46 mm.
    assert.equal(interferes(3, 12, 30), true);
    const sim = simulate(12, 30, 3, 0.7);
    assert.ok(sim.penetration > 0.005, `overlap ${sim.penetration} mm, well beyond drawing precision`);
    assert.ok(sim.penetrationAt < sim.baseRadius, `overlap at r=${sim.penetrationAt}, below the pinion's base circle ${sim.baseRadius}`);
    assert.match(analyseTrain({ teeth: [12, 30], module: 3, inputSpeed: 100, inputTorque: 1, meshEfficiency: 1 }).warnings.join(" "), /interference/);
  });

  test("control: the wrong phase (tooth on tooth) is detected as interference", () => {
    const { penetration } = simulate(20, 40, 2, 0, Math.PI / 40);
    assert.ok(penetration > 0.5, `penetration ${penetration} mm`);
  });

  test("meshing gears turn in opposite directions at the inverse ratio of their teeth", () => {
    const d = meshRotation(20, 50, 0.3, 1.0) - meshRotation(20, 50, 0.3, 0.9);
    close(d, -0.1 * (20 / 50), 1e-12);
  });

  test("centre distance is the sum of the pitch radii", () => {
    close(centreDistance(2, 20, 40), 60, 1e-12);
  });
});

describe("contact ratio", () => {
  // Independent construction: walk along the line of action (through the pitch
  // point, inclined at 20° to the common tangent) and measure the stretch that
  // lies inside both tip circles, limited by the two interference points where
  // the line touches the base circles.
  function constructed(module: number, n1: number, n2: number) {
    const g1 = gearGeometry(n1, module);
    const g2 = gearGeometry(n2, module);
    const a = centreDistance(module, n1, n2);
    const P = [g1.pitchRadius, 0];
    const d = [Math.sin(PRESSURE_ANGLE), Math.cos(PRESSURE_ANGLE)];
    const along = (s: number) => [P[0] + d[0] * s, P[1] + d[1] * s];
    const T1 = g1.baseRadius * Math.tan(PRESSURE_ANGLE); // distance from P to the tangency points
    const T2 = g2.baseRadius * Math.tan(PRESSURE_ANGLE);
    let lo = Infinity;
    let hi = -Infinity;
    const step = module * 1e-5;
    for (let s = -T1 - module; s <= T2 + module; s += step) {
      const [x, y] = along(s);
      // T1 and T2 are the tangency (interference) points on the base circles of gear 1 and gear 2.
      if (Math.hypot(x, y) <= g1.tipRadius && Math.hypot(x - a, y) <= g2.tipRadius && s >= -T1 && s <= T2) {
        lo = Math.min(lo, s);
        hi = Math.max(hi, s);
      }
    }
    return (hi - lo) / g1.basePitch;
  }

  for (const [n1, n2] of [[20, 20], [20, 40], [17, 60], [30, 31]] as const) {
    test(`${n1}T–${n2}T: closed form agrees with the construction`, () => {
      close(contactRatio(2, n1, n2), constructed(2, n1, n2), 1e-3);
    });
  }

  test("two 20-tooth gears: ε = 1.557 (hand-worked)", () => {
    // r = 10m, ra = 11m, rb = 9.3969m: √(121 − 88.302) = 5.7182m each, a·sin20° = 20m × 0.34202 = 6.8404m
    // path = 2 × 5.7182 − 6.8404 = 4.5960m; base pitch = πm·cos20° = 2.9521m; ε = 1.5569
    close(contactRatio(1, 20, 20), 1.5569, 1e-4);
  });

  test("contact ratio does not depend on the module", () => {
    close(contactRatio(1, 18, 45), contactRatio(4, 18, 45), 1e-12);
  });

  test("involute function", () => {
    close(inv(PRESSURE_ANGLE), 0.014904384, 1e-9);
  });
});

describe("gear trains", () => {
  test("20T driving 60T at 1500 rpm with 10 N·m and 98% mesh efficiency (hand-worked)", () => {
    // n₂ = 1500 × 20/60 = 500 rpm, opposite direction. T₂ = 10 × 0.98 × 60/20 = 29.4 N·m.
    // P_in = 10 × 1500 × 2π/60 = 1570.80 W, P_out = 0.98 × 1570.80 = 1539.38 W.
    // Pitch-line velocity = π × 0.040 m × 1500 / 60 = 3.1416 m/s.
    const r = analyseTrain({ teeth: [20, 60], module: 2, inputSpeed: 1500, inputTorque: 10, meshEfficiency: 0.98 });
    close(r.gears[1].speed, 500, 1e-9);
    assert.equal(r.gears[1].direction, -1);
    close(r.gears[1].torque, 29.4, 1e-9);
    close(r.gears[0].power, 1570.796, 1e-3);
    close(r.gears[1].power, 1539.380, 1e-3);
    close(r.meshes[0].pitchLineVelocity, 3.14159, 1e-5);
    close(r.ratio, 3, 1e-12);
  });

  test("an idler changes direction but not the ratio, and costs one mesh of efficiency", () => {
    const direct = analyseTrain({ teeth: [20, 60], module: 2, inputSpeed: 1500, inputTorque: 10, meshEfficiency: 0.98 });
    const idler = analyseTrain({ teeth: [20, 35, 60], module: 2, inputSpeed: 1500, inputTorque: 10, meshEfficiency: 0.98 });
    close(idler.gears[2].speed, direct.gears[1].speed, 1e-9);
    assert.equal(idler.gears[2].direction, 1);
    close(idler.gears[2].torque, 10 * 0.98 ** 2 * 3, 1e-9);
    close(idler.efficiency, 0.98 ** 2, 1e-12);
  });

  test("power balance: T·ω on every gear equals η^k × input power", () => {
    const r = analyseTrain({ teeth: [14, 41, 23, 77], module: 1.5, inputSpeed: 2900, inputTorque: 6.5, meshEfficiency: 0.97 });
    const pIn = 6.5 * ((2900 * 2 * Math.PI) / 60);
    r.gears.forEach((g, k) => close(g.torque * ((g.speed * 2 * Math.PI) / 60), pIn * 0.97 ** k, 1e-9, `gear ${k}`));
  });

  test("speed × teeth is the same on both sides of every mesh", () => {
    const r = analyseTrain({ teeth: [19, 47, 31], module: 2.5, inputSpeed: 960, inputTorque: 12, meshEfficiency: 0.98 });
    for (const m of r.meshes) close(r.gears[m.index].speed * r.gears[m.index].teeth, r.gears[m.index + 1].speed * r.gears[m.index + 1].teeth, 1e-9);
  });

  test("warnings for undercut and low contact ratio", () => {
    assert.match(analyseTrain({ teeth: [12, 30], module: 2, inputSpeed: 100, inputTorque: 1, meshEfficiency: 1 }).warnings.join(" "), /undercut badly/);
    assert.match(analyseTrain({ teeth: [15, 30], module: 2, inputSpeed: 100, inputTorque: 1, meshEfficiency: 1 }).warnings.join(" "), /slightly undercut/);
    assert.equal(analyseTrain({ teeth: [20, 40], module: 2, inputSpeed: 100, inputTorque: 1, meshEfficiency: 1 }).warnings.length, 0);
  });

  test("invalid input is rejected", () => {
    assert.throws(() => analyseTrain({ teeth: [20], module: 2, inputSpeed: 1, inputTorque: 1, meshEfficiency: 1 }));
    assert.throws(() => analyseTrain({ teeth: [20, 4], module: 2, inputSpeed: 1, inputTorque: 1, meshEfficiency: 1 }));
    assert.throws(() => analyseTrain({ teeth: [20, 30], module: 0, inputSpeed: 1, inputTorque: 1, meshEfficiency: 1 }));
    assert.throws(() => analyseTrain({ teeth: [20, 30], module: 2, inputSpeed: 1, inputTorque: 1, meshEfficiency: 1.2 }));
  });
});
