#!/usr/bin/env bash
# A `gh` stand-in in FAKE serving fixture ci.yml runs to scripts/ci-repeat.sh
# from REPOSITORY, whose branch `feature` holds REVISION; the builders of those
# runs; and the check of its calls. Requires these and source_dir and
# temporary_dir.
: "${source_dir:?source_dir must be set before sourcing this helper}"
: "${temporary_dir:?temporary_dir must be set before sourcing this helper}"
: "${fake:?fake must be set before sourcing this helper}"
: "${repository:?repository must be set before sourcing this helper}"
: "${revision:?revision must be set before sourcing this helper}"

mkdir -p -- "${fake}/bin"

# The stand-in logs its arguments. `api` prints the ref's revision. `workflow
# run` appends the listing lines that fixture `dispatches` keys by the
# dispatch's number. `run list` prints the `--jq` listing from `listing`. `run
# view` prints run RUN's `runs/RUN/view` (`--json`) or `runs/RUN/log`
# (`--log-failed`). Fixture `<subcommand>-error` (api, workflow-run, run-list,
# run-view, log-failed) makes that call fail with its contents.
cat > "${fake}/bin/gh" << 'STANDIN'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${FAKE_GH}/calls"
fail_with() {
  if [[ -f ${FAKE_GH}/$1-error ]]; then
    cat -- "${FAKE_GH}/$1-error" >&2
    exit 1
  fi
}
case "$1 $2" in
  api\ *)
    fail_with api
    printf '%s\n' "${FAKE_REVISION}"
    ;;
  'workflow run')
    fail_with workflow-run
    count=$(grep -c '^workflow run' "${FAKE_GH}/calls")
    awk -F '\t' -v n="${count}" '$1 == n' "${FAKE_GH}/dispatches" | cut -f 2- >> "${FAKE_GH}/listing"
    printf 'Created workflow_dispatch event for ci.yml at %s\n' "$5"
    ;;
  'run list')
    fail_with run-list
    cat -- "${FAKE_GH}/listing"
    ;;
  'run view')
    if [[ $4 == --log-failed ]]; then
      fail_with log-failed
      cat -- "${FAKE_GH}/runs/$3/log"
    else
      fail_with run-view
      cat -- "${FAKE_GH}/runs/$3/view"
    fi
    ;;
  *) exit 2 ;;
esac
STANDIN
chmod +x "${fake}/bin/gh"

# Starts a fresh fixture with no runs.
reset_fixture() {
  rm -rf -- "${fake}/runs" "${fake}"/*-error
  mkdir -p -- "${fake}/runs"
  : > "${fake}/calls"
  : > "${fake}/listing"
  : > "${fake}/dispatches"
}

# Makes dispatch N add a workflow_dispatch run RUN of `feature` at the
# revision, followed by any further `<run> <event> <branch> <sha>` runs.
on_dispatch() {
  local n=$1
  printf '%s\t%s\tworkflow_dispatch\tfeature\t%s\n' "${n}" "$2" "${revision}" >> "${fake}/dispatches"
  shift 2
  while (($# > 0)); do
    printf '%s\t%s\t%s\t%s\t%s\n' "${n}" "$1" "$2" "$3" "$4" >> "${fake}/dispatches"
    shift 4
  done
}

# Writes run RUN's status and conclusion, then `<job> <conclusion>` jobs. Jobs
# not named succeed.
run_view() {
  local dir="${fake}/runs/$1" job
  mkdir -p -- "${dir}"
  printf '%s\t%s\n' "$2" "$3" > "${dir}/view"
  shift 3
  local -A failed=()
  while (($# > 0)); do
    failed[$1]=$2
    shift 2
  done
  for job in lint 'test (1/3)' 'test (2/3)' 'test (3/3)' \
    'dashboard (1/9)' 'dashboard (2/9)' 'dashboard (3/9)' 'dashboard (4/9)' \
    'dashboard (5/9)' 'dashboard (6/9)' 'dashboard (7/9)' 'dashboard (8/9)' \
    'dashboard (9/9)'; do
    printf '%s\t%s\n' "${job}" "${failed[${job}]:-success}" >> "${dir}/view"
  done
}

# Appends a `--log-failed` line for run RUN's JOB.
log_line() {
  printf '%s\tRun the dashboard browser suite\t2026-10-05T04:45:36.9552081Z %s\n' "$2" "$3" >> "${fake}/runs/$1/log"
}

# Runs the command with the stand-in from the repository on branch `feature`,
# logging to <name>.log and setting command_status for expect_report.
# shellcheck disable=SC2034
run_repeat() {
  local name=$1
  shift
  command_status=0
  (
    cd -- "${repository}"
    PATH="${fake}/bin:${PATH}" FAKE_GH="${fake}" FAKE_REVISION="${revision}" \
      CI_REPEAT_POLL_SECONDS=0 "${BASH}" "${source_dir}/scripts/ci-repeat.sh" "$@"
  ) > "${temporary_dir}/${name}.log" 2>&1 || command_status=$?
}

# Fails unless the stand-in's calls, filtered by the grep pattern, are stdin.
expect_calls() {
  local case=$1
  shift
  cat > "${temporary_dir}/expected-calls"
  grep -E "$@" "${fake}/calls" > "${temporary_dir}/calls" || true
  if ! diff -u -- "${temporary_dir}/expected-calls" "${temporary_dir}/calls" > "${temporary_dir}/diff"; then
    printf 'FAIL: the %s gh calls differ:\n' "${case}" >&2
    cat -- "${temporary_dir}/diff" >&2
    exit 1
  fi
}
