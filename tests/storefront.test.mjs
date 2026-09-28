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

test("every rendered product receives the shared 360 trigger", () => {
  assert.match(html, /data-view360="\$\{p\.id\}"/);
  assert.match(html, /productsById\.get\(view\.dataset\.view360\)/);
  assert.match(html, /id="spinDialog"/);
  assert.match(html, /Interactive 360° preview/);
  assert.match(html, /is-multiview/);
});

test("every catalog image exists in the public directory", async () => {
  const root = dirname(fileURLToPath(new URL("../storefront.html", import.meta.url)));
  const paths = [...html.matchAll(/img:'assets\/([^']+)'/g)].map((match) => match[1]);
  assert.equal(paths.length, 57);
  await Promise.all(paths.map((asset) => access(join(root, "public", "assets", asset))));
});

test("studio-view products have four optimized viewpoints", async () => {
  const root = dirname(fileURLToPath(new URL("../storefront.html", import.meta.url)));
  const spinPaths = [...html.matchAll(/spin:\[([^\]]+)\]/g)]
    .flatMap((match) => [...match[1].matchAll(/'assets\/([^']+)'/g)].map((asset) => asset[1]));
  assert.equal(spinPaths.length, 16);
  await Promise.all(spinPaths.map((asset) => access(join(root, "public", "assets", asset))));
});
