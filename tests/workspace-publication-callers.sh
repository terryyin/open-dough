#!/usr/bin/env bash
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
failures_only_reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs"
node --test --test-reporter="${failures_only_reporter}" --test-concurrency=1 \
  "${source_dir}/src/skills/dough-story-refinement/scripts/"*.test.mjs \
  "${source_dir}/src/skills/dough-bug-fixing/scripts/"*.test.mjs \
  "${source_dir}/src/skills/dough-manual-testing/scripts/"*.test.mjs
