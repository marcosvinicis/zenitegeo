import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PILOT_PAGES = new Set(["index.html", "contato.html", "analise-presenca-digital.html"]);

function productionHtmlFiles(): string[] {
  const skip = new Set([
    "templates",
    "projects",
    "_preview",
    "_briefing",
    "_concorrentes",
    "_copy",
    "_design",
    "_keywords",
    "node_modules",
    "vendor",
    "src",
    "dist-site",
    "docs",
    "tests",
    "scripts",
  ]);
  const files: string[] = [];
  function walk(dir: string, rel = "") {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const nextRel = rel ? `${rel}/${entry.name}` : entry.name;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full, nextRel);
      else if (entry.name.endsWith(".html")) files.push(nextRel);
    }
  }
  walk(root);
  return files;
}

describe("pilot page scope", () => {
  const files = productionHtmlFiles();

  it("loads zdh-tracking.js only on the three pilot pages", () => {
    const withTracking = files.filter((file) =>
      readFileSync(join(root, file), "utf8").includes("/assets/js/zdh-tracking.js"),
    );
    assert.deepEqual(withTracking.sort(), [...PILOT_PAGES].sort());
  });

  it("does not introduce a second DOM tracker on pilot pages", () => {
    for (const file of PILOT_PAGES) {
      const html = readFileSync(join(root, file), "utf8");
      const matches = html.match(/zdh-tracking\.js/g) ?? [];
      assert.equal(matches.length, 1, file);
      assert.equal(html.includes("installDomTracking"), false);
      assert.equal(html.includes("dataLayer.push"), false);
    }
  });

  it("keeps WhatsApp as navigable wa.me links", () => {
    for (const file of PILOT_PAGES) {
      const html = readFileSync(join(root, file), "utf8");
      assert.match(html, /href="https:\/\/wa\.me\//);
      assert.doesNotMatch(html, /href="javascript:/);
    }
  });
});
