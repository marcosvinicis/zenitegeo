import { createEdgeTrackingHandler } from "@zenite/edge-tracking";
import type { EdgeTrackingEnv } from "@zenite/edge-tracking";
import { applyPreviewSeoHeaders } from "./preview-headers";
import { htmlExtensionRedirect, wrapAssetsForPrettyUrls } from "./pretty-urls";

const edgeFetch = createEdgeTrackingHandler();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const redirect = htmlExtensionRedirect(request);
    if (redirect) {
      return applyPreviewSeoHeaders(redirect);
    }

    const wrapped = {
      ...env,
      ASSETS: wrapAssetsForPrettyUrls(env.ASSETS),
    } as EdgeTrackingEnv;

    const response = await edgeFetch(request, wrapped, ctx);
    return applyPreviewSeoHeaders(response);
  },
} satisfies ExportedHandler<Env>;
