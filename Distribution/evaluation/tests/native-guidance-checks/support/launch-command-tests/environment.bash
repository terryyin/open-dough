#!/usr/bin/env bash
# Shared arm of the launch-command-tests environment checks
# (native-guidance-check-launch-command-tests-environment*.sh): the real
# materialization and, on macOS, the real write sandbox (native_codex_wrap)
# over a credential-free stand-in runtime layout with protected source
# enabled. Sources the runner and case.bash; the caller sets source_dir.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced runner and case; runner, case and caller globals; group_status is read by callers; the platform check reads what uname gives.

environment_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
export NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${source_dir}
source "${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests/case.bash"

# Materializes the arm WORK/run, enters its workspace and, on macOS, prepares
# the sandbox with PROTECTED as protected source.
environment_arm() {
  local work=$1 protected=$2 runtime="$1/runtime"
  root="${work}/run"
  mkdir -p -- "${root}"
  case_materialize "${root}" "${source_dir}" codex
  cd -- "${root}/workspace" || exit
  [[ $(uname -s) == Darwin ]] || return 0
  mkdir -p -- "${runtime}/packages/standalone/current/bin" "${work}/host"
  : > "${runtime}/packages/standalone/current/bin/codex"
  ln -s "${runtime}/packages/standalone/current/bin/codex" "${work}/host/codex"
  PATH="${work}/host:${PATH}" native_codex_prepare "${root}" "${protected}"
  [[ ${native_codex_isolate} == 1 ]]
}

# Leaves the arm's workspace in reference outcome NAME (NAME.diff of this
# directory, as qualify.bash applies it), outside any participant.
apply_outcome() {
  git -C "${root}/workspace" apply "${environment_support_dir}/$1.diff"
}

# Runs GROUP's (backend or e2e) owning specs through the sandbox, keeping
# NAME's JSON report inside the arm; leaves its exit status in group_status.
run_group() {
  local name=$1 config=dashboard/backend.playwright.config.ts specs=("${case_backend_specs[@]}")
  if [[ $2 == e2e ]]; then config=e2e/playwright.config.ts specs=("${case_e2e_specs[@]}"); fi
  native_codex_wrap env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
    "PLAYWRIGHT_JSON_OUTPUT_NAME=${root}/${name}.json" \
    npx playwright test --config "${config}" --reporter=json "${specs[@]}"
  group_status=0
  "${native_codex_command[@]}" > "${root}/${name}.log" 2>&1 || group_status=$?
}

# NAME's report holds exactly PASSED/FAILED tests, no skip, flake or global error.
counts_are() {
  jq -e --argjson passed "$2" --argjson failed "$3" \
    '.stats.expected == $passed and .stats.unexpected == $failed and .stats.skipped == 0
      and .stats.flaky == 0 and (.errors | length) == 0' "${root}/$1.json" > /dev/null \
    || {
      echo "FAIL: $1 is not $2/$3" >&2
      jq -c '{stats, errors, failed: [.. | objects | select(has("results")) | .results[]
        | select(.status != "passed" and .status != "skipped") | .error.message]}' "${root}/$1.json" >&2 \
        || tail -n 40 "${root}/$1.log" >&2
      return 1
    }
}
