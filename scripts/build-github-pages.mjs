import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("_site");
const liveAccountUrl = "https://ascension-motionwear.koundinya-shayan.chatgpt.site/account";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

let html = await readFile(resolve("storefront.html"), "utf8");
html = html
  .replace("<head>", '<head>\n  <base href="/ascension-motionwear/">')
  .replaceAll("from '/scripts/", "from './scripts/")
  .replaceAll('href="/account"', `href="${liveAccountUrl}"`);

await writeFile(resolve(output, "index.html"), html, "utf8");
await writeFile(resolve(output, "404.html"), html, "utf8");
await writeFile(resolve(output, ".nojekyll"), "", "utf8");
await cp(resolve("public/assets"), resolve(output, "assets"), { recursive: true });
await cp(resolve("public/scripts"), resolve(output, "scripts"), { recursive: true });
await cp(resolve("public/favicon.svg"), resolve(output, "favicon.svg"));

console.log(`GitHub Pages storefront built at ${output}`);
