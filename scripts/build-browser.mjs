import * as esbuild from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["src/browser-entry.ts"],
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  outfile: "assets/js/zdh-tracking.js",
  legalComments: "none",
  logLevel: "info",
});
