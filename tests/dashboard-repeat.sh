#!/usr/bin/env bash
# scripts/dashboard-repeat.sh runs the dashboard suite repeatedly and reports
# each run: its exit, seconds, load before and after, failing and printing
# locations, and kept directory; a fresh first run in its own worktree after
# its own install, with that run's kept directory moved into the starting
# checkout and the worktree removed; one burner per core during a loaded run,
# stopped after it; a failing run without a kept directory shown by its last
# output; burners, run, and worktree stopped and removed on interruption; and
# a malformed repetition count refused. Substitute suite and install commands
# stand in for Playwright and npm, so the check starts neither.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-report.bash
source "${source_dir}/tests/helpers/expect-report.bash"
fake="${temporary_dir}/fake"
mkdir -- "${fake}" "${temporary_dir}/tmp"
repository="${temporary_dir}/repository"
git init -q -- "${repository}"
git -C "${repository}" -c user.name=t -c user.email=t@example.com \
  commit -q --allow-empty -m start
repository=$(cd -P -- "${repository}" && pwd)

# The suite stand-in logs where it ran, NODE_ENV and npm_config_local_prefix,
# its arguments, and its parent's `yes` burners, then plays the next line of
# `scenario`: `pass`; `fail` (keeps a stamped directory, prints FAIL, PRINTED,
# ERROR, and Kept lines, exits 1); `crash` (prints and exits 3); or `hang`
# (waits until stopped on a process of its own, named in `below`).
cat > "${fake}/suite" << 'STANDIN'
#!/usr/bin/env bash
set -euo pipefail
count=$(($(grep -c '^run ' "${FAKE}/calls" || true) + 1))
printf 'run %s %s %s\n' "$(pwd -P)" "${NODE_ENV-unset}/${npm_config_local_prefix-unset}" "$*" >> "${FAKE}/calls"
pgrep -P "${PPID}" -x yes > "${FAKE}/burners-${count}" || true
case $(sed -n "${count}p" "${FAKE}/scenario") in
  pass) ;;
  fail)
    kept="dashboard/test-results/stamp-${count}"
    mkdir -p -- "${kept}"
    printf 'the report\n' > "${kept}/report.txt"
    printf 'FAIL: dashboard/tests/a.spec.ts:7 › a › first (failed)\n    Error: timed out\n\n'
    printf 'FAIL: dashboard/tests/b.spec.ts:9 › b (timedOut)\n\n'
    printf 'PRINTED: dashboard/tests/c.spec.ts:3 › c passed but wrote output\n    noise\n\n'
    printf 'ERROR outside a test:\n    Error: No tests found.\n    More.\n\nKept: %s\n' "${kept}"
    exit 1
    ;;
  crash)
    printf 'npm error one\nnpm error two\n'
    exit 3
    ;;
  hang)
    sleep 30 &
    printf '%s\n' "$!" > "${FAKE}/below"
    wait
    ;;
esac
STANDIN
cat > "${fake}/install" << 'STANDIN'
#!/usr/bin/env bash
printf 'install %s %s\n' "$(pwd -P)" "${NODE_ENV-unset}/${npm_config_local_prefix-unset}" >> "${FAKE}/calls"
STANDIN
chmod +x "${fake}/suite" "${fake}/install"

# Runs the script NAME with ARGS… from the repository, as a session the
# dashboard launched would (NODE_ENV and npm_config_local_prefix set), with the
# report's seconds and load averages masked in NAME.log.
run_repeat() {
  local name=$1
  shift
  : > "${fake}/calls"
  command_status=0
  (
    cd -- "${repository}"
    FAKE=${fake} TMPDIR="${temporary_dir}/tmp" NODE_ENV=production \
      npm_config_local_prefix=/elsewhere \
      DASHBOARD_REPEAT_SUITE="${fake}/suite" \
      DASHBOARD_REPEAT_INSTALL="${fake}/install" \
      bash "${source_dir}/scripts/dashboard-repeat.sh" "$@"
  ) > "${temporary_dir}/${name}.raw" 2>&1 || command_status=$?
  sed -E 's/, [0-9]+ s, load [0-9.]+ -> [0-9.]+$/, <s> s, load <l> -> <l>/' \
    "${temporary_dir}/${name}.raw" > "${temporary_dir}/${name}.log"
}

expect_calls() {
  if ! diff -u -- - "${fake}/calls" > "${temporary_dir}/diff"; then
    printf 'FAIL: the %s calls differ:\n' "$1" >&2
    cat -- "${temporary_dir}/diff" >&2
    exit 1
  fi
}

