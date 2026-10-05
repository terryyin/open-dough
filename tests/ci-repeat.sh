#!/usr/bin/env bash
# scripts/ci-repeat.sh runs ci.yml repeatedly on one revision and reports what
# failed: every repetition passing, at most two in progress, on the current
# branch by default; a spec failing in some repetitions, counted once per run
# even when it fails in two shards; a failed `test` job and a dashboard shard
# that named no spec; cancelled and unfinished runs not counted as passes;
# pushes, other branches and revisions, and runs that existed before a
# dispatch not counted; each failing `gh` call named without a result; and a
# malformed repetition count refused before any `gh` call. A `gh` stand-in
# serves fixture runs, so the check never reaches GitHub.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-report.bash
source "${source_dir}/tests/helpers/expect-report.bash"
fake="${temporary_dir}/gh"
repository="${temporary_dir}/repository"
git init -q -b feature -- "${repository}"
revision=1111111111111111111111111111111111111111
other_revision=2222222222222222222222222222222222222222
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/ci-repeat-fixture.bash
source "${source_dir}/tests/helpers/ci-repeat-fixture.bash"

# all-pass: three repetitions on the current branch, at most two at once: the
# third is dispatched only after a run finished.
reset_fixture
on_dispatch 1 11
on_dispatch 2 12
on_dispatch 3 13
run_view 11 completed success
run_view 12 completed success
run_view 13 completed success
run_repeat all-pass 3
expect_report all-pass 0 << REPORT
Repeating ci.yml 3 times on feature at ${revision}, at most 2 at once.
Repetition 1: run 11 started.
Repetition 2: run 12 started.
Repetition 1: run 11 success.
Repetition 2: run 12 success.
Repetition 3: run 13 started.
Repetition 3: run 13 success.
Runs: 11 12 13
Passed 3 of 3 repetitions.
REPORT
expect_calls all-pass '^(workflow|run view)' << 'CALLS'
workflow run ci.yml --ref feature
workflow run ci.yml --ref feature
run view 11 --json status,conclusion,jobs --jq "\(.status)\t\(.conclusion)", (.jobs[] | "\(.name)\t\(.conclusion)")
run view 12 --json status,conclusion,jobs --jq "\(.status)\t\(.conclusion)", (.jobs[] | "\(.name)\t\(.conclusion)")
workflow run ci.yml --ref feature
run view 13 --json status,conclusion,jobs --jq "\(.status)\t\(.conclusion)", (.jobs[] | "\(.name)\t\(.conclusion)")
CALLS
expect_in_log "${fake}/calls" -x -F -- 'api repos/{owner}/{repo}/commits/feature --jq .sha'
expect_in_log "${fake}/calls" -x -F -- 'run list --workflow ci.yml --event workflow_dispatch --branch feature --limit 50 --json databaseId,event,headBranch,headSha --jq .[] | "\(.databaseId)\t\(.event)\t\(.headBranch)\t\(.headSha)"'

# other-runs: another session's dispatch already listed, and a push, another
# branch's dispatch, and a dispatch at another revision appearing with ours,
# are not counted; none of them is ever read.
reset_fixture
printf '5\tworkflow_dispatch\tfeature\t%s\n' "${revision}" > "${fake}/listing"
on_dispatch 1 21 \
  6 push feature "${revision}" \
  7 workflow_dispatch other "${revision}" \
  8 workflow_dispatch feature "${other_revision}"
run_view 21 completed success
run_repeat other-runs 1 feature
expect_report other-runs 0 << REPORT
Repeating ci.yml 1 times on feature at ${revision}, at most 2 at once.
Repetition 1: run 21 started.
Repetition 1: run 21 success.
Runs: 21
Passed 1 of 1 repetitions.
REPORT
expect_calls other-runs '^run view' << 'CALLS'
run view 21 --json status,conclusion,jobs --jq "\(.status)\t\(.conclusion)", (.jobs[] | "\(.name)\t\(.conclusion)")
CALLS

