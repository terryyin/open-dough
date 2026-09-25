#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
failures_only_reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs"
cd -- "${source_dir}"

# With no suite named, `scripts/test.sh` discovers and runs this file like
# every other `tests/*.sh` aggregator, so the default runs everything this
# file currently owns. A named suite (`merge`, `rebase-conflict`,
# `rebase-clean`, `rebase-onto`, `cherry-pick`, and later suites as later slices add them) is
# this file's own proof entry point for one Git journey at a time.
suite="${1:-all}"

run_merge() {
  node --test --test-reporter="${failures_only_reporter}" \
    tests/support/product-backlog-git-merge.test.mjs \
    tests/support/product-backlog-git-merge-conflict.test.mjs
}

run_rebase_conflict() {
  node --test --test-reporter="${failures_only_reporter}" \
    tests/support/product-backlog-git-rebase.test.mjs \
    tests/support/product-backlog-git-rebase-sequence.test.mjs
}

run_rebase_clean() {
  node --test --test-reporter="${failures_only_reporter}" \
    tests/support/product-backlog-git-rebase-clean.test.mjs \
    tests/support/product-backlog-git-rebase-clean-accepted.test.mjs
}

run_rebase_onto() {
  node --test --test-reporter="${failures_only_reporter}" tests/support/product-backlog-git-rebase-onto.test.mjs
}

run_cherry_pick() {
  node --test --test-reporter="${failures_only_reporter}" \
    tests/support/product-backlog-git-cherry-pick.test.mjs \
    tests/support/product-backlog-git-cherry-pick-clean.test.mjs \
    tests/support/product-backlog-git-cherry-pick-sequence.test.mjs
}

case "${suite}" in
  merge)
    run_merge
    ;;
  rebase-conflict)
    run_rebase_conflict
    ;;
  rebase-clean)
    run_rebase_clean
    ;;
  rebase-onto)
    run_rebase_onto
    ;;
  cherry-pick)
    run_cherry_pick
    ;;
  all)
    run_merge
    run_rebase_conflict
    run_rebase_clean
    run_rebase_onto
    run_cherry_pick
    ;;
  *)
    echo "Unknown suite: ${suite}" >&2
    exit 1
    ;;
esac
