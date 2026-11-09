import assert from "node:assert/strict";
import { test } from "node:test";

import { compactPath } from "../../src/lib/svg.ts";

test("compactPath rounds every number and leaves commands and integers alone", () => {
  assert.equal(compactPath("M46.996 -6.901L55.783 -8.192A130 130 0 0 1 129.951 3.577Z"), "M47 -6.9L55.8 -8.2A130 130 0 0 1 130 3.6Z");
  assert.equal(compactPath("M0.04 -0.04L1.25 2"), "M0 0L1.3 2");
  assert.equal(compactPath("M1.23456 2", 2), "M1.23 2");
});
