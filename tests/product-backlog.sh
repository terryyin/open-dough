#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

node --test \
  tests/support/product-backlog.test.mjs \
  tests/support/product-backlog-write-safety.test.mjs

echo 'PASS: scripted product backlog additions and write safety.'
