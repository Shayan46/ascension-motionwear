import test from "node:test";
import assert from "node:assert/strict";
import { wrapFrame } from "../public/scripts/ui-core.js";

test("wrapFrame keeps keyboard navigation inside the available controls", () => {
  assert.equal(wrapFrame(2, 2), 0);
  assert.equal(wrapFrame(-1, 2), 1);
  assert.equal(wrapFrame(1, 2), 1);
});
