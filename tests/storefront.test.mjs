import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const html = await readFile(new URL("../storefront.html", import.meta.url), "utf8");
const menBlock = html.match(/men:\[([\s\S]*?)\],\s*women:/)?.[1] ?? "";
const womenBlock = html.match(/women:\[([\s\S]*?)\]\s*\};/)?.[1] ?? "";

test("catalog contains balanced expanded edits", () => {
  assert.equal((menBlock.match(/\{name:/g) ?? []).length, 26);
  assert.equal((womenBlock.match(/\{name:/g) ?? []).length, 31);
  assert.match(menBlock, /Expedition Barrel \/ MB06/);
  assert.match(womenBlock, /Halo Foldover Flare \/ WG09/);
});

test("both edits expose their intended categories", () => {
  assert.match(html, /men:\['All','Outerwear','Tops','Bottoms','Gym Wear','Accessories'\]/);
  assert.match(html, /women:\['All','Outerwear','Tops','Bottoms','Gym Wear','Layering','Accessories'\]/);
});

test("product cards expose a single full-width add-to-bag action", () => {
  assert.match(html, /class="card-actions"><button type="button" class="quick-add"/);
  assert.doesNotMatch(html, /view-360|data-view360|spinDialog|spinCanvas|createGarmentViewer/);
});

test("every catalog image exists in the public directory", async () => {
  const root = dirname(fileURLToPath(new URL("../storefront.html", import.meta.url)));
  const paths = [...html.matchAll(/img:'assets\/([^']+)'/g)].map((match) => match[1]);
  assert.equal(paths.length, 57);
  await Promise.all(paths.map((asset) => access(join(root, "public", "assets", asset))));
});

test("catalog contains no 360-view product metadata", () => {
  assert.doesNotMatch(html, /spin:\[/);
});
