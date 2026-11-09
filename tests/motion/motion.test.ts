import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { stepped, TWOS_FPS } from "../../src/lib/motion.ts";

const linear = (p: number) => p;

describe("stepped (on twos)", () => {
  test("holds each pose for a twelfth of a second", () => {
    const e = stepped(linear, 1); // 12 poses
    assert.equal(e(0.01), 0);
    assert.equal(e(1 / 12 - 1e-9), 0);
    assert.equal(e(1 / 12), 1 / 12);
    assert.equal(e(0.5), 6 / 12);
    assert.equal(e(0.99), 11 / 12);
  });

  test("always starts and lands exactly on the curve's ends", () => {
    const quad = (p: number) => p * p;
    const e = stepped(quad, 0.37);
    assert.equal(e(0), 0);
    assert.equal(e(1), 1);
    assert.equal(e(-0.2), 0);
    assert.equal(e(1.4), 1);
  });

  test("a tween has as many distinct poses as twelfths of a second it lasts", () => {
    const e = stepped(linear, 0.5);
    const poses = new Set<number>();
    for (let i = 0; i <= 1000; i++) poses.add(e(i / 1000));
    assert.equal(poses.size, 0.5 * TWOS_FPS + 1); // six held poses, plus the final landing
  });

  test("very short tweens still move in at least one step", () => {
    const e = stepped(linear, 0.01);
    assert.equal(e(0.5), 0);
    assert.equal(e(1), 1);
  });

  test("follows the shape of the easing curve at each pose", () => {
    const out = (p: number) => 1 - (1 - p) ** 3;
    const e = stepped(out, 1);
    assert.equal(e(0.3), out(3 / 12));
  });
});
