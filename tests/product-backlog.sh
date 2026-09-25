#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
failures_only_reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs"
cd -- "${source_dir}"

node --test --test-reporter="${failures_only_reporter}" \
  tests/support/product-backlog.test.mjs \
  tests/support/product-backlog-write-safety.test.mjs \
  tests/support/product-backlog-place.test.mjs \
  tests/support/product-backlog-take.test.mjs \
  tests/support/product-backlog-complete.test.mjs \
  tests/support/product-backlog-complete-profile.test.mjs \
  tests/support/product-backlog-refresh.test.mjs \
  tests/support/product-backlog-refresh-refusals.test.mjs \
  tests/support/product-backlog-direction.test.mjs \
  tests/support/product-backlog-direction-refusals.test.mjs \
  tests/support/product-backlog-adopt.test.mjs \
  tests/support/product-backlog-adopt-refusals.test.mjs \
  tests/support/product-backlog-identity.test.mjs \
  tests/support/product-backlog-agent-profile.test.mjs \
  tests/support/product-backlog-add-identity.test.mjs \
  tests/support/product-backlog-home-reader.test.mjs \
  tests/support/product-backlog-plan-reader.test.mjs \
  tests/support/product-backlog-plan-completion.test.mjs \
  tests/support/product-backlog-story-purpose.test.mjs \
  tests/support/story-state.test.mjs \
  tests/support/story-state-refusals.test.mjs \
  tests/support/story-state-assessment.test.mjs \
  tests/support/story-state-assessment-refusals.test.mjs \
  tests/support/story-state-browser-import.test.mjs \
  tests/support/product-backlog-merge-items.test.mjs \
  tests/support/product-backlog-merge-items-refusals.test.mjs \
  tests/support/product-backlog-merge-order.test.mjs \
  tests/support/product-backlog-merge-order-refusals.test.mjs \
  tests/support/product-backlog-merge-direction.test.mjs \
  tests/support/product-backlog-merge-identity.test.mjs \
  tests/support/product-backlog-merge-report.test.mjs
