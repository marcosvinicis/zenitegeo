import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { isZdhPilotHostname } from "../src/pilot-runtime.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const LEGACY_GATES = [
  "assets/js/main.js",
  "assets/js/meta-pixel-init.js",
  "assets/js/obrigado.js",
  "assets/js/landing-analise-presenca.js",
];

describe("A0 pilot host gate", () => {
  it("treats lab, current workers.dev, and localhost as pilot runtime", () => {
    assert.equal(isZdhPilotHostname("lab.zenitedatahub.com"), true);
    assert.equal(
      isZdhPilotHostname("zenitegeo-zdh-pilot.webmarcosbar.workers.dev"),
      true,
    );
    assert.equal(isZdhPilotHostname("localhost"), true);
  });

  it("does not treat production zenitegeo hostnames as pilot runtime", () => {
    assert.equal(isZdhPilotHostname("zenitegeo.com.br"), false);
    assert.equal(isZdhPilotHostname("www.zenitegeo.com.br"), false);
  });

  it("keeps the lab hostname in the bundled entry and legacy gates", () => {
    const entry = readFileSync(join(root, "src/browser-entry.ts"), "utf8");
    const runtime = readFileSync(join(root, "src/pilot-runtime.ts"), "utf8");

    assert.match(entry, /isZdhPilotHostname/);
    assert.match(runtime, /lab\.zenitedatahub\.com/);
    assert.match(runtime, /workers\.dev/);

    for (const file of LEGACY_GATES) {
      const source = readFileSync(join(root, file), "utf8");
      assert.match(source, /lab\.zenitedatahub\.com/, file);
      assert.match(source, /\\\.workers\\\.dev\$/, file);
    }
  });
});
