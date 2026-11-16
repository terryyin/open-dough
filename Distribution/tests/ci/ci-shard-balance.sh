#!/usr/bin/env bash
# scripts/ci-shard-balance.mjs reports a CI test group's shard totals from the
# times artifacts of recent successful main runs: each file's median over the
# runs that timed it, totalled under the patterns now in the workflow, with
# the even total, the untimed files and the slow files. Browser labels gain
# their configuration's directory; Distribution labels are already
# repository-relative. A run without the group's artifacts is skipped, a run
# under an older layout still counts, and files no longer discovered are
# ignored. With no usable run, or when gh fails, it says why and exits 1. It
# writes nothing outside its own temporary directory. A `gh` stand-in serves
# fixture runs, so the check never reaches GitHub.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-in-log.bash
source "${source_dir}/Distribution/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-report.bash
source "${source_dir}/Distribution/tests/helpers/expect-report.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/copy-runner.bash
source "${source_dir}/Distribution/tests/helpers/copy-runner.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fake="${temporary_dir}/gh"
repository="${temporary_dir}/repository"
scratch="${temporary_dir}/tmp"
mkdir -p -- "${fake}/bin" "${fake}/runs" "${scratch}"

# The stand-in logs its calls, prints the `--jq` listing from fixture `listing`
# (or fails with `list-error`), applies an artifacts call's `--jq` filter to
# the run's fixture artifact directories, and copies those matching a
# download's pattern into its directory.
cat > "${fake}/bin/gh" << 'STANDIN'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${FAKE_GH}/calls"
case "$1 $2" in
  'run list')
    if [[ -f ${FAKE_GH}/list-error ]]; then
      cat -- "${FAKE_GH}/list-error" >&2
      exit 1
    fi
    cat -- "${FAKE_GH}/listing"
    ;;
  api\ *)
    run=${2#*/runs/}
    run=${run%%/*}
    mkdir -p -- "${FAKE_GH}/runs/${run}"
    find "${FAKE_GH}/runs/${run}" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; \
      | jq -R '{name: ., expired: false}' | jq -s '{artifacts: .}' | jq -r "$4"
    ;;
  'run download')
    mkdir -p -- "$7"
    for artifact in "${FAKE_GH}/runs/$3"/*/; do
      name=$(basename -- "${artifact}")
      # shellcheck disable=SC2053 # The pattern is gh's artifact-name glob.
      [[ ${name} != $5 ]] || cp -R -- "${artifact}" "$7/${name}"
    done
    ;;
  *) exit 2 ;;
esac
STANDIN
chmod +x "${fake}/bin/gh"

# Lists runs as gh's `--jq` listing prints them, newest first: `RUN CREATED`.
list_runs() {
  : > "${fake}/listing"
  while (($#)); do
    printf '%s\t%s\n' "$1" "$2" >> "${fake}/listing"
    shift 2
  done
}

# Gives run RUN the artifact NAME holding FILE, one `<seconds><TAB><label>`
# row per remaining `SECONDS LABEL` pair.
times_artifact() {
  local run=$1 name=$2 file=$3
  shift 3
  mkdir -p -- "${fake}/runs/${run}/${name}"
  : > "${fake}/runs/${run}/${name}/${file}"
  while (($#)); do
    printf '%s\t%s\n' "$1" "$2" >> "${fake}/runs/${run}/${name}/${file}"
    shift 2
  done
}

# Creates empty files at the repository-relative paths given.
discovered() {
  local path
  for path in "$@"; do
    mkdir -p -- "$(dirname -- "${repository}/${path}")"
    : > "${repository}/${path}"
  done
}

copy_runner "${repository}"
cp -- "${source_dir}/scripts/ci-shard-balance.mjs" "${source_dir}/scripts/ci-shard-times.mjs" \
  "${repository}/scripts/"
mkdir -p -- "${repository}/dashboard/tests/support" "${repository}/.github/workflows"
cp -- "${source_dir}/dashboard/tests/support/testFiles.mjs" "${repository}/dashboard/tests/support/"
cat > "${repository}/.github/workflows/ci.yml" << 'WORKFLOW'
jobs:
  distribution-tests:
    strategy:
      matrix:
        share: [1, 2]
        include:
          - share: 1
            tests: Distribution/tests/alpha/**
  e2e:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: e2e
      root: e2e
      shards: "[1, 2, 3]"
      specs: |
        1: e2e/launches/agent-*
        2: e2e/sessions/**
  dashboard-backend:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: dashboard-backend
      root: dashboard/backend-tests
      shards: "[1, 2]"
      specs: |
        1: dashboard/backend-tests/launches/**
WORKFLOW
discovered e2e/launches/agent-a.spec.ts e2e/launches/agent-b.spec.ts \
  e2e/sessions/one.spec.ts e2e/runtime/r.spec.ts e2e/runtime/slow.spec.ts \
  e2e/new.spec.ts dashboard/backend-tests/launches/l.spec.ts \
  dashboard/backend-tests/runtime/r.spec.ts Distribution/tests/alpha/one.sh \
  Distribution/tests/beta/two.sh
(cd "${repository}" && find . -type f | LC_ALL=C sort) > "${temporary_dir}/tree-before"

list_runs 301 2026-11-14T10:00:00Z 302 2026-11-13T10:00:00Z \
  303 2026-11-12T10:00:00Z 304 2026-11-11T10:00:00Z
# Runs 301 and 303 have today's three E2E shards; 302 the older two, with a
# spec since deleted; 304 only the Distribution suite's times.
times_artifact 301 e2e-times-1 browser-times.txt 3 launches/agent-a.spec.ts 5 launches/agent-b.spec.ts
times_artifact 301 e2e-times-2 browser-times.txt 6 sessions/one.spec.ts
times_artifact 301 e2e-times-3 browser-times.txt 9 runtime/r.spec.ts 270 runtime/slow.spec.ts
times_artifact 302 e2e-times-1 browser-times.txt 2 launches/agent-a.spec.ts 8 sessions/one.spec.ts \
  276 runtime/slow.spec.ts
times_artifact 302 e2e-times-2 browser-times.txt 6 launches/agent-b.spec.ts 9 runtime/r.spec.ts \
  50 gone.spec.ts
times_artifact 303 e2e-times-1 browser-times.txt 4 launches/agent-a.spec.ts 5 launches/agent-b.spec.ts
times_artifact 303 e2e-times-3 browser-times.txt 10 runtime/r.spec.ts 280 runtime/slow.spec.ts
times_artifact 301 dashboard-backend-times-1 browser-times.txt 40 backend-tests/launches/l.spec.ts
times_artifact 301 dashboard-backend-times-2 browser-times.txt 60 backend-tests/runtime/r.spec.ts
times_artifact 304 test-times-1 test-times.txt 30 Distribution/tests/alpha/one.sh
times_artifact 304 test-times-2 test-times.txt 50 Distribution/tests/beta/two.sh

# Runs the copied command for GROUP with the stand-in, logging to <name>.log and
# setting command_status for expect_report.
# shellcheck disable=SC2034
run_balance() {
  command_status=0
  (cd "${repository}" && PATH="${fake}/bin:${PATH}" FAKE_GH="${fake}" TMPDIR="${scratch}" \
    node scripts/ci-shard-balance.mjs "$2") > "${temporary_dir}/$1.log" 2>&1 || command_status=$?
}

run_balance e2e e2e
expect_report e2e 0 << 'REPORT'
Shard totals for e2e: 3 successful ci.yml runs on main, 2026-11-12T10:00:00Z to 2026-11-14T10:00:00Z (1 without e2e times artifacts skipped).
Seconds are each discovered file's median over the runs that timed it, under the shards now in .github/workflows/ci.yml.
Even total: 100 s over 3 shards
Shard 1: 8 s, 2 files: e2e/launches/agent-*
Shard 2: 7 s, 1 file: e2e/sessions/**
Shard 3: 285 s, 3 files: the rest
Untimed files (no run timed them): 1
  e2e/new.spec.ts
Slow files (each over a tenth of the even total, 10 s; candidates for a faster test): 1
  276 s e2e/runtime/slow.spec.ts
REPORT
expect_in_log "${fake}/calls" -x -F -- "run list --workflow ci.yml --branch main --status success --limit 5 --json databaseId,createdAt --jq .[] | \"\(.databaseId)\t\(.createdAt)\""
expect_in_log "${fake}/calls" -F -- 'run download 302 --pattern e2e-times-* --dir'

run_balance backend dashboard-backend
expect_report backend 0 << 'REPORT'
Shard totals for dashboard-backend: 1 successful ci.yml run on main, 2026-11-14T10:00:00Z to 2026-11-14T10:00:00Z (3 without dashboard-backend times artifacts skipped).
Seconds are each discovered file's median over the runs that timed it, under the shards now in .github/workflows/ci.yml.
Even total: 50 s over 2 shards
Shard 1: 40 s, 1 file: dashboard/backend-tests/launches/**
Shard 2: 60 s, 1 file: the rest
Untimed files (no run timed them): none
Slow files (each over a tenth of the even total, 5 s; candidates for a faster test): 2
  60 s dashboard/backend-tests/runtime/r.spec.ts
  40 s dashboard/backend-tests/launches/l.spec.ts
REPORT

run_balance distribution distribution-tests
expect_report distribution 0 << 'REPORT'
Shard totals for distribution-tests: 1 successful ci.yml run on main, 2026-11-11T10:00:00Z to 2026-11-11T10:00:00Z (3 without distribution-tests times artifacts skipped).
Seconds are each discovered file's median over the runs that timed it, under the shards now in .github/workflows/ci.yml.
Even total: 40 s over 2 shards
Shard 1: 30 s, 1 file: Distribution/tests/alpha/**
Shard 2: 50 s, 2 files: the rest
Untimed files (no run timed them): 1
  scripts/check-self-installation.sh
Slow files (each over a tenth of the even total, 4 s; candidates for a faster test): 2
  50 s Distribution/tests/beta/two.sh
  30 s Distribution/tests/alpha/one.sh
REPORT

list_runs 304 2026-11-11T10:00:00Z
run_balance unusable e2e
expect_report unusable 1 << 'REPORT'
No recent trunk times were found: none of the 1 listed successful ci.yml runs on main still holds e2e-times-* artifacts.
REPORT

: > "${fake}/listing"
run_balance empty e2e
expect_report empty 1 << 'REPORT'
No recent trunk times were found: gh listed no successful ci.yml runs on main.
REPORT

printf 'HTTP 401: Bad credentials (https://api.github.com/graphql)\n' > "${fake}/list-error"
run_balance gh-fails e2e
expect_report gh-fails 1 << 'REPORT'
No recent trunk times were found: gh run list failed: HTTP 401: Bad credentials (https://api.github.com/graphql)
REPORT

(cd "${repository}" && find . -type f | LC_ALL=C sort) > "${temporary_dir}/tree-after"
if ! diff -u -- "${temporary_dir}/tree-before" "${temporary_dir}/tree-after" >&2; then
  printf 'FAIL: the report changed the repository'"'"'s files.\n' >&2
  exit 1
fi
find "${scratch}" -mindepth 1 > "${temporary_dir}/left"
if [[ -s ${temporary_dir}/left ]]; then
  printf 'FAIL: the report left its temporary directory:\n' >&2
  cat -- "${temporary_dir}/left" >&2
  exit 1
fi
