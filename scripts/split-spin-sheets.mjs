import { mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import sharp from "sharp";

const [, , source, outputPrefix] = process.argv;

if (!source || !outputPrefix) {
  console.error("Usage: node scripts/split-spin-sheets.mjs <sheet.png> <output-prefix>");
  process.exit(64);
}

const input = resolve(source);
const outputDir = resolve("public/assets");
const metadata = await sharp(input).metadata();
const cellWidth = Math.floor((metadata.width ?? 0) / 2);
const cellHeight = Math.floor((metadata.height ?? 0) / 2);

if (!cellWidth || !cellHeight) {
  throw new Error(`Unable to read contact sheet dimensions for ${basename(input)}`);
}

await mkdir(outputDir, { recursive: true });

const views = [
  ["front", 0, 0],
  ["right", cellWidth, 0],
  ["back", 0, cellHeight],
  ["left", cellWidth, cellHeight],
];

await Promise.all(views.map(async ([view, left, top]) => {
  const destination = resolve(outputDir, `${outputPrefix}-${view}.webp`);
  await sharp(input)
    .extract({ left, top, width: cellWidth, height: cellHeight })
    .resize(900, 972, { fit: "cover", position: "centre" })
    .webp({ quality: 88, effort: 5 })
    .toFile(destination);
  console.log(destination);
}));
