#!/usr/bin/env bash
# After its report, scripts/ci-shard-balance.mjs prints one pattern change as
# a unified diff to ci.yml: the move of one existing pattern, or one new folder
# or file-name-prefix pattern out of the last shard's rest, that leaves the
# lowest slowest-shard total, with the totals it would give. When no change
# lowers the slowest shard by a twentieth of the even total it says the shards
# are balanced and prints no diff. Browser caller jobs and the
# distribution-tests matrix get the same proposal. Each printed diff applies to
# the workflow, and the run leaves the workflow's bytes unchanged. A `gh`
# stand-in serves fixture runs, so the check never reaches GitHub.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-report.bash
source "${source_dir}/Distribution/tests/helpers/expect-report.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fake="${temporary_dir}/gh"
repository="${temporary_dir}/repository"
scratch="${temporary_dir}/tmp"
mkdir -p -- "${fake}/bin" "${fake}/runs" "${scratch}"

# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/shard-balance-fixture.bash
source "${source_dir}/Distribution/tests/helpers/shard-balance-fixture.bash"
workflow="${repository}/.github/workflows/ci.yml"

# Runs the command for GROUP into <name>.log, keeping its proposal lines (the
# report before them is ci-shard-balance.sh's) in <name>-proposal.log, failing
# unless the workflow's bytes are unchanged and any printed diff applies to it.
propose() {
  cp -- "${workflow}" "${temporary_dir}/workflow-before"
  run_balance "$1" "$2"
  if ! cmp -s -- "${temporary_dir}/workflow-before" "${workflow}"; then
    printf 'FAIL: the %s run changed the workflow.\n' "$1" >&2
    exit 1
  fi
  sed -n '/^Proposed change: /,$p; /^Balanced: /,$p' "${temporary_dir}/$1.log" \
    > "${temporary_dir}/$1-proposal.log"
  sed -n '/^diff --git /,$p' "${temporary_dir}/$1.log" > "${temporary_dir}/$1.diff"
  if [[ -s ${temporary_dir}/$1.diff ]] \
    && ! (cd "${repository}" && git apply --check "${temporary_dir}/$1.diff"); then
    printf 'FAIL: the %s diff does not apply to the workflow.\n' "$1" >&2
    exit 1
  fi
}

