import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../public/scripts/product-3d.js", import.meta.url), "utf8");

test("3D viewer uses WebGL geometry and lighting instead of mirroring the image", () => {
  assert.match(source, /canvas\.getContext\("webgl"/);
  assert.match(source, /createMesh\(gl/);
  assert.match(source, /uDepth/);
  assert.match(source, /lightDirection/);
  assert.match(source, /if \(normal\.z > 0\.0\)/);
  assert.doesNotMatch(source, /scaleX\s*\(\s*-1/);
});

test("multi-angle products select real studio textures by orbit quadrant", () => {
  assert.match(source, /Math\.round\(degrees \/ 90\)/);
  assert.match(source, /sources = Array\.isArray\(product\.spin\)/);
});
