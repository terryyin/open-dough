#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

# With no suite named, `scripts/test.sh` discovers and runs this file like
# every other `tests/*.sh` aggregator, so the default runs everything this
# file currently owns. A named suite (`merge`, `rebase-conflict`,
# `rebase-clean`, and later `cherry-pick`, as later slices add them) is this
# file's own proof entry point for one Git journey at a time.
suite="${1:-all}"

run_merge() {
  node --test \
    tests/support/product-backlog-git-merge.test.mjs \
    tests/support/product-backlog-git-merge-conflict.test.mjs
  echo 'PASS: real Git merges of the product backlog, reconciled and gated through the shared resolver.'
}

run_rebase_conflict() {
  node --test \
    tests/support/product-backlog-git-rebase.test.mjs \
    tests/support/product-backlog-git-rebase-sequence.test.mjs
  echo 'PASS: real conflicted Git rebase replays of the product backlog, reconciled and gated through the shared resolver, with the unpublished suffix replayed exactly once.'
}

run_rebase_clean() {
  node --test \
    tests/support/product-backlog-git-rebase-clean.test.mjs \
    tests/support/product-backlog-git-rebase-clean-accepted.test.mjs
  echo 'PASS: clean (no per-step Git conflict) multi-commit Git rebase replays of the product backlog, gated by the whole-rebase aggregate comparison before a managed caller could publish them.'
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
  all)
    run_merge
    run_rebase_conflict
    run_rebase_clean
    ;;
  *)
    echo "Unknown suite: ${suite}" >&2
    exit 1
    ;;
esac
