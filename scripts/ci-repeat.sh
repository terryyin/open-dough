#!/usr/bin/env bash
# Runs CI repeatedly on one revision and reports what failed:
#   bash scripts/ci-repeat.sh <repetitions> [ref]
# Dispatches .github/workflows/ci.yml on REF (default: the current branch) that
# many times through `gh`, at most CI_REPEAT_PARALLEL (default 2) in progress
# at once so other pushes still get runners, and waits for each run, polling
# every CI_REPEAT_POLL_SECONDS (default 30). A run still unfinished
# CI_REPEAT_WAIT_SECONDS (default 3600) after it appeared is reported
# unfinished and no longer waited for. Only its own runs count: a
# workflow_dispatch run of REF at the revision GitHub holds for REF when the
# script starts, absent from the run listing just before its dispatch, and not
# already claimed, so pushes and other sessions' dispatches are not counted.
# The report names each failing dashboard spec location, from the quiet
# reporter's `FAIL: <file>:<line> › <title> (<status>)` lines in
# `gh run view --log-failed`, and each other failed job (any job outside
# `dashboard`, or a dashboard shard that named no spec), with the number of
# repetitions it failed in, counted once per run; then the run IDs and the
# totals. Exits 0 only when every repetition passed, 1 otherwise. A malformed
# repetition count is refused (exit 2) before any `gh` call; when `gh` fails it
# names the call, lists the runs already dispatched, and exits 1 without a
# result. ci.yml is unchanged: every repetition runs exactly what a push runs.
set -euo pipefail

# shellcheck disable=SC1091
# shellcheck source=scripts/gh-message.bash
source "$(dirname -- "${BASH_SOURCE[0]}")/gh-message.bash"

usage() {
  printf '%s\nUsage: bash scripts/ci-repeat.sh <repetitions> [ref]\n' "$1" >&2
  exit 2
}

# Prints the whole-number setting NAME's value, or DEFAULT when unset.
whole_number() {
  local value=${!1:-$2}
  [[ ${value} =~ ^[0-9]+$ ]] || usage "$1 must be a whole number of seconds or runs, not \"${value}\"."
  printf '%s' "$((10#${value}))"
}

