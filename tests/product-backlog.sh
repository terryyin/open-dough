#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

node --test \
  tests/support/product-backlog.test.mjs \
  tests/support/product-backlog-write-safety.test.mjs \
  tests/support/product-backlog-place.test.mjs \
  tests/support/product-backlog-take.test.mjs \
  tests/support/product-backlog-complete.test.mjs \
  tests/support/product-backlog-adopt.test.mjs \
  tests/support/product-backlog-adopt-refusals.test.mjs

echo 'PASS: scripted product backlog additions, placements, claims, completions, identity adoption, and write safety.'
