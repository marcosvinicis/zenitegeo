import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyPreviewSeoHeaders } from "../src/preview-headers.ts";

describe("preview SEO headers", () => {
  it("adds X-Robots-Tag to HTML and leaves JSON alone", () => {
    const html = applyPreviewSeoHeaders(
      new Response("<html></html>", { headers: { "content-type": "text/html; charset=utf-8" } }),
    );
    assert.equal(html.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");

    const json = applyPreviewSeoHeaders(
      new Response(JSON.stringify({ ok: true }), {
        status: 202,
        headers: { "content-type": "application/json" },
      }),
    );
    assert.equal(json.headers.get("X-Robots-Tag"), null);
  });

  it("does not rewrite HTML bodies (canonical / schema stay production URLs)", async () => {
    const body = '<link rel="canonical" href="https://zenitegeo.com.br/">';
    const html = applyPreviewSeoHeaders(
      new Response(body, { headers: { "content-type": "text/html" } }),
    );
    assert.equal(await html.text(), body);
  });

  it("preserves HTTP 404 when adding noindex", () => {
    const html = applyPreviewSeoHeaders(
      new Response("<html>missing</html>", {
        status: 404,
        headers: { "content-type": "text/html" },
      }),
    );
    assert.equal(html.status, 404);
    assert.equal(html.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
  });
});
