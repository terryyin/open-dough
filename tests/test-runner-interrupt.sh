#!/usr/bin/env bash
# An interrupted run reports the checks still running, or ended by the same
# signal, with their elapsed time and output tail; it stops their process
# groups and exits with the signal's status. Passing checks stay silent.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/wait-for.bash
source "${source_dir}/tests/helpers/wait-for.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/lost-setpgid-race.bash
source "${source_dir}/scripts/lost-setpgid-race.bash"
temporary_dir=$(mktemp -d)
checks="${temporary_dir}/checks"
cleanup() {
  # Kill only check scripts by their exact paths. A broad "${checks}/" pattern
  # can match unrelated argv that merely embeds the directory string.
  local check
  for check in "${checks}"/*.sh; do
    [[ -e ${check} ]] || continue
    pkill -KILL -f -- "${check}" 2> /dev/null || true
  done
  rm -rf -- "${temporary_dir}"
}
trap cleanup EXIT
mkdir -p -- "${checks}"
blocked="${temporary_dir}/blocked"
mkfifo -- "${blocked}"

write_check() {
  printf '#!/usr/bin/env bash\nset -euo pipefail\n%s\n' "$2" > "${checks}/$1"
}

# Announce with Bash builtins: an external marker can leave Bash waiting on
# its child when INT arrives, which Bash can disregard if that child exits
# normally. Ready precedes output and the FIFO no one writes, so a mid-start
# TERM still records the started check by its unique command path.
write_blocking_check() {
  write_check "$1" ": > '${temporary_dir}/$1.ready'
echo $1-printed
read -r _ < '${blocked}'"
}
write_check pass-a.sh 'true'
write_check pass-b.sh 'true'
write_blocking_check never-ending.sh

# One slot and this order make every earlier check end before the next starts,
# so the passing checks have finished when the never-ending check is ready:
# the named checks are listed with falling seconds, so they start in the
# given order, and an unlisted check starts after them.
order() {
  local name seconds=$#
  local -a durations=()
  for name in "$@"; do
    durations+=("${seconds}" "${checks}/${name}")
    seconds=$((seconds - 1))
  done
  node "${source_dir}/tests/support/job-duration-list.mjs" "${durations[@]}" > "${checks}/longest-first"
}

# Job control starts the runner in its own process group with INT not ignored;
# a non-interactive shell otherwise starts background commands ignoring INT.
# What Bash writes while starting the runner, before the runner's own
# redirection, goes to the run's launch file; await_ready checks it.
# Clear inherited OPEN_DOUGH_TEST_* so only the intentional JOBS/DIR settings
# apply: nested suites own their settings (tests/runner-settings.md).
start_runner() {
  local -a env_clear=()
  local name
  rm -f -- "${temporary_dir}"/*.ready
  launch="${temporary_dir}/$1.launch"
  for name in $(compgen -e OPEN_DOUGH_TEST_ || true); do
    env_clear+=(-u "${name}")
  done
  exec 5>&2 2> "${launch}"
  set -m
  # env -u clears inherited OPEN_DOUGH_TEST_* without putting ${checks} on
  # argv: cleanup's pkill -f "${checks}/" must not match the nested runner.
  # ${arr[@]+...} keeps set -u from treating an empty clear list as unbound.
  # shellcheck disable=SC2086 # intentional: empty clear list must expand to nothing
  env ${env_clear[@]+"${env_clear[@]}"} \
    OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_DIR="${checks}" \
    "${BASH}" "${source_dir}/scripts/test.sh" > "${temporary_dir}/$1.log" 2>&1 &
  set +m
  exec 2>&5 5>&-
  runner=$!
}

# Only a lost setpgid race's launch line is accepted; any other launch output
# fails the test.
expect_quiet_launch() {
  if [[ -s ${launch} ]] && ! lost_setpgid_race "${runner}" "${launch}"; then
    printf 'FAIL: starting the runner printed:\n' >&2
    cat -- "${launch}" >&2
    exit 1
  fi
}

# Nested scripts/test.sh sources its environment and modules, runs
# test-jobs.sh (including the node share allocator), then JOBS=1 runs the
# ordered prefix checks before the named check touches ready. Under contested
# CI CPU that lifecycle routinely exceeds 30s; 90s covers it without borrowing
# the 180s per-job safety ceiling.
dump_nested_runner() {
  local log
  [[ ! -e ${launch} ]] || cat -- "${launch}" >&2
  for log in "${temporary_dir}"/*.log; do
    [[ -e ${log} ]] || continue
    cat -- "${log}" >&2
  done
}

await_ready() {
  if ! wait_for "$1 to start in the runner" 90 \
    "[[ -e ${temporary_dir}/$1.ready ]] || ! kill -0 ${runner} 2> /dev/null"; then
    # Ready may land on the deadline edge after the last failed poll.
    if [[ ! -e ${temporary_dir}/$1.ready ]]; then
      printf 'FAIL: timed out waiting for %s to start; nested runner launch and log:\n' \
        "$1" >&2
      dump_nested_runner
      exit 1
    fi
  fi
  if [[ ! -e ${temporary_dir}/$1.ready ]]; then
    printf 'FAIL: the runner ended before %s started.\n' "$1" >&2
    dump_nested_runner
    exit 1
  fi
  if ! pgrep -f -- "${checks}/$1" > /dev/null; then
    printf 'FAIL: %s announced it was running, but no process runs it.\n' "$1" >&2
    exit 1
  fi
  # A running check means the runner started, so its launch output is complete.
  expect_quiet_launch
}

# Sends SIGNAL to the runner started for RUN, then asserts that the runner
# exits with STATUS and announces the interrupt. A runner that ignored the
# signal would keep running, so its exit is awaited with a bound.
interrupt_runner() {
  local signal=$1 expected=$2 log="${temporary_dir}/$3.log" runner_status=0
  kill "-${signal}" "${runner}"
  wait_for "the runner to exit after SIG${signal}" 30 "! kill -0 ${runner} 2> /dev/null"
  wait "${runner}" || runner_status=$?
  if ((runner_status != expected)); then
    printf 'FAIL: the runner exited %s after %s, not %s.\n' \
      "${runner_status}" "${signal}" "${expected}" >&2
    cat -- "${log}" >&2
    exit 1
  fi
  expect_in_log "${log}" -F -x -- "Test run interrupted by SIG${signal}."
}

assert_interrupted() {
  local log="${temporary_dir}/$1.log" check=$2
  expect_in_log "${log}" -E -- "^INTERRUPTED: ${checks}/${check} \\(after [0-9]+\\.[0-9]s\\); last lines of its output:\$"
  expect_in_log "${log}" -F -x -- "${check}-printed"
  wait_for "no process from ${check} to remain" 10 \
    "! pgrep -f -- '${checks}/${check}' > /dev/null"
}

# TERM: only the never-ending check is listed; the run exits 143.
order pass-a.sh pass-b.sh
start_runner term
await_ready never-ending.sh
interrupt_runner TERM 143 term
assert_interrupted term never-ending.sh
if grep -E -- 'pass-(a|b)|FAIL' "${temporary_dir}/term.log"; then
  echo 'FAIL: the TERM report listed more than the never-ending check.' >&2
  exit 1
fi

# INT (Ctrl-C): a check that the same signal already ended is reported as
# interrupted, not as failing, beside the check still running; the run
# exits 130.
write_blocking_check ended-by-int.sh
order pass-a.sh ended-by-int.sh pass-b.sh
start_runner int
await_ready ended-by-int.sh
pkill -INT -f -- "${checks}/ended-by-int.sh"
await_ready never-ending.sh
interrupt_runner INT 130 int
assert_interrupted int ended-by-int.sh
assert_interrupted int never-ending.sh
if grep -E -- 'pass-(a|b)|FAIL' "${temporary_dir}/int.log"; then
  echo 'FAIL: the INT report listed a passing check or a failing one.' >&2
  exit 1
fi
