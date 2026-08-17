import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { resolveEdgeConsent } from "@zenite/edge-tracking";
import type { EdgeTrackingEnv } from "@zenite/edge-tracking";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const DENIED = {
  necessary: true,
  analytics: false,
  advertising: false,
  user_data: false,
} as const;

function labEnv(): EdgeTrackingEnv {
  return {
    ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
    ZDH_CONSENT_COOKIE_NAME: "zaraz-consent",
    ZDH_CONSENT_PURPOSE_ANALYTICS: "vxcT",
    ZDH_CONSENT_PURPOSE_ADVERTISING: "advertising",
    ZDH_CONSENT_PURPOSE_USER_DATA: "user_data",
  };
}

function zarazCookie(value: string): string {
  return `zaraz-consent=${encodeURIComponent(value)}`;
}

describe("pilot Zaraz consent mapping", () => {
  it("keeps wrangler vars on zaraz-consent + vxcT without advertising/user_data purposes", () => {
    const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");
    assert.match(wrangler, /"ZDH_CONSENT_COOKIE_NAME":\s*"zaraz-consent"/);
    assert.match(wrangler, /"ZDH_CONSENT_PURPOSE_ANALYTICS":\s*"vxcT"/);
    assert.match(wrangler, /"ZDH_CONSENT_PURPOSE_ADVERTISING":\s*"advertising"/);
    assert.match(wrangler, /"ZDH_CONSENT_PURPOSE_USER_DATA":\s*"user_data"/);
    assert.doesNotMatch(wrangler, /_zdh_consent/);
  });

  it("maps {\"vxcT\":true} to analytics=true with advertising and user_data false", () => {
    const resolved = resolveEdgeConsent(zarazCookie('{"vxcT":true}'), labEnv());
    assert.equal(resolved.known, true);
    assert.deepEqual(resolved.consent, {
      necessary: true,
      analytics: true,
      advertising: false,
      user_data: false,
    });
    assert.equal(resolved.state, "partial");
  });

  it("maps {\"vxcT\":false} to analytics=false", () => {
    const resolved = resolveEdgeConsent(zarazCookie('{"vxcT":false}'), labEnv());
    assert.equal(resolved.known, true);
    assert.deepEqual(resolved.consent, DENIED);
    assert.equal(resolved.state, "denied");
  });

  it("treats empty JSON object as unknown/fail-closed", () => {
    const resolved = resolveEdgeConsent(zarazCookie("{}"), labEnv());
    assert.equal(resolved.known, false);
    assert.deepEqual(resolved.consent, DENIED);
    assert.equal(resolved.state, "unknown");
  });

  it("treats invalid JSON as unknown/fail-closed", () => {
    const resolved = resolveEdgeConsent(zarazCookie("{not-json"), labEnv());
    assert.equal(resolved.known, false);
    assert.deepEqual(resolved.consent, DENIED);
    assert.equal(resolved.state, "unknown");
  });

  it("fail-closes when zaraz-consent is absent", () => {
    const resolved = resolveEdgeConsent(null, labEnv());
    assert.equal(resolved.known, false);
    assert.deepEqual(resolved.consent, DENIED);
    assert.equal(resolved.state, "unknown");
  });
});
