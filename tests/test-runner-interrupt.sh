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
temporary_dir=$(mktemp -d)
checks="${temporary_dir}/checks"
cleanup() {
  pkill -KILL -f -- "${checks}/" 2> /dev/null || true
  rm -rf -- "${temporary_dir}"
}
trap cleanup EXIT
mkdir -p -- "${checks}"
blocked="${temporary_dir}/blocked"
mkfifo -- "${blocked}"

write_check() {
  printf '#!/usr/bin/env bash\nset -euo pipefail\n%s\n' "$2" > "${checks}/$1"
}

# Each blocking check prints a line, announces that it is running, then opens a
# FIFO no one writes. Its command line carries the check's unique path.
write_blocking_check() {
  write_check "$1" "echo $1-printed
touch -- '${temporary_dir}/$1.ready'
read -r _ < '${blocked}'"
}
write_check pass-a.sh 'true'
write_check pass-b.sh 'true'
write_blocking_check never-ending.sh

# One slot and this order make every earlier check end before the next starts,
# so the passing checks have finished when the never-ending check is ready.
order() {
  printf '%s\n' "$@" | sed "s|^|${checks}/|" > "${checks}/longest-first"
}

# Job control starts the runner in its own process group with INT not ignored;
# a non-interactive shell otherwise starts background commands ignoring INT.
start_runner() {
  rm -f -- "${temporary_dir}"/*.ready
  set -m
  OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_DIR="${checks}" \
    "${BASH}" "${source_dir}/scripts/test.sh" > "${temporary_dir}/$1.log" 2>&1 &
  set +m
  runner=$!
}

await_ready() {
  wait_for "$1 to start in the runner" 30 \
    "[[ -e ${temporary_dir}/$1.ready ]] || ! kill -0 ${runner} 2> /dev/null"
  if [[ ! -e ${temporary_dir}/$1.ready ]]; then
    printf 'FAIL: the runner ended before %s started.\n' "$1" >&2
    cat -- "${temporary_dir}"/*.log >&2
    exit 1
  fi
  if ! pgrep -f -- "${checks}/$1" > /dev/null; then
    printf 'FAIL: %s announced it was running, but no process runs it.\n' "$1" >&2
    exit 1
  fi
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