(($# >= 1 && $# <= 2)) || usage 'Name the number of repetitions, and optionally the ref.'
[[ $1 =~ ^[1-9][0-9]*$ ]] || usage "The number of repetitions must be a positive whole number, not \"$1\"."
readonly repetitions=$1
poll_seconds=$(whole_number CI_REPEAT_POLL_SECONDS 30)
wait_seconds=$(whole_number CI_REPEAT_WAIT_SECONDS 3600)
parallel=$(whole_number CI_REPEAT_PARALLEL 2)
((parallel > 0)) || usage 'CI_REPEAT_PARALLEL must be at least 1.'
readonly poll_seconds wait_seconds parallel
if (($# == 2)); then
  ref=$2
elif ! ref=$(git symbolic-ref --quiet --short HEAD); then
  usage 'No branch is checked out here; name the ref to repeat.'
fi
readonly ref

work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT
: > "${work_dir}/seen"
: > "${work_dir}/findings"
dispatched_runs=''

no_result() {
  printf 'No repeated-run result: %s\n' "$1" >&2
  [[ -z ${dispatched_runs} ]] || printf 'Runs already dispatched:%s\n' "${dispatched_runs}" >&2
  exit 1
}

# Runs `gh ARGS…` with its stdout in `${work_dir}/gh.out`; on failure stops,
# naming the call by LABEL.
gh_call() {
  local label=$1
  shift
  local message
  if ! gh "$@" > "${work_dir}/gh.out" 2> "${work_dir}/gh.err"; then
    message=$(gh_message "${work_dir}/gh.err")
    no_result "${label} failed: ${message}"
  fi
}

gh_call 'gh api' api "repos/{owner}/{repo}/commits/${ref}" --jq .sha
revision=$(< "${work_dir}/gh.out")
readonly revision

# Writes this ref's workflow_dispatch runs at the revision, one ID per line,
# to `${work_dir}/listed`.
list_runs() {
  gh_call 'gh run list' run list --workflow ci.yml --event workflow_dispatch \
    --branch "${ref}" --limit 50 --json databaseId,event,headBranch,headSha \
    --jq '.[] | "\(.databaseId)\t\(.event)\t\(.headBranch)\t\(.headSha)"'
  awk -F '\t' -v ref="${ref}" -v revision="${revision}" \
    '$2 == "workflow_dispatch" && $3 == ref && $4 == revision { print $1 }' \
    "${work_dir}/gh.out" > "${work_dir}/listed"
}

declare -a run_id appeared result
dispatched=0 active='' in_progress=0

# Dispatches the next repetition and claims its run: the oldest listed run
# that was not listed before the dispatch and is not already claimed.
dispatch() {
  local rep=$((dispatched + 1)) attempt id
  list_runs
  cat -- "${work_dir}/listed" >> "${work_dir}/seen"
  gh_call 'gh workflow run' workflow run ci.yml --ref "${ref}"
  for ((attempt = 0; attempt < 24; attempt++)); do
    sleep "$((poll_seconds < 5 ? poll_seconds : 5))"
    list_runs
    id=$(grep -vxF -f "${work_dir}/seen" -- "${work_dir}/listed" | sort -n | head -n 1 || true)
    [[ -z ${id} ]] || break
  done
  [[ -n ${id} ]] \
    || no_result "repetition ${rep}'s run did not appear in gh run list as a workflow_dispatch run of ${ref} at ${revision}."
  printf '%s\n' "${id}" >> "${work_dir}/seen"
  dispatched=${rep}
  run_id[rep]=${id}
  appeared[rep]=${SECONDS}
  active="${active} ${rep}"
  in_progress=$((in_progress + 1))
  dispatched_runs="${dispatched_runs} ${id}"
  printf 'Repetition %s: run %s started.\n' "${rep}" "${id}"
}

# Records run ID's failing spec locations and failed jobs in
# `${work_dir}/findings` as `<run>\t<kind>\t<name>` lines, given its
# `<job>\t<conclusion>` lines in `${work_dir}/jobs`.
record_failures() {
  local id=$1
  gh_call "gh run view ${id} --log-failed" run view "${id}" --log-failed
  # Spec lines come only from dashboard shards; a `test` job's own `FAIL:`
  # lines name shell checks, not specs.
  awk -F '\t' -v run="${id}" '
    $1 ~ /^dashboard( |$)/ && index($0, "FAIL: ") && index($0, " › ") {
      spec = substr($0, index($0, "FAIL: ") + 6)
      sub(/\r$/, "", spec)
      sub(/ \([a-zA-Z]+\)$/, "", spec)
      printf "%s\tspec\t%s\n", run, spec
      named[$1] = 1
    }
    END { for (job in named) printf "%s\tnamed\t%s\n", run, job }
  ' "${work_dir}/gh.out" > "${work_dir}/run-findings"
  awk -F '\t' -v run="${id}" '
    FILENAME == ARGV[1] { if ($2 == "named") named[$3] = 1; next }
    $2 != "success" && $2 != "skipped" && $2 != "neutral" && $2 != "cancelled" \
      && !($1 ~ /^dashboard( |$)/ && $1 in named) { printf "%s\tjob\t%s\n", run, $1 }
  ' "${work_dir}/run-findings" "${work_dir}/jobs" >> "${work_dir}/findings"
  grep -F "$(printf '\tspec\t')" -- "${work_dir}/run-findings" >> "${work_dir}/findings" || true
}

# Reads repetition REP's run; when it has finished or waited too long, records
# and prints its result and sets `finished` to 1, otherwise to 0.
check_repetition() {
  local rep=$1 id=${run_id[$1]} status conclusion
  gh_call "gh run view ${id}" run view "${id}" --json status,conclusion,jobs \
    --jq '"\(.status)\t\(.conclusion)", (.jobs[] | "\(.name)\t\(.conclusion)")'
  IFS=$'\t' read -r status conclusion < "${work_dir}/gh.out"
  finished=0
  if [[ ${status} != completed ]]; then
    ((SECONDS - appeared[rep] >= wait_seconds)) || return 0
    result[rep]="unfinished (${status} after ${wait_seconds}s)"
  else
    result[rep]=${conclusion}
    if [[ ${conclusion} != success && ${conclusion} != cancelled ]]; then
      tail -n +2 -- "${work_dir}/gh.out" > "${work_dir}/jobs"
      record_failures "${id}"
    fi
  fi
  finished=1
  printf 'Repetition %s: run %s %s.\n' "${rep}" "${id}" "${result[rep]}"
}

printf 'Repeating ci.yml %s times on %s at %s, at most %s at once.\n' \
  "${repetitions}" "${ref}" "${revision}" "${parallel}"
while :; do
  while ((in_progress < parallel && dispatched < repetitions)); do
    dispatch
  done
  ((in_progress > 0)) || break
  waiting=''
  for rep in ${active}; do
    check_repetition "${rep}"
    if ((finished == 1)); then
      in_progress=$((in_progress - 1))
    else
      waiting="${waiting} ${rep}"
    fi
  done
  # Waits only when no run finished, so a freed slot is refilled at once.
  [[ ${waiting} != "${active}" ]] || sleep "${poll_seconds}"
  active=${waiting}
done

# Each failing spec location, then each failed job, most repetitions first.
sort -u -- "${work_dir}/findings" | awk -F '\t' -v total="${repetitions}" '
  $2 == "spec" {
    location = $3
    sub(/ › .*/, "", location)
    if (($1, location) in counted) next
    counted[$1, location] = 1
    if (!(location in specs)) label[location] = $3
    specs[location]++
  }
  $2 == "job" { jobs[$3]++ }
  END {
    for (location in specs)
      printf "1\t%d\t%s\t%s: failed in %d of %d repetitions.\n", \
        specs[location], location, label[location], specs[location], total
    for (name in jobs)
      printf "2\t%d\t%s\tjob %s: failed in %d of %d repetitions.\n", \
        jobs[name], name, name, jobs[name], total
  }
' | sort -t $'\t' -k1,1n -k2,2nr -k3,3 | cut -f 4-

passed=0 failed=0 cancelled=0 unfinished=0
for ((rep = 1; rep <= repetitions; rep++)); do
  case ${result[rep]} in
    success) passed=$((passed + 1)) ;;
    cancelled) cancelled=$((cancelled + 1)) ;;
    unfinished*) unfinished=$((unfinished + 1)) ;;
    *) failed=$((failed + 1)) ;;
  esac
done
printf 'Runs:%s\n' "${dispatched_runs}"
printf 'Passed %s of %s repetitions' "${passed}" "${repetitions}"
((failed == 0)) || printf ', %s failed' "${failed}"
((cancelled == 0)) || printf ', %s cancelled' "${cancelled}"
((unfinished == 0)) || printf ', %s unfinished' "${unfinished}"
printf '.\n'
((passed == repetitions))