cat > "${workflow}" << 'WORKFLOW'
jobs:
  distribution-tests:
    strategy:
      matrix:
        share: [1, 2, 3]
        include:
          - share: 1
            tests: Distribution/tests/alpha/**
          - share: 2
            tests: Distribution/tests/beta/** Distribution/tests/gamma/**
  e2e:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: e2e
      root: e2e
      shards: "[1, 2, 3, 4, 5, 6]"
      specs: |
        1: e2e/one/**
        2: e2e/two/**
        3: e2e/three/**
        4: e2e/four/** e2e/moved/**
        5: e2e/five/**
  dashboard-backend:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: dashboard-backend
      root: dashboard/backend-tests
      shards: "[1, 2, 3]"
      specs: |
        1: dashboard/backend-tests/launches/**
        2: dashboard/backend-tests/sessions/**
WORKFLOW
discovered e2e/one/a.spec.ts e2e/two/a.spec.ts e2e/three/a.spec.ts e2e/four/a.spec.ts \
  e2e/moved/a.spec.ts e2e/five/a.spec.ts e2e/rest/a.spec.ts e2e/rest/b.spec.ts \
  dashboard/backend-tests/launches/l.spec.ts dashboard/backend-tests/sessions/s.spec.ts \
  dashboard/backend-tests/runtime/r1.spec.ts dashboard/backend-tests/runtime/r2.spec.ts \
  dashboard/backend-tests/usage/u.spec.ts Distribution/tests/alpha/one.sh \
  Distribution/tests/beta/two.sh Distribution/tests/gamma/three.sh Distribution/tests/delta/four.sh

list_runs 401 2026-11-14T10:00:00Z
times_artifact 401 e2e-times-1 browser-times.txt 800 one/a.spec.ts
times_artifact 401 e2e-times-2 browser-times.txt 820 two/a.spec.ts
times_artifact 401 e2e-times-3 browser-times.txt 830 three/a.spec.ts
times_artifact 401 e2e-times-4 browser-times.txt 825 four/a.spec.ts 225 moved/a.spec.ts
times_artifact 401 e2e-times-5 browser-times.txt 820 five/a.spec.ts
times_artifact 401 e2e-times-6 browser-times.txt 300 rest/a.spec.ts 300 rest/b.spec.ts
times_artifact 401 dashboard-backend-times-1 browser-times.txt 100 backend-tests/launches/l.spec.ts
times_artifact 401 dashboard-backend-times-2 browser-times.txt 100 backend-tests/sessions/s.spec.ts
times_artifact 401 dashboard-backend-times-3 browser-times.txt 50 backend-tests/runtime/r1.spec.ts \
  50 backend-tests/runtime/r2.spec.ts 200 backend-tests/usage/u.spec.ts
times_artifact 401 test-times-1 test-times.txt 100 Distribution/tests/alpha/one.sh
times_artifact 401 test-times-2 test-times.txt 100 Distribution/tests/beta/two.sh \
  200 Distribution/tests/gamma/three.sh
times_artifact 401 test-times-3 test-times.txt 100 Distribution/tests/delta/four.sh

(cd "${repository}" && find . -type f | LC_ALL=C sort) > "${temporary_dir}/tree-before"
propose e2e e2e
expect_report e2e-proposal 0 << 'REPORT'
Proposed change: move e2e/moved/** from shard 4 to shard 6, the rest; the slowest shard falls from 1050 s to 830 s.
Shard 1 after: 800 s
Shard 2 after: 820 s
Shard 3 after: 830 s
Shard 4 after: 825 s
Shard 5 after: 820 s
Shard 6 after: 825 s
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -18,7 +18,7 @@
         1: e2e/one/**
         2: e2e/two/**
         3: e2e/three/**
-        4: e2e/four/** e2e/moved/**
+        4: e2e/four/**
         5: e2e/five/**
   dashboard-backend:
     uses: ./.github/workflows/browser-test-group.yml
REPORT
propose backend dashboard-backend
expect_report backend-proposal 0 << 'REPORT'
Proposed change: give shard 1 the new pattern dashboard/backend-tests/runtime/** from the last shard's rest; the slowest shard falls from 300 s to 200 s.
Shard 1 after: 200 s
Shard 2 after: 100 s
Shard 3 after: 200 s
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -27,5 +27,5 @@
       root: dashboard/backend-tests
       shards: "[1, 2, 3]"
       specs: |
-        1: dashboard/backend-tests/launches/**
+        1: dashboard/backend-tests/launches/** dashboard/backend-tests/runtime/**
         2: dashboard/backend-tests/sessions/**
REPORT
propose distribution distribution-tests
expect_report distribution-proposal 0 << 'REPORT'
Proposed change: move Distribution/tests/beta/** from shard 2 to shard 1; the slowest shard falls from 300 s to 200 s.
Shard 1 after: 200 s
Shard 2 after: 200 s
Shard 3 after: 100 s
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -5,9 +5,9 @@
         share: [1, 2, 3]
         include:
           - share: 1
-            tests: Distribution/tests/alpha/**
+            tests: Distribution/tests/alpha/** Distribution/tests/beta/**
           - share: 2
-            tests: Distribution/tests/beta/** Distribution/tests/gamma/**
+            tests: Distribution/tests/gamma/**
   e2e:
     uses: ./.github/workflows/browser-test-group.yml
     with:
REPORT

(cd "${repository}" && find . -type f | LC_ALL=C sort) > "${temporary_dir}/tree-after"
if ! diff -u -- "${temporary_dir}/tree-before" "${temporary_dir}/tree-after" >&2; then
  printf 'FAIL: the proposals changed the repository'"'"'s files.\n' >&2
  exit 1
fi

# With the proposed move applied, the shards are close: balanced, no diff.
(cd "${repository}" && git apply "${temporary_dir}/e2e.diff")
propose applied e2e
expect_report applied-proposal 0 << 'REPORT'
Balanced: no single pattern change lowers the slowest shard (830 s) by a twentieth of the even total (41 s); no diff proposed.
REPORT
find "${scratch}" -mindepth 1 > "${temporary_dir}/left"
if [[ -s ${temporary_dir}/left ]]; then
  printf 'FAIL: the proposals left their temporary directory:\n' >&2
  cat -- "${temporary_dir}/left" >&2
  exit 1
fi
