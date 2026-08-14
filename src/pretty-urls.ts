const PROXY_PREFIX = "/_zdh/";

const HAS_EXTENSION = /\.[a-z0-9]+$/i;

export type AssetFetcher = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

/**
 * Pages pretty URLs: /contato.html → 308 /contato.
 * Workers static assets do not do this automatically.
 */
export function htmlExtensionRedirect(request: Request): Response | null {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") return null;

  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return null;
  }

  const path = url.pathname;
  if (path.startsWith(PROXY_PREFIX)) return null;
  if (!path.endsWith(".html")) return null;

  if (path === "/index.html") {
    url.pathname = "/";
  } else if (path.endsWith("/index.html")) {
    url.pathname = path.slice(0, -"index.html".length);
  } else {
    url.pathname = path.slice(0, -".html".length);
  }

  return new Response(null, {
    status: 308,
    headers: { Location: `${url.pathname}${url.search}` },
  });
}

export function shouldTryHtmlExtension(pathname: string): boolean {
  if (!pathname || pathname === "/") return false;
  if (pathname.endsWith("/")) return false;
  if (pathname.startsWith(PROXY_PREFIX)) return false;
  if (HAS_EXTENSION.test(pathname)) return false;
  return true;
}

export function rewritePrettyAssetRequest(request: Request): Request {
  const url = new URL(request.url);
  const path = url.pathname;
  const next = new URL(url);

  if (path === "/" || path === "") {
    next.pathname = "/index.html";
    return new Request(next, request);
  }

  if (path.endsWith("/") && !path.startsWith(PROXY_PREFIX)) {
    next.pathname = `${path}index.html`;
    return new Request(next, request);
  }

  if (!shouldTryHtmlExtension(path)) return request;
  next.pathname = `${path}.html`;
  return new Request(next, request);
}

/**
 * Serve extensionless HTML the way Cloudflare Pages pretty URLs do.
 * Fallback to the original request so 404-page handling still runs.
 */
export function wrapAssetsForPrettyUrls(assets: AssetFetcher): AssetFetcher {
  return {
    async fetch(input, init) {
      const request = input instanceof Request ? input : new Request(input, init);
      const rewritten = rewritePrettyAssetRequest(request);
      if (rewritten.url === request.url) {
        return assets.fetch(request);
      }
      const response = await assets.fetch(rewritten);
      if (response.status === 404) {
        return assets.fetch(request);
      }
      return response;
    },
  };
}
