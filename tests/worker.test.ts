import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import worker from "../src/worker.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function htmlAsset(pathname: string, body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function env(assets: (request: Request) => Promise<Response>): Env {
  return {
    ASSETS: {
      fetch: (input: RequestInfo | URL) => {
        const request = input instanceof Request ? input : new Request(input);
        return assets(request);
      },
    },
    ZDH_INGEST_URL: "https://hub.staging.invalid/api/events/ingest",
    ZDH_TRACKING_ENABLED: "true",
    ZDH_ENVIRONMENT: "preview",
    ZDH_CONSENT_COOKIE_NAME: "zaraz-consent",
    ZDH_CONSENT_PURPOSE_ANALYTICS: "vxcT",
    ZDH_CONSENT_PURPOSE_ADVERTISING: "advertising",
    ZDH_CONSENT_PURPOSE_USER_DATA: "user_data",
  } as unknown as Env;
}

function ctx(): ExecutionContext {
  return { waitUntil() {} } as unknown as ExecutionContext;
}

describe("staging worker", () => {
  it("serves GET /contato via pretty URL rewrite and noindexes HTML", async () => {
    const seen: string[] = [];
    const response = await worker.fetch(
      new Request("https://zenitegeo-zdh-pilot.example.workers.dev/contato", {
        headers: { accept: "text/html", "sec-fetch-dest": "document" },
      }),
      env(async (request) => {
        seen.push(new URL(request.url).pathname);
        if (new URL(request.url).pathname === "/contato.html") {
          return htmlAsset("/contato.html", readFileSync(join(root, "contato.html"), "utf8"));
        }
        return new Response("missing", { status: 404 });
      }),
      ctx(),
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
    assert.deepEqual(seen, ["/contato.html"]);
    const body = await response.text();
    assert.match(body, /zdh-tracking\.js/);
    assert.match(body, /canonical" href="https:\/\/zenitegeo\.com\.br\/contato\.html"/);
  });

  it("rejects browser page_view on /_zdh/e and does not require a real secret", async () => {
    const response = await worker.fetch(
      new Request("https://zenitegeo-zdh-pilot.example.workers.dev/_zdh/e", {
        method: "POST",
        headers: {
          origin: "https://zenitegeo-zdh-pilot.example.workers.dev",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          event_name: "page_view",
          event_id: "12345678-1234-1234-1234-1234567890ab",
        }),
      }),
      env(async () => new Response("no", { status: 404 })),
      ctx(),
    );

    assert.equal(response.status, 400);
    const payload = (await response.json()) as { ok: boolean; error?: string };
    assert.equal(payload.ok, false);
    assert.equal(payload.error, "invalid_event");
  });

  it("accepts POST /_zdh/consent-granted without creating Hub traffic when analytics is unknown", async () => {
    const scheduled: Promise<unknown>[] = [];
    const response = await worker.fetch(
      new Request("https://zenitegeo-zdh-pilot.example.workers.dev/_zdh/consent-granted", {
        method: "POST",
        headers: {
          origin: "https://zenitegeo-zdh-pilot.example.workers.dev",
          host: "zenitegeo-zdh-pilot.example.workers.dev",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          current_page: "https://zenitegeo-zdh-pilot.example.workers.dev/",
          event_id: "12345678-1234-1234-1234-1234567890ab",
        }),
      }),
      env(async () => new Response("no", { status: 404 })),
      { waitUntil(work: Promise<unknown>) { scheduled.push(work); } } as unknown as ExecutionContext,
    );
    assert.equal(response.status, 202);
    assert.equal(scheduled.length, 0);
    const payload = (await response.json()) as { ok: boolean };
    assert.equal(payload.ok, true);
  });

  it("rejects consent-granted current_page on another domain", async () => {
    const response = await worker.fetch(
      new Request("https://zenitegeo-zdh-pilot.example.workers.dev/_zdh/consent-granted", {
        method: "POST",
        headers: {
          origin: "https://zenitegeo-zdh-pilot.example.workers.dev",
          host: "zenitegeo-zdh-pilot.example.workers.dev",
          "content-type": "application/json",
          cookie: `zaraz-consent=${encodeURIComponent(JSON.stringify({ vxcT: true }))}`,
        },
        body: JSON.stringify({
          current_page: "https://evil.example/",
          event_id: "12345678-1234-1234-1234-1234567890ab",
        }),
      }),
      env(async () => new Response("no", { status: 404 })),
      ctx(),
    );
    assert.equal(response.status, 400);
  });

  it("accepts a canonical whatsapp_click without a real Hub key", async () => {
    const response = await worker.fetch(
      new Request("https://zenitegeo-zdh-pilot.example.workers.dev/_zdh/e", {
        method: "POST",
        headers: {
          origin: "https://zenitegeo-zdh-pilot.example.workers.dev",
          host: "zenitegeo-zdh-pilot.example.workers.dev",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          event_name: "whatsapp_click",
          event_id: "12345678-1234-1234-1234-1234567890ab",
          current_page: "https://zenitegeo-zdh-pilot.example.workers.dev/",
        }),
      }),
      env(async () => new Response("no", { status: 404 })),
      ctx(),
    );

    assert.equal(response.status, 202);
    const payload = (await response.json()) as { ok: boolean };
    assert.equal(payload.ok, true);
  });

  it("returns HTTP 404 with 404.html and noindex for unknown routes", async () => {
    const notFoundBody = readFileSync(join(root, "404.html"), "utf8");
    const response = await worker.fetch(
      new Request("https://zenitegeo-zdh-pilot.example.workers.dev/this-page-does-not-exist-zdh", {
        headers: { accept: "text/html", "sec-fetch-dest": "document" },
      }),
      env(async (request) => {
        const path = new URL(request.url).pathname;
        if (path === "/this-page-does-not-exist-zdh.html" || path === "/this-page-does-not-exist-zdh") {
          return htmlAsset("/404.html", notFoundBody, 404);
        }
        return new Response("missing", { status: 404 });
      }),
      ctx(),
    );

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
    assert.match(await response.text(), /Página não encontrada/);
  });

  it("does not schedule page_view for CSS or JS assets", async () => {
    const scheduled: Promise<unknown>[] = [];
    const assetCtx = {
      waitUntil(work: Promise<unknown>) {
        scheduled.push(work);
      },
    } as unknown as ExecutionContext;

    for (const path of ["/assets/css/style.css", "/assets/js/main.js", "/images/favicon-32.png"]) {
      scheduled.length = 0;
      const response = await worker.fetch(
        new Request(`https://zenitegeo-zdh-pilot.example.workers.dev${path}`, {
          headers: {
            accept: path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "*/*" : "image/png",
            "sec-fetch-dest": path.endsWith(".css") ? "style" : path.endsWith(".js") ? "script" : "image",
          },
        }),
        env(async () => new Response("ok", { status: 200, headers: { "content-type": "text/css" } })),
        assetCtx,
      );
      assert.equal(response.status, 200, path);
      assert.equal(scheduled.length, 0, path);
    }
  });
});
