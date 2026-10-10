#!/usr/bin/env bash
# Runs the dashboard suite repeatedly on this machine and reports each run:
#   bash scripts/dashboard-repeat.sh <repetitions> [--load] [--fresh] [spec…]
# Runs `npm run test:dashboard -- [spec…]` in the checkout it is started from,
# that many times, one after another, at Playwright's local default worker
# count (CI's settings are not passed on). With --load, one `yes > /dev/null`
# burner per online core runs during each run, started just before it and
# stopped just after, and always stopped when the script ends or is
# interrupted. With --fresh, the first repetition runs in a new Git worktree
# of the current HEAD under the OS temporary directory, after its own
# `npm ci` and with no earlier suite run there; the worktree is removed after
# that run, and later repetitions run in the starting checkout. NODE_ENV and
# npm_config_local_prefix are unset for `npm ci` and every run: a session the
# dashboard launched carries both, and `npm ci` would then install no
# development dependencies, into another prefix.
# Per run it prints the exit status, seconds, the one-minute load average
# before and after, each failing location from the quiet reporter's `FAIL:`
# (and `PRINTED:`) lines and the first line of any error outside a test, and
# the kept directory from its `Kept:` line. A fresh worktree's kept
# directory is moved to the same place in this checkout before the worktree
# is removed. A failing run that names no kept
# directory shows its last output lines instead. Exits 0 only when every run
# passed, 1 otherwise; a malformed repetition count is refused (exit 2).
# DASHBOARD_REPEAT_SUITE and DASHBOARD_REPEAT_INSTALL replace the suite command
# (given the specs) and the install command, for the script's own check.
set -euo pipefail

usage() {
  printf '%s\nUsage: bash scripts/dashboard-repeat.sh <repetitions> [--load] [--fresh] [spec…]\n' "$1" >&2
  exit 2
}

(($# >= 1)) || usage 'Name the number of repetitions.'
[[ $1 =~ ^[1-9][0-9]*$ ]] || usage "The number of repetitions must be a positive whole number, not \"$1\"."
readonly repetitions=$1
shift
load=0 fresh=0
specs=()
for argument in "$@"; do
  case ${argument} in
    --load) load=1 ;;
    --fresh) fresh=1 ;;
    *) specs+=("${argument}") ;;
  esac
done
readonly load fresh
condition=''
((load == 0)) || condition=' under burners'
readonly condition
checkout=$(git rev-parse --show-toplevel)
readonly checkout
read -r -a suite <<< "${DASHBOARD_REPEAT_SUITE:-npm run --silent test:dashboard --}"
read -r -a install <<< "${DASHBOARD_REPEAT_INSTALL:-npm ci --no-audit --no-fund}"

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/dough-dashboard-repeat.XXXXXX")
worktree=''
suite_pid=''
burners=()

stop_burners() {
  local pid
  for pid in ${burners[@]+"${burners[@]}"}; do
    kill "${pid}" 2> /dev/null || true
    wait "${pid}" 2> /dev/null || true
  done
  burners=()
}

remove_worktree() {
  [[ -n ${worktree} ]] || return 0
  git -C "${checkout}" worktree remove --force -- "${worktree}" 2> /dev/null \
    || rm -rf -- "${worktree}"
  git -C "${checkout}" worktree prune
  worktree=''
}

# Prints PID and every process below it, parents first.
process_tree() {
  local child
  printf '%s\n' "$1"
  for child in $(pgrep -P "$1" || true); do
    process_tree "${child}"
  done
}

# shellcheck disable=SC2329 # Invoked by the traps below.
finish() {
  # npm does not pass a signal on to the runner and its workers, so an
  # interrupted run is stopped as a whole tree, listed before any of it ends.
  local tree
  if [[ -n ${suite_pid} ]]; then
    tree=$(process_tree "${suite_pid}")
    # shellcheck disable=SC2086 # One process ID per word.
    kill ${tree} 2> /dev/null || true
    wait "${suite_pid}" 2> /dev/null || true
  fi
  stop_burners
  remove_worktree
  rm -rf -- "${work_dir}"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

load_average() {
  uptime | sed -E 's/.*load averages?: *([0-9.]+).*/\1/'
}

start_burners() {
  local core cores
  cores=$(getconf _NPROCESSORS_ONLN)
  for ((core = 0; core < cores; core++)); do
    yes > /dev/null &
    burners+=("$!")
  done
}

# Runs COMMAND… in DIRECTORY without the variables that change what npm
# installs or how many workers run, with its output in LOG, and sets status.
run_in() {
  local directory=$1 log=$2
  shift 2
  (
    cd -- "${directory}"
    exec env -u NODE_ENV -u npm_config_local_prefix -u CI \
      -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS "$@"
  ) > "${log}" 2>&1 < /dev/null &
  suite_pid=$!
  status=0
  wait "${suite_pid}" || status=$?
  suite_pid=''
}

make_fresh_worktree() {
  worktree="${work_dir}/checkout"
  git -C "${checkout}" worktree add --quiet --detach -- "${worktree}" HEAD
  run_in "${worktree}" "${work_dir}/install.log" "${install[@]}"
  if ((status != 0)); then
    printf 'The fresh worktree install (%s) exited %s:\n' "${install[*]}" "${status}"
    tail -n 20 -- "${work_dir}/install.log" | sed 's/^/  /'
    exit 1
  fi
}

failed=0
for ((rep = 1; rep <= repetitions; rep++)); do
  directory=${checkout} label="Run ${rep}"
  if ((fresh == 1 && rep == 1)); then
    make_fresh_worktree
    directory=${worktree} label="Run ${rep} (fresh worktree)"
  fi
  log="${work_dir}/run-${rep}.log"
  ((load == 0)) || start_burners
  before=$(load_average)
  started=${SECONDS}
  run_in "${directory}" "${log}" ${suite[@]+"${suite[@]}"} ${specs[@]+"${specs[@]}"}
  seconds=$((SECONDS - started))
  after=$(load_average)
  stop_burners
  printf '%s%s: exit %s, %s s, load %s -> %s\n' "${label}" "${condition}" \
    "${status}" "${seconds}" "${before}" "${after}"
  ((status == 0)) || failed=$((failed + 1))
  # Each failing test's headline, and an error outside any test with its
  # first line.
  awk '/^(FAIL|PRINTED): / { print "  " $0 }
    error { sub(/^ +/, ""); print "  ERROR outside a test: " $0; error = 0 }
    /^ERROR outside a test:$/ { error = 1 }' "${log}"
  kept=$(sed -n 's/^Kept: //p' "${log}" | tail -n 1)
  # The reporter names it relative to where the run started, so it moves to
  # the same place in this checkout.
  if [[ -n ${kept} && ${directory} != "${checkout}" ]]; then
    mkdir -p -- "$(dirname -- "${checkout}/${kept}")"
    mv -- "${directory}/${kept}" "${checkout}/${kept}"
  fi
  if [[ -n ${kept} ]]; then
    printf '  Kept: %s\n' "${kept}"
  elif ((status != 0)); then
    printf '  No kept directory; its last output:\n'
    tail -n 20 -- "${log}" | sed 's/^/    /'
  fi
  [[ ${directory} == "${checkout}" ]] || remove_worktree
done

printf 'Passed %s of %s runs.\n' "$((repetitions - failed))" "${repetitions}"
((failed == 0))
