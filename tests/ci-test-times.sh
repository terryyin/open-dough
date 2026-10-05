#!/usr/bin/env bash
# scripts/ci-test-times.sh reports recent trunk CI job times against the time
# budget: each job's and each share total's range, headroom, spread, and a
# wide or thin verdict; named jobs, including one without a recent timing; runs
# without artifacts skipped and not counted; and the reason when no timings can
# be read or the budget is malformed. A `gh` stand-in serves fixture runs, so
# the check never reaches GitHub, and a substitute budget stands in for
# tests/time-budget.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-report.bash
source "${source_dir}/tests/helpers/expect-report.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
fake="${temporary_dir}/gh"
mkdir -p -- "${checks}" "${fake}/bin" "${fake}/runs"
printf '# Substitute budget.\nper-job-seconds=71\ntotal-job-seconds=470\n' > "${checks}/time-budget"

# The stand-in logs its arguments, prints the `--jq` listing from fixture
# `listing` (or fails with `list-error` when present), and downloads a run's
# fixture artifacts; a run without them fails as gh does past retention.
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
  'run download')
    if [[ ! -d ${FAKE_GH}/runs/$3 ]]; then
      printf 'no valid artifacts found to download\n' >&2
      exit 1
    fi
    mkdir -p -- "$5"
    cp -R -- "${FAKE_GH}/runs/$3"/. "$5"
    ;;
  *) exit 2 ;;
esac
STANDIN
chmod +x "${fake}/bin/gh"

# Writes run RUN's share SHARE times from `<seconds> <job>` arguments.
artifact() {
  local dir="${fake}/runs/$1/test-times-$2"
  shift 2
  mkdir -p -- "${dir}"
  while (($# > 0)); do
    printf '%s\t%s\n' "$1" "$2" >> "${dir}/test-times.txt"
    shift 2
  done
}

# tests/filler.sh stands in for the rest of share 1, which totals 295.4, 387.4,
# and 350.0. tests/edge.sh's headroom equals its spread, and it and
# tests/late.sh ran in only some runs.
artifact 101 1 206.9 tests/filler.sh 48.5 tests/thin.sh 40.0 tests/git-publication-native.sh
artifact 101 2 50.0 tests/edge.sh 10.0 tests/other.sh
artifact 103 1 274.8 tests/filler.sh 61.2 tests/thin.sh 51.4 tests/git-publication-native.sh
artifact 103 2 60.5 tests/edge.sh 12.0 tests/other.sh
artifact 104 1 250.0 tests/filler.sh 55.0 tests/thin.sh 45.0 tests/git-publication-native.sh
artifact 104 2 11.0 tests/other.sh 5.0 tests/late.sh
# Run 102 has no artifacts.
printf '%s\t%s\n' 101 2026-09-29T11:00:00Z 102 2026-09-28T11:00:00Z \
  103 2026-09-27T11:00:00Z 104 2026-09-26T11:00:00Z > "${fake}/listing"

# Runs the command with the stand-in and substitute budget, logging to
# <name>.log and setting command_status for expect_report.
# shellcheck disable=SC2034
run_times() {
  local name=$1
  shift
  command_status=0
  PATH="${fake}/bin:${PATH}" FAKE_GH="${fake}" OPEN_DOUGH_TEST_DIR="${checks}" \
    "${BASH}" "${source_dir}/scripts/ci-test-times.sh" "$@" \
    > "${temporary_dir}/${name}.log" 2>&1 || command_status=$?
}

run_times all
expect_report all 0 << REPORT
Recent trunk CI timings: 3 successful ci.yml runs on main, 2026-09-26T11:00:00Z to 2026-09-29T11:00:00Z (1 without readable artifacts skipped).
Ceilings (${checks}/time-budget): 71s per job, 470 job-seconds per share.
tests/filler.sh: 206.9-274.8 s, ceiling 71, headroom -203.8, spread 67.9, thin: project from 274.8
tests/thin.sh: 48.5-61.2 s, ceiling 71, headroom 9.8, spread 12.7, thin: project from 61.2
tests/edge.sh: 50.0-60.5 s, ceiling 71, headroom 10.5, spread 10.5, wide
tests/git-publication-native.sh: 40.0-51.4 s, ceiling 71, headroom 19.6, spread 11.4, wide
tests/other.sh: 10.0-12.0 s, ceiling 71, headroom 59.0, spread 2.0, wide
tests/late.sh: 5.0-5.0 s, ceiling 71, headroom 66.0, spread 0.0, wide
share 1 total: 295.4-387.4 job-seconds, ceiling 470, headroom 82.6, spread 92.0, thin: project from 387.4
share 2 total: 16.0-72.5 job-seconds, ceiling 470, headroom 397.5, spread 56.5, wide
REPORT
expect_in_log "${fake}/calls" -x -F -- "run list --workflow ci.yml --branch main --status success --limit 10 --json databaseId,createdAt --jq .[] | \"\(.databaseId)\t\(.createdAt)\""

run_times named tests/git-publication-native.sh tests/absent.sh
expect_report named 0 << REPORT
Recent trunk CI timings: 3 successful ci.yml runs on main, 2026-09-26T11:00:00Z to 2026-09-29T11:00:00Z (1 without readable artifacts skipped).
Ceilings (${checks}/time-budget): 71s per job, 470 job-seconds per share.
tests/git-publication-native.sh: 40.0-51.4 s, ceiling 71, headroom 19.6, spread 11.4, wide
tests/absent.sh: no recent timing; its first CI run settles it.
share 1 total: 295.4-387.4 job-seconds, ceiling 470, headroom 82.6, spread 92.0, thin: project from 387.4
share 2 total: 16.0-72.5 job-seconds, ceiling 470, headroom 397.5, spread 56.5, wide
REPORT

printf '102\t2026-09-28T11:00:00Z\n' > "${fake}/listing"
run_times none
expect_report none 1 << REPORT
No recent trunk timings were found: none of the 1 listed runs had readable test-times artifacts (last gh message: no valid artifacts found to download)
REPORT

: > "${fake}/listing"
run_times empty
expect_report empty 1 << REPORT
No recent trunk timings were found: gh listed no successful ci.yml runs on main.
REPORT

printf 'HTTP 401: Bad credentials (https://api.github.com/graphql)\n' > "${fake}/list-error"
run_times gh-fails
expect_report gh-fails 1 << REPORT
No recent trunk timings were found: gh run list failed: HTTP 401: Bad credentials (https://api.github.com/graphql)
REPORT

printf 'per-job-seconds=71\n' > "${checks}/time-budget"
run_times malformed
expect_report malformed 1 << REPORT
FAIL: ${checks}/time-budget must set only per-job-seconds=<n> and total-job-seconds=<n>.
REPORT
