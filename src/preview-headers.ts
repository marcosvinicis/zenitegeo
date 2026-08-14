const ROBOTS = "noindex, nofollow, noarchive";

function isHtmlResponse(response: Response): boolean {
  const type = response.headers.get("content-type") ?? "";
  return type.toLowerCase().includes("text/html");
}

/**
 * Staging/preview must not enter the production index.
 * Does not rewrite canonical, sitemap, or JSON-LD in the HTML.
 */
export function applyPreviewSeoHeaders(response: Response): Response {
  if (!isHtmlResponse(response)) return response;
  if (response.headers.get("x-robots-tag")) return response;

  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", ROBOTS);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
