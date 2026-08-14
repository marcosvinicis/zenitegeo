import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gzipSync } from "node:zlib";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = join(root, "assets/js/zdh-tracking.js");
const entry = readFileSync(join(root, "src/browser-entry.ts"), "utf8");

describe("browser tracking bundle", () => {
  it("exists and stays small without secrets or page_view emitters", () => {
    assert.equal(existsSync(bundlePath), true, "run npm run build:browser");
    const minified = readFileSync(bundlePath, "utf8");
    const gzip = gzipSync(Buffer.from(minified)).length;

    assert.equal(minified.includes("ZDH_SITE_KEY"), false);
    assert.equal(minified.includes("PUBLIC_"), false);
    assert.equal(entry.includes("ZDH_SITE_KEY"), false);
    assert.equal(minified.includes("createEdgeTrackingHandler"), false);
    assert.equal(minified.includes("zaraz_ingest"), false);
    assert.equal(minified.includes("googletagmanager"), false);
    assert.equal(minified.includes("gtag.js"), false);
    assert.equal(minified.includes("connect.facebook.net"), false);
    assert.equal(minified.includes("MutationObserver"), false);
    assert.equal(minified.includes("new Function"), false);
    assert.match(entry, /installDomTracking/);
    assert.match(entry, /isZdhPilotHostname/);
    const runtime = readFileSync(join(root, "src/pilot-runtime.ts"), "utf8");
    assert.match(runtime, /workers\.dev/);
    assert.match(runtime, /lab\.zenitedatahub\.com/);
    assert.match(minified, /lab\.zenitedatahub\.com/);
    assert.doesNotMatch(entry, /page_view/);
    assert.doesNotMatch(entry, /cdn-cgi\/zaraz/);
    assert.doesNotMatch(minified, /preventDefault/);

    assert.ok(minified.length < 20_000, `minified ${minified.length}`);
    assert.ok(gzip < 8_000, `gzip ${gzip}`);
  });
});
