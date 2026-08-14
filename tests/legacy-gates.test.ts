import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("legacy tracking staging gates", () => {
  it("gates Meta Pixel, Lead, banner, and legacy zaraz events on workers.dev", () => {
    const pixel = readFileSync(join(root, "assets/js/meta-pixel-init.js"), "utf8");
    const main = readFileSync(join(root, "assets/js/main.js"), "utf8");
    const obrigado = readFileSync(join(root, "assets/js/obrigado.js"), "utf8");
    const landing = readFileSync(join(root, "assets/js/landing-analise-presenca.js"), "utf8");

    for (const source of [pixel, main, obrigado, landing]) {
      assert.match(source, /\\\.workers\\\.dev\$/);
      assert.match(source, /lab\.zenitedatahub\.com/);
    }

    assert.match(main, /function isZdhPilotRuntime/);
    assert.match(main, /if \(isZdhPilotRuntime\(\)\) return;/);
    assert.match(main, /lgpdBanner\.hidden = true/);
    assert.match(pixel, /connect\.facebook\.net/);
  });

  it("does not remove production Pixel code; it is skipped at runtime", () => {
    const pixel = readFileSync(join(root, "assets/js/meta-pixel-init.js"), "utf8");
    assert.match(pixel, /fbq\('init'/);
    assert.match(pixel, /fbq\('track', 'PageView'\)/);
  });
});
