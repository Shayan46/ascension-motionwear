import test from "node:test";
import assert from "node:assert/strict";
import { angleLabel, frameDegrees, frameFromDrag, wrapFrame } from "../public/scripts/spin-core.js";

test("wrapFrame wraps in both directions", () => {
  assert.equal(wrapFrame(24, 24), 0);
  assert.equal(wrapFrame(-1, 24), 23);
  assert.equal(wrapFrame(5, 24), 5);
});

test("frameFromDrag converts horizontal motion to wrapped frames", () => {
  assert.equal(frameFromDrag(0, 28, 24, 14), 2);
  assert.equal(frameFromDrag(0, -14, 24, 14), 23);
});

test("frameDegrees supports both studio angles and smooth fallback frames", () => {
  assert.equal(frameDegrees(1, 4), 90);
  assert.equal(frameDegrees(2, 4), 180);
  assert.equal(frameDegrees(23, 24), 345);
});

test("angleLabel exposes useful product orientations", () => {
  assert.equal(angleLabel(0), "Front");
  assert.equal(angleLabel(90), "Right profile");
  assert.equal(angleLabel(180), "Back");
  assert.equal(angleLabel(270), "Left profile");
  assert.equal(angleLabel(345), "Front");
});
