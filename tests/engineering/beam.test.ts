/*
 * Beam checks against independent methods, not against the same formulas:
 * hand-worked examples, statics (equilibrium and dM/dx = V), Maxwell–Betti
 * reciprocity, and numerical double integration of the curvature −M/EI with
 * each case's boundary conditions.
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  analyseBeam,
  type BeamInput,
  deflectionAt,
  MATERIALS,
  momentAt,
  rectangleSection,
  sampleBeam,
  shearAt,
} from "../../src/lib/engineering/beam.ts";

const close = (actual: number, expected: number, rel = 1e-9, label = "") =>
  assert.ok(Math.abs(actual - expected) <= rel * Math.max(1, Math.abs(expected)), `${label} expected ${expected}, got ${actual}`);

const base = { E: 200e9, I: 8e-6, c: 0.1 };

describe("hand-worked examples", () => {
  test("simply supported steel beam, 10 kN at midspan over 4 m", () => {
    // δ = PL³/48EI = 10 000 × 64 / (48 × 200e9 × 8e-6) = 640 000 / 76 800 000 = 8.333 mm
    // M = PL/4 = 10 kN·m;  σ = Mc/I = 10 000 × 0.1 / 8e-6 = 125 MPa
    const r = analyseBeam({ ...base, support: "simply-supported", load: "point", length: 4, magnitude: 10_000, position: 2 });
    close(r.maxDeflection, 0.0083333333333, 1e-9, "δmax");
    close(r.maxDeflectionAt, 2, 1e-12, "x of δmax");
    close(r.maxMoment, 10_000, 1e-12, "Mmax");
    close(r.maxStress, 125e6, 1e-12, "σmax");
    assert.deepEqual(r.reactions, [5000, 5000]);
  });

  test("cantilever with 2 kN/m over 3 m", () => {
    // I = 60e-6 m⁴:  δ = wL⁴/8EI = 2000 × 81 / (8 × 200e9 × 60e-6) = 162 000 / 96 000 000 = 1.6875 mm
    // M_fixed = −wL²/2 = −9 kN·m;  R = wL = 6 kN
    const r = analyseBeam({ ...base, I: 60e-6, support: "cantilever", load: "udl", length: 3, magnitude: 2000 });
    close(r.maxDeflection, 0.0016875, 1e-12, "δtip");
    close(r.fixedEndMoment!, -9000, 1e-12, "M fixed");
    assert.deepEqual(r.reactions, [6000]);
  });

  test("cantilever with 5 kN at the tip over 2 m", () => {
    // δ = PL³/3EI = 5000 × 8 / (3 × 200e9 × 8e-6) = 40 000 / 4 800 000 = 8.333 mm
    const r = analyseBeam({ ...base, support: "cantilever", load: "point", length: 2, magnitude: 5000 });
    close(r.maxDeflection, 0.0083333333333, 1e-9);
    close(r.maxMoment, -10_000, 1e-12);
  });

  test("simply supported, 4 kN/m over 5 m", () => {
    // δ = 5wL⁴/384EI = 5 × 4000 × 625 / (384 × 200e9 × 8e-6) = 12 500 000 / 614 400 000 = 20.345 mm
    // M = wL²/8 = 12.5 kN·m
    const r = analyseBeam({ ...base, support: "simply-supported", load: "udl", length: 5, magnitude: 4000 });
    close(r.maxDeflection, 0.0203450520833, 1e-9);
    close(r.maxMoment, 12_500, 1e-12);
    assert.deepEqual(r.reactions, [10_000, 10_000]);
  });

  test("simply supported, off-centre point load: a = 1 m, b = 3 m, L = 4 m, P = 12 kN", () => {
    // R1 = Pb/L = 9 kN, R2 = Pa/L = 3 kN, M = Pab/L = 9 kN·m at the load.
    // Max deflection at x = √((L² − a²)/3) from the right support (the longer segment):
    // √((16 − 1)/3) = √5 = 2.2361 m, i.e. x = 4 − 2.2361 = 1.7639 m from the left.
    // δmax = P·a·(L² − a²)^1.5 / (9√3·EI·L) = 12 000 × 1 × 58.0948 / (15.5885 × 1.6e6 × 4)
    //      = 697 137 / 99 766 125 = 6.988 mm   (EI = 200e9 × 8e-6 = 1.6e6 N·m²)
    const r = analyseBeam({ ...base, support: "simply-supported", load: "point", length: 4, magnitude: 12_000, position: 1 });
    assert.deepEqual(r.reactions, [9000, 3000]);
    close(r.maxMoment, 9000, 1e-12);
    close(r.maxDeflectionAt, 4 - Math.sqrt(5), 1e-12);
    const EI = base.E * base.I;
    close(r.maxDeflection, (12_000 * 1 * 15 ** 1.5) / (9 * Math.sqrt(3) * EI * 4), 1e-9, "textbook δmax for an off-centre load");
    close(r.maxDeflection, 0.0069877, 1e-4, "hand-computed 6.988 mm");
  });
});

const cases: Array<[string, Omit<BeamInput, "E" | "I" | "c">]> = [
  ["SS point at midspan", { support: "simply-supported", load: "point", length: 4, magnitude: 10_000, position: 2 }],
  ["SS point at 0.3 L", { support: "simply-supported", load: "point", length: 6, magnitude: 7_500, position: 1.8 }],
  ["SS point at 0.85 L", { support: "simply-supported", load: "point", length: 3, magnitude: 2_000, position: 2.55 }],
  ["SS UDL", { support: "simply-supported", load: "udl", length: 5, magnitude: 4_000 }],
  ["cantilever tip load", { support: "cantilever", load: "point", length: 2.5, magnitude: 3_000 }],
  ["cantilever UDL", { support: "cantilever", load: "udl", length: 3, magnitude: 2_000 }],
];

describe("statics", () => {
  for (const [name, c] of cases) {
    const input = { ...base, ...c };
    test(`${name}: reactions balance the load and the moments`, () => {
      const r = analyseBeam(input);
      close(r.reactions.reduce((s, v) => s + v, 0), r.totalLoad, 1e-12, "ΣF");
      if (c.support === "simply-supported") {
        // Moments about the left support: R2·L = load × lever arm.
        const arm = c.load === "point" ? c.position! : c.length / 2;
        close(r.reactions[1] * c.length, r.totalLoad * arm, 1e-12, "ΣM");
        close(momentAt(input, 0), 0, 1e-12, "M(0)");
        close(momentAt(input, c.length), 0, 1e-9, "M(L)");
      } else {
        close(momentAt(input, c.length), 0, 1e-12, "M at the free end");
        close(momentAt(input, 0), r.fixedEndMoment!, 1e-12, "M at the fixed end");
      }
    });

    test(`${name}: the shear is the slope of the moment diagram`, () => {
      const h = c.length * 1e-6;
      for (let i = 1; i < 20; i++) {
        const x = (c.length * i) / 20 + c.length * 0.013;
        if (c.load === "point" && c.support === "simply-supported" && Math.abs(x - c.position!) < 2 * h) continue;
        const slope = (momentAt(input, x + h) - momentAt(input, x - h)) / (2 * h);
        close(slope, shearAt(input, x), 1e-6, `dM/dx at ${x}`);
      }
    });
  }
});

describe("deflection by numerical integration of −M/EI", () => {
  // Integrate y'' = −M/EI twice with the trapezium rule, then apply the boundary
  // conditions: y(0) = y(L) = 0 for simple supports, y(0) = y'(0) = 0 for a cantilever.
  for (const [name, c] of cases) {
    test(name, () => {
      const input = { ...base, ...c };
      const EI = input.E * input.I;
      const n = 20_000;
      const L = c.length;
      const dx = L / n;
      const slope = new Float64Array(n + 1);
      const y = new Float64Array(n + 1);
      for (let i = 1; i <= n; i++) {
        const k0 = -momentAt(input, (i - 1) * dx) / EI;
        const k1 = -momentAt(input, i * dx) / EI;
        slope[i] = slope[i - 1] + ((k0 + k1) / 2) * dx;
        y[i] = y[i - 1] + ((slope[i - 1] + slope[i]) / 2) * dx;
      }
      // Simply supported: add the rigid rotation θ₀·x that brings y(L) back to zero.
      const theta0 = c.support === "simply-supported" ? -y[n] / L : 0;
      let peak = 0;
      for (let i = 0; i <= n; i += 500) {
        const x = i * dx;
        const numeric = y[i] + theta0 * x;
        peak = Math.max(peak, numeric);
        const exact = deflectionAt(input, x);
        assert.ok(Math.abs(numeric - exact) <= 1e-6 * Math.abs(analyseBeam(input).maxDeflection), `${name} at x=${x}: numeric ${numeric}, closed form ${exact}`);
      }
      assert.ok(analyseBeam(input).maxDeflection >= peak * (1 - 1e-9), "reported maximum is at least the numeric peak");
    });
  }
});

describe("maximum deflection", () => {
  for (const [name, c] of cases) {
    test(`${name}: reported maximum is the largest value on the span, where the slope is zero`, () => {
      const input = { ...base, ...c };
      const r = analyseBeam(input);
      const samples = sampleBeam(input, 2000);
      const largest = Math.max(...samples.map((s) => s.deflection));
      close(r.maxDeflection, largest, 1e-6);
      close(deflectionAt(input, r.maxDeflectionAt), r.maxDeflection, 1e-12);
      if (c.support === "simply-supported") {
        const h = c.length * 1e-6;
        const d = (deflectionAt(input, r.maxDeflectionAt + h) - deflectionAt(input, r.maxDeflectionAt - h)) / (2 * h);
        assert.ok(Math.abs(d) < 1e-6 * r.maxDeflection, `slope at the maximum ${d}`);
      }
    });
  }
});

test("Maxwell–Betti: deflection at B from a load at A equals deflection at A from the same load at B", () => {
  const L = 5;
  for (const [a, b] of [[1, 3.5], [0.7, 2.5], [2, 4.6]]) {
    const at = (load: number, x: number) =>
      deflectionAt({ ...base, support: "simply-supported", load: "point", length: L, magnitude: 1000, position: load }, x);
    close(at(a, b), at(b, a), 1e-12, `δ(${b} | load at ${a})`);
  }
});

test("deflection scales linearly with load and inversely with EI", () => {
  const input: BeamInput = { ...base, support: "simply-supported", load: "point", length: 4, magnitude: 1000, position: 1.5 };
  const d = analyseBeam(input).maxDeflection;
  close(analyseBeam({ ...input, magnitude: 3000 }).maxDeflection, 3 * d, 1e-12);
  close(analyseBeam({ ...input, I: input.I * 2 }).maxDeflection, d / 2, 1e-12);
});

test("rectangular section properties", () => {
  // 100 mm wide × 200 mm deep: I = 0.1 × 0.2³ / 12 = 6.667e-5 m⁴, c = 0.1 m.
  const s = rectangleSection(0.1, 0.2);
  close(s.I, 6.6666666667e-5, 1e-9);
  assert.equal(s.c, 0.1);
});

test("material presets are within published ranges", () => {
  for (const m of MATERIALS) {
    assert.ok(m.E > 5e9 && m.E < 250e9, m.name);
    assert.ok(m.strength > 10e6 && m.strength < 400e6, m.name);
    assert.ok(m.source.length > 10, `${m.name} cites a source`);
  }
});

test("invalid input is rejected", () => {
  assert.throws(() => analyseBeam({ ...base, support: "simply-supported", load: "point", length: 0, magnitude: 1 }));
  assert.throws(() => analyseBeam({ ...base, support: "simply-supported", load: "point", length: 2, magnitude: 1, position: 3 }));
  assert.throws(() => analyseBeam({ ...base, support: "cantilever", load: "udl", length: 2, magnitude: -5 }));
});