# some-fail: the acceptance spec fails in runs 32 and 34 (twice in run 34, in
# two shards), the cursor spec only in run 32; run 33 fails its `test (2/3)`
# job, whose shell-check FAIL line names no spec, and a dashboard shard that
# printed no FAIL line is named as a job.
reset_fixture
on_dispatch 1 31
on_dispatch 2 32
on_dispatch 3 33
on_dispatch 4 34
acceptance='FAIL: dashboard/tests/agent-launch-acceptance.spec.ts:96 › launch › reports (failed)'
cursor='FAIL: dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts:43 › cursor › starts (timedOut)'
run_view 31 completed success
run_view 32 completed failure 'dashboard (3/9)' failure 'dashboard (5/9)' failure
log_line 32 'dashboard (3/9)' "${acceptance}"
log_line 32 'dashboard (5/9)' "${cursor}"
run_view 33 completed failure 'test (2/3)' failure 'dashboard (9/9)' failure
log_line 33 'test (2/3)' 'FAIL: tests/install.sh'
log_line 33 'dashboard (9/9)' 'error TS2322: Type string is not assignable'
run_view 34 completed failure 'dashboard (3/9)' failure 'dashboard (5/9)' failure
log_line 34 'dashboard (3/9)' "${acceptance}"
log_line 34 'dashboard (5/9)' "${acceptance}"
run_repeat some-fail 4 feature
expect_report some-fail 1 << REPORT
Repeating ci.yml 4 times on feature at ${revision}, at most 2 at once.
Repetition 1: run 31 started.
Repetition 2: run 32 started.
Repetition 1: run 31 success.
Repetition 2: run 32 failure.
Repetition 3: run 33 started.
Repetition 4: run 34 started.
Repetition 3: run 33 failure.
Repetition 4: run 34 failure.
dashboard/tests/agent-launch-acceptance.spec.ts:96 › launch › reports: failed in 2 of 4 repetitions.
dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts:43 › cursor › starts: failed in 1 of 4 repetitions.
job dashboard (9/9): failed in 1 of 4 repetitions.
job test (2/3): failed in 1 of 4 repetitions.
Runs: 31 32 33 34
Passed 1 of 4 repetitions, 3 failed.
REPORT

# cancelled-unfinished: a cancelled run and one still running when the wait
# ends are reported, and neither counts as a pass.
reset_fixture
on_dispatch 1 41
on_dispatch 2 42
run_view 41 completed cancelled 'dashboard (2/9)' cancelled
run_view 42 in_progress ''
CI_REPEAT_WAIT_SECONDS=0 run_repeat cancelled-unfinished 2 feature
expect_report cancelled-unfinished 1 << REPORT
Repeating ci.yml 2 times on feature at ${revision}, at most 2 at once.
Repetition 1: run 41 started.
Repetition 2: run 42 started.
Repetition 1: run 41 cancelled.
Repetition 2: run 42 unfinished (in_progress after 0s).
Runs: 41 42
Passed 0 of 2 repetitions, 1 cancelled, 1 unfinished.
REPORT

# gh-fails: each failing call is named, with the runs already dispatched, and
# no result is claimed.
# shellcheck disable=SC2154 # run_repeat sets command_status.
expect_gh_failure() {
  local name=$1 call=$2
  shift 2
  printf 'HTTP 401: Bad credentials\nsecond line\n' > "${fake}/$1-error"
  run_repeat "gh-${name}" 1 feature
  if ((command_status != 1)); then
    printf 'FAIL: gh-%s exited %s, expected 1.\n' "${name}" "${command_status}" >&2
    cat -- "${temporary_dir}/gh-${name}.log" >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/gh-${name}.log" -x -F -- "No repeated-run result: ${call} failed: HTTP 401: Bad credentials second line"
  if grep -q '^Passed' "${temporary_dir}/gh-${name}.log"; then
    printf 'FAIL: gh-%s claimed a result.\n' "${name}" >&2
    exit 1
  fi
}
reset_fixture
expect_gh_failure api 'gh api' api
reset_fixture
on_dispatch 1 51
expect_gh_failure dispatch 'gh workflow run' workflow-run
reset_fixture
expect_gh_failure list 'gh run list' run-list
reset_fixture
on_dispatch 1 51
expect_gh_failure view 'gh run view 51' run-view
expect_in_log "${temporary_dir}/gh-view.log" -x -F -- 'Runs already dispatched: 51'
reset_fixture
on_dispatch 1 51
run_view 51 completed failure 'dashboard (1/9)' failure
expect_gh_failure log 'gh run view 51 --log-failed' log-failed
expect_in_log "${temporary_dir}/gh-log.log" -x -F -- 'Runs already dispatched: 51'

# not-listed: a dispatched run that never appears in the listing stops the
# repetition without a result.
reset_fixture
run_repeat not-listed 1 feature
expect_report not-listed 1 << REPORT
Repeating ci.yml 1 times on feature at ${revision}, at most 2 at once.
No repeated-run result: repetition 1's run did not appear in gh run list as a workflow_dispatch run of feature at ${revision}.
REPORT

# malformed: a repetition count that is not a positive whole number is refused
# before any gh call.
for count in 0 -1 2x 1.5 ''; do
  reset_fixture
  run_repeat malformed "${count}" feature
  expect_report malformed 2 << REPORT
The number of repetitions must be a positive whole number, not "${count}".
Usage: bash scripts/ci-repeat.sh <repetitions> [ref]
REPORT
  if [[ -s ${fake}/calls ]]; then
    printf 'FAIL: a malformed count "%s" reached gh:\n' "${count}" >&2
    cat -- "${fake}/calls" >&2
    exit 1
  fi
done
