import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("pilot wrangler config", () => {
  it("keeps workers.dev, the lab Custom Domain, and no production routes or secrets", () => {
    const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");
    const gitignore = readFileSync(join(root, ".gitignore"), "utf8");

    assert.match(wrangler, /"workers_dev":\s*true/);
    assert.match(wrangler, /"preview_urls":\s*true/);
    assert.match(wrangler, /"ZDH_ENVIRONMENT":\s*"preview"/);
    assert.match(wrangler, /"directory":\s*"\.\/dist-site"/);
    assert.match(wrangler, /"not_found_handling":\s*"404-page"/);
    assert.match(wrangler, /"pattern":\s*"lab\.zenitedatahub\.com"/);
    assert.match(wrangler, /"custom_domain":\s*true/);
    assert.doesNotMatch(wrangler, /"pattern":\s*"[^"]*zenitegeo\.com\.br/);
    assert.doesNotMatch(wrangler, /"pattern":\s*"[^"]*\/\*/);
    assert.match(wrangler, /"ZDH_CONSENT_COOKIE_NAME":\s*"zaraz-consent"/);
    assert.match(wrangler, /"ZDH_CONSENT_PURPOSE_ANALYTICS":\s*"vxcT"/);
    assert.doesNotMatch(wrangler, /ZDH_CONSENT_PURPOSE_ADVERTISING":\s*"vxcT"/);
    assert.doesNotMatch(wrangler, /ZDH_CONSENT_PURPOSE_USER_DATA":\s*"vxcT"/);
    assert.doesNotMatch(wrangler, /_zdh_consent/);
    assert.doesNotMatch(wrangler, /"ZDH_SITE_KEY"/);
    assert.doesNotMatch(wrangler, /PUBLIC_/);
    assert.match(gitignore, /^\.dev\.vars$/m);
    assert.match(gitignore, /^dist-site\/$/m);
    assert.match(gitignore, /^vendor\/\*\.tgz$/m);
  });
});
