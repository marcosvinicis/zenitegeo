#!/usr/bin/env bash
# Repack @zenite/edge-tracking from a local data-hub checkout into vendor/.
# Usage: bash scripts/vendor-edge-tracking.sh /path/to/zenite-data-hub
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HUB="${1:-}"
if [[ -z "$HUB" || ! -d "$HUB/packages/edge-tracking" ]]; then
  echo "usage: $0 /path/to/zenite-data-hub" >&2
  exit 1
fi

SRC="$HUB/packages/edge-tracking"
if [[ ! -f "$SRC/dist/index.js" ]]; then
  echo "missing $SRC/dist/index.js — run npm run build in the package first" >&2
  exit 1
fi

STAGE="$(mktemp -d)"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

mkdir -p "$STAGE/package/src/astro"
cp "$SRC/package.json" "$STAGE/package/package.json"
cp "$SRC/README.md" "$STAGE/package/README.md"
cp "$SRC/src/astro/ZeniteTracking.astro" "$STAGE/package/src/astro/ZeniteTracking.astro"
cp -R "$SRC/dist" "$STAGE/package/dist"

mkdir -p "$ROOT/vendor"
(cd "$STAGE/package" && npm pack --pack-destination "$ROOT/vendor")

COMMIT="$(git -C "$HUB" rev-parse HEAD)"
MESSAGE="$(git -C "$HUB" log -1 --pretty=%s)"
SHA="$(shasum -a 256 "$ROOT/vendor/zenite-edge-tracking-0.1.0.tgz" | awk '{print $1}')"

cat > "$ROOT/vendor/SOURCE.txt" <<EOF
@zenite/edge-tracking 0.1.0 — Zênite Data Hub 1.9F-H

Source repository: zenitegeoia/zenite-data-hub
Commit: ${COMMIT}
Message: ${MESSAGE}
Artifact: vendor/zenite-edge-tracking-0.1.0.tgz (gitignored)
SHA-256: ${SHA}

Do not commit the tarball. It contains compiled Worker + browser dist,
source maps, README, package.json, and src/astro/ZeniteTracking.astro.
The foundation belongs to zenite-data-hub, not this HTML site repo.

CI / local / Cloudflare builds must produce the tarball first:

  bash scripts/vendor-edge-tracking.sh /path/to/zenite-data-hub

Never depend on a machine-absolute path. Never publish this package to npm.
npm run build fails if the file is missing or the SHA-256 does not match.
EOF

echo "wrote vendor/zenite-edge-tracking-0.1.0.tgz"
echo "sha256 ${SHA}"
echo "commit ${COMMIT}"
