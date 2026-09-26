#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

# Tests run in child shells, so check the bash they will actually use. Bash 5
# is the floor: this runner, normally that same PATH bash, reads EPOCHREALTIME.
test_bash=$(command -v bash)
# Expand BASH_VERSION in the child shell, not this runner.
# shellcheck disable=SC2016
test_bash_version=$("${test_bash}" -c 'printf "%s" "${BASH_VERSION}"')
if [[ ${test_bash_version%%.*} -lt 5 ]]; then
  printf 'FAIL: shell tests require Bash 5 or newer; resolved %s (version %s).\n' \
    "${test_bash}" "${test_bash_version}" >&2
  printf 'Install Bash 5 or newer and put its bin directory first on PATH, then rerun the tests.\n' >&2
  exit 1
fi

# The runner is the one scheduler: every shell check and every `node --test`
# file is its own job, and no job runs a worker pool of its own. Each job keeps
# a private temp directory. Plan 073 capped the pool at four because elapsed-time
# waits starved at eight; tests now wait for events, so the default is one slot
# per online CPU. OPEN_DOUGH_TEST_JOBS overrides it with any count of 1 or more.
job_slots=${OPEN_DOUGH_TEST_JOBS:-$(getconf _NPROCESSORS_ONLN)}
if ((job_slots < 1)); then
  job_slots=1
fi

output_root=$(mktemp -d)
# fd 4 keeps the runner's stderr while it goes to a launching job's launch file
# (see the launch loop); an exit mid-launch restores it and shows that file.
exec 4>&2
launching=''
# shellcheck disable=SC2329 # Invoked by the EXIT trap below.
finish() {
  exec 2>&4
  [[ ! -s ${launching} ]] || cat -- "${launching}" >&2
  rm -rf -- "${output_root}"
}
trap finish EXIT
mkfifo "${output_root}/slots"
exec 3<> "${output_root}/slots"
for ((slot = 0; slot < job_slots; slot++)); do
  printf '\n' >&3
done

# Prints the seconds between two EPOCHREALTIME readings, to a tenth.
elapsed_seconds() {
  awk -v start="$1" -v end="$2" 'BEGIN { printf "%.1f\n", end - start }'
}

node_reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs"
run_job() {
  exec 2>&4 4>&-
  local index=$1 kind=$2 label=$3
  local log="${output_root}/${index}.log" launch="${output_root}/${index}.launch"
  local job_status=0 started=${EPOCHREALTIME}
  if [[ ${kind} == node ]]; then
    node --test --test-reporter="${node_reporter}" "${label}" > "${log}" 2>&1 \
      || job_status=$?
  else
    "${test_bash}" "${label}" > "${log}" 2>&1 || job_status=$?
  fi
  # Job control has the runner and the job each put the job into a new group
  # led by the job. On macOS those two calls can race; the loser fails with
  # EPERM, and when that is the job, Bash prints one `child setpgid` line
  # before the job starts. A group whose id is this job's pid exists only if
  # one of the two calls moved the job into it, so only then is a launch file
  # of exactly that line emptied. Any other launch output stays and fails the run.
  local lost_race="${0}: child setpgid (${BASHPID} to ${BASHPID}): Operation not permitted"
  if [[ -s ${launch} ]] && kill -0 -- "-${BASHPID}" 2> /dev/null \
    && cmp -s - "${launch}" <<< "${lost_race}"; then
    : > "${launch}"
  fi
  printf '%s\n' "${job_status}" > "${output_root}/${index}.status"
  elapsed_seconds "${started}" "${EPOCHREALTIME}" > "${output_root}/${index}.seconds"
  printf '\n' >&3
}

# OPEN_DOUGH_TEST_DIR names another directory of checks, such as substitutes
# in a runner test; it replaces the suite's own checks entirely.
test_dir=${OPEN_DOUGH_TEST_DIR:-tests}
declare -A job_kinds=()
discovered=()
add_job() {
  job_kinds[$2]=$1
  discovered+=("$2")
}

find "${test_dir}" -type f -name '*.sh' ! -path "${test_dir}/support/*" -print0 \
  > "${output_root}/tests"
while IFS= read -r -d '' test_file; do
  add_job shell "${test_file}"
done < "${output_root}/tests"

# `node-test-files` lists glob patterns, relative to the repository root, of
# `node --test` files; each matching file is scheduled as its own job.
if [[ -f ${test_dir}/node-test-files ]]; then
  while read -r pattern; do
    [[ -z ${pattern} || ${pattern} == '#'* ]] && continue
    while IFS= read -r node_file; do
      add_job node "${node_file}"
    done < <(compgen -G "${pattern}" || true)
  done < "${test_dir}/node-test-files"
fi

if [[ -z ${OPEN_DOUGH_TEST_DIR:-} ]]; then
  add_job shell 'scripts/check-self-installation.sh'
fi

# `longest-first` names known long jobs, longest first. They start before the
# rest so the longest job does not begin last; unknown names are ignored.
labels=()
declare -A scheduled=()
if [[ -f ${test_dir}/longest-first ]]; then
  while read -r label; do
    [[ -z ${label} || ${label} == '#'* ]] && continue
    if [[ -n ${job_kinds[${label}]+set} && -z ${scheduled[${label}]+set} ]]; then
      labels+=("${label}")
      scheduled[${label}]=1
    fi
  done < "${test_dir}/longest-first"
