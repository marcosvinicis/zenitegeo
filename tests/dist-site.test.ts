import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist-site");
const forbidden = [
  "package.json",
  "package-lock.json",
  "wrangler.jsonc",
  "worker-configuration.d.ts",
  ".dev.vars",
  ".dev.vars.example",
  "src",
  "tests",
  "scripts",
  "docs",
  "vendor",
  "node_modules",
  ".git",
  "templates",
  "projects",
  "footer.html",
  "client.json",
];

describe("public asset output", () => {
  it("dist-site exists after build and omits tooling paths", () => {
    assert.equal(existsSync(dist), true, "run npm run build");
    assert.equal(existsSync(join(dist, "index.html")), true);
    assert.equal(existsSync(join(dist, "404.html")), true);
    assert.equal(existsSync(join(dist, "_headers")), true);
    assert.equal(existsSync(join(dist, "_redirects")), true);
    assert.equal(existsSync(join(dist, "assets/js/zdh-tracking.js")), true);

    const script = readFileSync(join(root, "scripts/build-site.mjs"), "utf8");
    assert.match(script, /FORBIDDEN_PUBLIC_PATHS/);
    assert.match(script, /SITE_DIST = "dist-site"/);

    for (const path of forbidden) {
      assert.equal(existsSync(join(dist, path)), false, path);
    }
  });
});
