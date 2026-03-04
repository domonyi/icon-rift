import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { locate } from "@iconify/json";
import { parseIconSet, iconToSVG, iconToHTML } from "@iconify/utils";

// Load collections list from @iconify/json
const collectionsPath = join(
  new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
  "node_modules",
  "@iconify",
  "json",
  "collections.json"
);
const collections = JSON.parse(readFileSync(collectionsPath, "utf8"));
const prefixes = Object.keys(collections);

const outputDir = join(
  new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
  "svg"
);

console.log(`Found ${prefixes.length} icon sets to extract`);
console.log(`Output directory: ${outputDir}\n`);

let totalIcons = 0;
let totalSets = 0;

for (const prefix of prefixes) {
  const setDir = join(outputDir, prefix);
  if (!existsSync(setDir)) {
    mkdirSync(setDir, { recursive: true });
  }

  let filePath;
  try {
    filePath = locate(prefix);
  } catch {
    console.log(`  [SKIP] ${prefix} - could not locate JSON file`);
    continue;
  }

  const data = JSON.parse(readFileSync(filePath, "utf8"));
  let iconCount = 0;

  parseIconSet(data, (name, iconData) => {
    if (!iconData) return;

    const renderData = iconToSVG(iconData);
    const svg = iconToHTML(renderData.body, renderData.attributes);

    writeFileSync(join(setDir, `${name}.svg`), svg, "utf8");
    iconCount++;
  });

  totalIcons += iconCount;
  totalSets++;
  console.log(
    `  [${totalSets}/${prefixes.length}] ${prefix}: ${iconCount} icons (${collections[prefix].name})`
  );
}

console.log(`\nDone! Extracted ${totalIcons} icons from ${totalSets} icon sets into ./svg/`);
