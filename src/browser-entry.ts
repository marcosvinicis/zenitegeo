import { installDomTracking } from "@zenite/edge-tracking/browser";

type PilotGlobals = {
  location?: { hostname?: string };
  document?: { documentElement?: { setAttribute(name: string, value: string): void } };
  __ZDH_PILOT__?: boolean;
};

function isZdhPilotRuntime(): boolean {
  try {
    const hostname = (globalThis as PilotGlobals).location?.hostname ?? "";
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".workers.dev")
    );
  } catch {
    return false;
  }
}

if (isZdhPilotRuntime()) {
  const globals = globalThis as PilotGlobals;
  globals.__ZDH_PILOT__ = true;
  try {
    globals.document?.documentElement?.setAttribute("data-zdh-pilot", "1");
  } catch {
    /* ignore */
  }
  installDomTracking();
}