expect_no_worktree() {
  local worktrees left
  worktrees=$(git -C "${repository}" worktree list --porcelain | grep -c '^worktree ')
  left=$(ls -A -- "${temporary_dir}/tmp")
  if ((worktrees != 1)) || [[ -n ${left} ]]; then
    printf 'FAIL: %s left a worktree or temporary files behind:\n' "$1" >&2
    git -C "${repository}" worktree list >&2
    ls -A -- "${temporary_dir}/tmp" >&2
    exit 1
  fi
}

expect_stopped() {
  local pid
  while read -r pid; do
    if kill -0 "${pid}" 2> /dev/null; then
      printf 'FAIL: %s left process %s running.\n' "$1" "${pid}" >&2
      exit 1
    fi
  done < "$2"
}

# fresh: the first run is the fresh worktree's, after its own install, both
# without NODE_ENV and npm_config_local_prefix; its kept directory moves into
# the repository, and the worktree is removed before the second run, which
# runs in the repository.
printf 'fail\npass\n' > "${fake}/scenario"
run_repeat fresh 2 --fresh a.spec.ts b.spec.ts
expect_report fresh 1 << 'REPORT'
Run 1 (fresh worktree): exit 1, <s> s, load <l> -> <l>
  FAIL: dashboard/tests/a.spec.ts:7 › a › first (failed)
  FAIL: dashboard/tests/b.spec.ts:9 › b (timedOut)
  PRINTED: dashboard/tests/c.spec.ts:3 › c passed but wrote output
  ERROR outside a test: Error: No tests found.
  Kept: dashboard/test-results/stamp-1
Run 2: exit 0, <s> s, load <l> -> <l>
Passed 1 of 2 runs.
REPORT
fresh_checkout=$(sed -n '1s/^install \([^ ]*\) .*/\1/p' "${fake}/calls")
case ${fresh_checkout} in
  "$(cd -P -- "${temporary_dir}/tmp" && pwd)"/*) ;;
  *)
    printf 'FAIL: the fresh worktree was not under the temporary directory: %s\n' "${fresh_checkout}" >&2
    exit 1
    ;;
esac
expect_calls fresh << CALLS
install ${fresh_checkout} unset/unset
run ${fresh_checkout} unset/unset a.spec.ts b.spec.ts
run ${repository} unset/unset a.spec.ts b.spec.ts
CALLS
expect_in_log "${repository}/dashboard/test-results/stamp-1/report.txt" -x -F 'the report'
expect_no_worktree fresh

# load: one burner per core runs during the run and none after it.
printf 'pass\n' > "${fake}/scenario"
run_repeat load 1 --load
expect_report load 0 << 'REPORT'
Run 1 under burners: exit 0, <s> s, load <l> -> <l>
Passed 1 of 1 runs.
REPORT
burners=$(wc -l < "${fake}/burners-1")
cores=$(getconf _NPROCESSORS_ONLN)
if ((burners != cores)); then
  printf 'FAIL: %s burners ran, not one per core.\n' "${burners}" >&2
  exit 1
fi
expect_stopped load "${fake}/burners-1"

# crash: a failing run that keeps no directory is shown by its last output.
printf 'crash\n' > "${fake}/scenario"
run_repeat crash 1
expect_report crash 1 << 'REPORT'
Run 1: exit 3, <s> s, load <l> -> <l>
  No kept directory; its last output:
    npm error one
    npm error two
Passed 0 of 1 runs.
REPORT

# interrupted: stopping the script stops the run, the processes it started,
# and the burners, and removes the fresh worktree.
printf 'hang\n' > "${fake}/scenario"
: > "${fake}/calls"
(
  cd -- "${repository}"
  exec env FAKE="${fake}" TMPDIR="${temporary_dir}/tmp" \
    DASHBOARD_REPEAT_SUITE="${fake}/suite" \
    DASHBOARD_REPEAT_INSTALL="${fake}/install" \
    bash "${source_dir}/scripts/dashboard-repeat.sh" 1 --load --fresh
) > "${temporary_dir}/interrupted.log" 2>&1 &
script_pid=$!
until [[ -s ${fake}/below ]]; do
  kill -0 "${script_pid}" 2> /dev/null || break
  sleep 0.1
done
pgrep -P "${script_pid}" > "${temporary_dir}/children" || true
kill -TERM "${script_pid}"
command_status=0
wait "${script_pid}" || command_status=$?
if ((command_status != 143)); then
  printf 'FAIL: the interrupted script exited %s, not 143:\n' "${command_status}" >&2
  cat -- "${temporary_dir}/interrupted.log" >&2
  exit 1
fi
expect_stopped interrupted "${temporary_dir}/children"
expect_stopped interrupted "${fake}/below"
expect_no_worktree interrupted

# malformed: a repetition count that is not a positive whole number is refused.
run_repeat malformed 0
expect_report malformed 2 << 'REPORT'
The number of repetitions must be a positive whole number, not "0".
Usage: bash scripts/dashboard-repeat.sh <repetitions> [--load] [--fresh] [spec…]
REPORT
