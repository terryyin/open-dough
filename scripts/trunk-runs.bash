# shellcheck shell=bash
# The recent trunk runs the CI job-time report reads, which of them were used,
# and its refusal, sourced by scripts/ci-job-times.sh after
# scripts/gh-message.bash.

# Says why no recent trunk timings can be reported, and exits 1.
no_timings() {
  printf 'No recent trunk timings were found: %s\n' "$1" >&2
  exit 1
}

# Lists the last 10 successful ci.yml runs on main, newest first, and calls
# READ_RUN RUN for each, keeping gh's stderr in WORK_DIR/gh.err. READ_RUN sets
# skip_reason when RUN has no readable WHAT; that run is skipped and not
# counted. Sets used, skipped, newest and oldest over the runs used; refuses
# when gh fails, lists none, or no run had readable WHAT.
read_trunk_runs() {
  local work_dir=$1 what=$2 read_run=$3 runs message run created last_error=''
  if ! runs=$(gh run list --workflow ci.yml --branch main --status success --limit 10 \
    --json databaseId,createdAt \
    --jq '.[] | "\(.databaseId)\t\(.createdAt)"' 2> "${work_dir}/gh.err"); then
    message=$(gh_message "${work_dir}/gh.err")
    no_timings "gh run list failed: ${message}"
  fi
  [[ -n ${runs} ]] || no_timings 'gh listed no successful ci.yml runs on main.'
  used=0 skipped=0 newest='' oldest=''
  while IFS=$'\t' read -r run created; do
    skip_reason=''
    "${read_run}" "${run}"
    if [[ -n ${skip_reason} ]]; then
      skipped=$((skipped + 1))
      last_error=${skip_reason}
      continue
    fi
    used=$((used + 1))
    [[ -n ${newest} ]] || newest=${created}
    oldest=${created}
  done <<< "${runs}"
  ((used > 0)) || no_timings "none of the ${skipped} listed runs had readable ${what} (last gh message: ${last_error})"
}

# Prints `TITLE: <used> successful ci.yml runs on main, <oldest> to <newest>`,
# then the skipped count of runs without readable WHAT, as one sentence.
print_trunk_runs_used() {
  printf '%s: %s successful ci.yml runs on main, %s to %s' \
    "$1" "${used}" "${oldest}" "${newest}"
  ((skipped == 0)) || printf ' (%s without readable %s skipped)' "${skipped}" "$2"
  printf '.\n'
}
