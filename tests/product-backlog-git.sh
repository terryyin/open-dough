#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

# With no suite named, `scripts/test.sh` discovers and runs this file like
# every other `tests/*.sh` aggregator, so the default runs everything this
# file currently owns. A named suite (`merge`, and later `rebase-conflict`,
# `rebase-clean`, `cherry-pick`, as later slices add them) is this file's own
# proof entry point for one Git journey at a time.
suite="${1:-all}"

run_merge() {
  node --test \
    tests/support/product-backlog-git-merge.test.mjs \
    tests/support/product-backlog-git-merge-conflict.test.mjs
  echo 'PASS: real Git merges of the product backlog, reconciled and gated through the shared resolver.'
}

case "${suite}" in
  merge)
    run_merge
    ;;
  all)
    run_merge
    ;;
  *)
    echo "Unknown suite: ${suite}" >&2
    exit 1
    ;;
esac
