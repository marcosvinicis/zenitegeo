import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("pilot wrangler config", () => {
  it("is workers.dev-only and does not declare production routes or secrets", () => {
    const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");
    const gitignore = readFileSync(join(root, ".gitignore"), "utf8");

    assert.match(wrangler, /"workers_dev":\s*true/);
    assert.match(wrangler, /"preview_urls":\s*true/);
    assert.match(wrangler, /"ZDH_ENVIRONMENT":\s*"preview"/);
    assert.match(wrangler, /"directory":\s*"\.\/dist-site"/);
    assert.match(wrangler, /"not_found_handling":\s*"404-page"/);
    assert.doesNotMatch(wrangler, /^\s*"routes"\s*:/m);
    assert.doesNotMatch(wrangler, /"ZDH_SITE_KEY"/);
    assert.doesNotMatch(wrangler, /PUBLIC_/);
    assert.match(gitignore, /^\.dev\.vars$/m);
    assert.match(gitignore, /^dist-site\/$/m);
    assert.match(gitignore, /^vendor\/\*\.tgz$/m);
  });
});
