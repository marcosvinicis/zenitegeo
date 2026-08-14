import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tarball = join(root, "vendor/zenite-edge-tracking-0.1.0.tgz");
const sourceFile = join(root, "vendor/SOURCE.txt");

function expectedSha() {
  if (!existsSync(sourceFile)) {
    throw new Error("missing vendor/SOURCE.txt (provenance + expected SHA-256)");
  }
  const text = readFileSync(sourceFile, "utf8");
  const match = text.match(/^SHA-256:\s*([a-f0-9]{64})\s*$/m);
  if (!match) {
    throw new Error("vendor/SOURCE.txt has no SHA-256: <64 hex> line");
  }
  return match[1];
}

function fail(message) {
  console.error(message);
  console.error("");
  console.error("This tarball is gitignored on purpose (Data Hub foundation).");
  console.error("Produce it from a local zenite-data-hub checkout:");
  console.error("");
  console.error("  bash scripts/vendor-edge-tracking.sh /path/to/zenite-data-hub");
  console.error("");
  console.error("Do not hardcode an absolute machine path.");
  console.error("Do not publish this package to npm.");
  process.exit(1);
}

const expected = expectedSha();

if (!existsSync(tarball)) {
  fail(
    `missing vendor/zenite-edge-tracking-0.1.0.tgz\nExpected SHA-256: ${expected}`,
  );
}

const actual = createHash("sha256").update(readFileSync(tarball)).digest("hex");
if (actual !== expected) {
  fail(
    `vendor/zenite-edge-tracking-0.1.0.tgz SHA-256 mismatch\nexpected ${expected}\nactual   ${actual}`,
  );
}

console.log(`vendor tarball ok sha256 ${actual}`);
