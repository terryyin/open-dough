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
  tests/support/product-backlog-refresh.test.mjs \
  tests/support/product-backlog-refresh-refusals.test.mjs \
  tests/support/product-backlog-direction.test.mjs \
  tests/support/product-backlog-direction-refusals.test.mjs \
  tests/support/product-backlog-adopt.test.mjs \
  tests/support/product-backlog-adopt-refusals.test.mjs \
  tests/support/product-backlog-merge.test.mjs

echo 'PASS: scripted product backlog additions, placements, claims, completions, reference refreshes, direction updates, identity adoption, three-version reconciliation, and write safety.'
