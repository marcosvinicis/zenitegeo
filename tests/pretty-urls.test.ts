import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  htmlExtensionRedirect,
  rewritePrettyAssetRequest,
  shouldTryHtmlExtension,
} from "../src/pretty-urls.ts";

describe("pretty URLs (Pages parity)", () => {
  it("redirects .html documents to the extensionless path", () => {
    const res = htmlExtensionRedirect(
      new Request("https://pilot.example/contato.html?utm_source=test&utm_medium=test"),
    );
    assert.ok(res);
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/contato?utm_source=test&utm_medium=test");
  });

  it("redirects /index.html to /", () => {
    const res = htmlExtensionRedirect(
      new Request("https://pilot.example/index.html?gclid=test"),
    );
    assert.ok(res);
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/?gclid=test");
  });

  it("does not redirect POST or /_zdh/e", () => {
    assert.equal(
      htmlExtensionRedirect(new Request("https://pilot.example/contato.html", { method: "POST" })),
      null,
    );
    assert.equal(
      htmlExtensionRedirect(new Request("https://pilot.example/_zdh/e.html")),
      null,
    );
  });

  it("rewrites extensionless HTML paths to .html for ASSETS", () => {
    assert.equal(shouldTryHtmlExtension("/contato"), true);
    assert.equal(shouldTryHtmlExtension("/analise-presenca-digital"), true);
    assert.equal(shouldTryHtmlExtension("/blog/o-que-e-geo-marketing-digital"), true);
    assert.equal(shouldTryHtmlExtension("/"), false);
    assert.equal(shouldTryHtmlExtension("/blog/"), false);
    assert.equal(shouldTryHtmlExtension("/assets/js/main.js"), false);
    assert.equal(shouldTryHtmlExtension("/_zdh/e"), false);

    const rewritten = rewritePrettyAssetRequest(new Request("https://pilot.example/contato"));
    assert.equal(new URL(rewritten.url).pathname, "/contato.html");

    const home = rewritePrettyAssetRequest(new Request("https://pilot.example/"));
    assert.equal(new URL(home.url).pathname, "/index.html");

    const blog = rewritePrettyAssetRequest(new Request("https://pilot.example/blog/"));
    assert.equal(new URL(blog.url).pathname, "/blog/index.html");
  });

  it("redirects directory index.html to the trailing-slash path", () => {
    const res = htmlExtensionRedirect(new Request("https://pilot.example/blog/index.html"));
    assert.ok(res);
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/blog/");
  });

  it("preserves the full query on landing .html redirects", () => {
    const res = htmlExtensionRedirect(
      new Request(
        "https://pilot.example/analise-presenca-digital.html?fbclid=test&utm_campaign=test",
      ),
    );
    assert.ok(res);
    assert.equal(res.status, 308);
    assert.equal(
      res.headers.get("Location"),
      "/analise-presenca-digital?fbclid=test&utm_campaign=test",
    );
  });
});
