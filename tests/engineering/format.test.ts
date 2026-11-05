import assert from "node:assert/strict";
import { test } from "node:test";

import { formatSI, formatSig } from "../../src/lib/engineering/format.ts";

test("significant figures, without exponent notation or trailing zeros", () => {
  assert.equal(formatSig(8.333333, 3), "8.33");
  assert.equal(formatSig(29.4, 3), "29.4");
  assert.equal(formatSig(1500, 3), "1500");
  assert.equal(formatSig(0.000123456, 3), "0.000123");
  assert.equal(formatSig(2, 3), "2");
  assert.equal(formatSig(-12.5, 3), "−12.5");
  assert.equal(formatSig(0), "0");
  assert.equal(formatSig(Number.NaN), "—");
});

test("engineering prefixes in steps of a thousand", () => {
  assert.equal(formatSI(0.0083333, "m"), "8.33 mm");
  assert.equal(formatSI(210e9, "Pa"), "210 GPa");
  assert.equal(formatSI(125e6, "Pa"), "125 MPa");
  assert.equal(formatSI(6.6667e-5, "m⁴"), "66.7 µm⁴");
  assert.equal(formatSI(12_500, "N·m"), "12.5 kN·m");
  assert.equal(formatSI(0.9996, "m", 3), "1 m", "rounding up crosses into the next prefix cleanly");
  assert.equal(formatSI(999.6, "N", 3), "1 kN");
  assert.equal(formatSI(-9000, "N·m"), "−9 kN·m");
  assert.equal(formatSI(0, "m"), "0 m");
});
