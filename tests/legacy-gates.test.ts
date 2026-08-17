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

  it("hides #lgpd-banner with authoritative CSS only when html[data-zdh-pilot] is set", () => {
    const css = readFileSync(join(root, "assets/css/style.css"), "utf8");
    const entry = readFileSync(join(root, "src/browser-entry.ts"), "utf8");
    const main = readFileSync(join(root, "assets/js/main.js"), "utf8");
    const runtime = readFileSync(join(root, "src/pilot-runtime.ts"), "utf8");

    const pilotRule =
      /html\[data-zdh-pilot\]\s+#lgpd-banner\s*\{[^}]*display:\s*none\s*!important;[^}]*\}/s;
    assert.match(css, pilotRule);
    assert.match(css, /html\[data-zdh-pilot\]\s+#lgpd-banner/);
    assert.match(entry, /setAttribute\("data-zdh-pilot", "1"\)/);
    assert.match(runtime, /lab\.zenitedatahub\.com/);
    assert.match(runtime, /workers\.dev/);
    assert.match(runtime, /localhost/);

    const globalHide = css.replace(/@media print\s*\{[\s\S]*?\}/g, "");
    assert.doesNotMatch(globalHide, /(?:^|\n)\s*#lgpd-banner\s*\{[^}]*display:\s*none/s);
    assert.doesNotMatch(globalHide, /(?:^|\n)\s*\.lgpd-banner\s*\{[^}]*display:\s*none/s);
    assert.match(css, /\.lgpd-banner\.show\s*\{\s*transform:\s*translateY\(0\)/);
    assert.match(main, /if \(!localStorage\.getItem\('zenite_lgpd'\)\)/);
    assert.match(css, /visibility:\s*hidden\s*!important/);
    assert.doesNotMatch(entry, /zenitegeo\.com\.br/);
  });

  it("does not remove production Pixel code; it is skipped at runtime", () => {
    const pixel = readFileSync(join(root, "assets/js/meta-pixel-init.js"), "utf8");
    assert.match(pixel, /fbq\('init'/);
    assert.match(pixel, /fbq\('track', 'PageView'\)/);
  });
});
