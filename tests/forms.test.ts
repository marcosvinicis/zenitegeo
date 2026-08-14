import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function html(name: string): string {
  return readFileSync(join(root, name), "utf8");
}

describe("form 1.9F-G markers", () => {
  it("opts contact and analise forms in without marking textarea or hidden fields", () => {
    const contato = html("contato.html");
    assert.match(contato, /id="contact-form"[^>]*data-zdh-form="contact-form"/);
    assert.match(contato, /data-zdh-identity="email"/);
    assert.match(contato, /data-zdh-identity="phone"/);
    assert.doesNotMatch(contato, /<textarea[^>]*data-zdh-identity/);
    assert.doesNotMatch(contato, /type="hidden"[^>]*data-zdh-identity/);
    assert.doesNotMatch(contato, /name="botcheck"[^>]*data-zdh-/);

    const analise = html("analise-presenca-digital.html");
    assert.match(analise, /id="form-analise"[^>]*data-zdh-form="analise-presenca"/);
    assert.match(analise, /data-zdh-identity="email"/);
    assert.match(analise, /data-zdh-identity="phone"/);
    assert.doesNotMatch(analise, /name="utm_source"[^>]*data-zdh-/);
    assert.doesNotMatch(analise, /name="fbclid"[^>]*data-zdh-/);
  });

  it("keeps Web3Forms submit behavior", () => {
    for (const file of ["contato.html", "analise-presenca-digital.html"]) {
      const source = html(file);
      assert.match(source, /action="https:\/\/api\.web3forms\.com\/submit"/);
      assert.doesNotMatch(source, /preventDefault/);
    }
  });
});