fi
for label in "${discovered[@]}"; do
  [[ -n ${scheduled[${label}]+set} ]] || labels+=("${label}")
done

# Prints one started job's wall seconds: those its job recorded, or, when the
# job left none, the time from its start until the runner observed it ended.
job_seconds() {
  local index=$1 seconds
  if [[ -e ${output_root}/${index}.seconds ]]; then
    read -r seconds < "${output_root}/${index}.seconds"
    printf '%s\n' "${seconds}"
  else
    elapsed_seconds "${job_started[index]}" "${observed_at}"
  fi
}

# Reports one started job from what the runner observed: the exit status it
# recorded, or none. Only failing checks are reported, each with its own
# captured output. A passing check must be silent, so a check that exits 0 but
# wrote anything fails too. On an interrupt, a job still running, or one that
# ended from the same signal, is reported as interrupted with its elapsed time
# and the tail of its output. Otherwise a job that ended without recording a
# status, such as one whose shell was killed, failed. A reported job sets the
# run's status to 1.
report_job() {
  local index=$1 log="${output_root}/$1.log" launch="${output_root}/$1.launch"
  local job_status='' seconds heading show_log=(cat --)
  if [[ -e ${output_root}/${index}.status ]]; then
    read -r job_status < "${output_root}/${index}.status"
  fi
  if [[ -n ${interrupt_status} &&
    (-z ${job_status} || ${job_status} -eq ${interrupt_status}) ]]; then
    seconds=$(job_seconds "${index}")
    heading="INTERRUPTED: ${labels[index]} (after ${seconds}s); last lines of its output:"
    show_log=(tail -n 40 --)
  elif [[ -z ${job_status} ]]; then
    heading="FAIL: ${labels[index]} (ended without recording an exit status)"
  elif [[ ${job_status} -ne 0 ]]; then
    heading="FAIL: ${labels[index]}"
  elif [[ -s ${log} || -s ${launch} ]]; then
    heading="FAIL: ${labels[index]} (passed but printed output)"
  else
    # An explicit status: under the interrupt trap, Bash before 5.3 gives a
    # bare `return` the interrupted `wait`'s status, which `set -e` ends on.
    return 0
  fi
  {
    printf '%s\n' "${heading}"
    [[ ! -s ${launch} ]] || cat -- "${launch}"
    "${show_log[@]}" "${log}"
  } >&2
  status=1
}

# Each job runs in a process group of its own: job control is on only while
# the job starts, which also keeps INT from being ignored in it. Stopping a job
# therefore reaches everything it started, without `setsid`, which macOS lacks.
# Workers a check deliberately detaches leave the group and stay that check's
# own teardown. A terminal's Ctrl-C reaches the runner but not the jobs, so on
# INT or TERM the runner stops the jobs still running, reports every started
# job, and exits with the signal's status. Logs are removed after the report.
interrupt_status=''
status=0
job_pids=()
job_started=()
# shellcheck disable=SC2329 # Invoked by the INT and TERM traps below.
interrupt() {
  trap '' INT TERM
  # A launch cut short here is reported with its job below.
  exec 2>&4
  launching=''
  interrupt_status=$2
  observed_at=${EPOCHREALTIME}
  local index pgid stopped=()
  for index in "${!job_pids[@]}"; do
    if [[ ! -e ${output_root}/${index}.status ]]; then
      kill -TERM -- "-${job_pids[index]}" 2> /dev/null || true
      stopped+=("${job_pids[index]}")
    fi
  done
  wait || true
  # A process that outlived TERM in a stopped group does not outlive KILL.
  for pgid in "${stopped[@]}"; do
    kill -KILL -- "-${pgid}" 2> /dev/null || true
  done
  printf 'Test run interrupted by SIG%s.\n' "$1" >&2
  for index in "${!job_started[@]}"; do
    report_job "${index}"
  done
  exit "${interrupt_status}"
}
trap 'interrupt INT 130' INT
trap 'interrupt TERM 143' TERM

for index in "${!labels[@]}"; do
  read -r -u 3
  job_started[index]=${EPOCHREALTIME}
  # What Bash writes while starting the job, before the job's own output
  # redirection, goes to its launch file; the job and its report handle it.
  launching="${output_root}/${index}.launch"
  exec 2> "${launching}"
  set -m
  run_job "${index}" "${job_kinds[${labels[index]}]}" "${labels[index]}" < /dev/null &
  set +m
  exec 2>&4
  launching=''
  job_pids[index]=$!
done

wait
observed_at=${EPOCHREALTIME}

for index in "${!labels[@]}"; do
  report_job "${index}"
done

# OPEN_DOUGH_TEST_TIMES names a file that receives each job's wall seconds and
# label, longest first, for profiling and for keeping `longest-first` current.
if [[ -n ${OPEN_DOUGH_TEST_TIMES:-} ]]; then
  for index in "${!labels[@]}"; do
    seconds=$(job_seconds "${index}")
    printf '%s\t%s\n' "${seconds}" "${labels[index]}"
  done | sort -rn > "${OPEN_DOUGH_TEST_TIMES}"
fi

exit "${status}"
