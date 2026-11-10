# Terminate an owned process group with TERM, a bounded grace, then KILL, and
# wait for a deadline on a FIFO without spawning a sleeper that can leak.
# Shared by the suite runner's per-job safety deadline and native supervision.
# shellcheck shell=bash

owned_process_group_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/helpers/wait-for.bash
# shellcheck disable=SC1091
source "${owned_process_group_support_dir}/tests/helpers/wait-for.bash"

owned_process_group_pgid_of() {
  # shellcheck disable=SC2312 # pgid sampling tolerates a missing process.
  ps -o pgid= -p "$1" 2> /dev/null | tr -d '[:space:]'
}

owned_process_group_signal() {
  local signal=$1
  local pgid=$2
  local pid=$3
  local caller_pgid=$4

  if [[ -n ${pgid} && ${pgid} != "${caller_pgid}" ]]; then
    kill -s "${signal}" -- "-${pgid}" 2> /dev/null || true
  fi
  kill -s "${signal}" "${pid}" 2> /dev/null || true
}

# TERM the owned group, wait up to GRACE seconds for the group to empty, then
# always KILL. A leader that dies on TERM must not skip KILL while a
# TERM-resistant descendant remains in the group. Never waits unbound.
owned_process_group_terminate() {
  local pgid=$1
  local pid=$2
  local grace=$3
  local caller_pgid
  caller_pgid=$(owned_process_group_pgid_of $$)

  owned_process_group_signal TERM "${pgid}" "${pid}" "${caller_pgid}"
  if ((grace > 0)); then
    # Prefer the group signal: the leader pid can vanish while descendants live.
    if [[ -n ${pgid} && ${pgid} != "${caller_pgid}" ]]; then
      poll_until "${grace}" "! kill -0 -- '-${pgid}' 2> /dev/null" || true
    else
      poll_until "${grace}" "! kill -0 '${pid}' 2> /dev/null" || true
    fi
  fi
  owned_process_group_signal KILL "${pgid}" "${pid}" "${caller_pgid}"
}

# Wait up to DEADLINE seconds on WAIT_FIFO, then if SENTINEL still exists mark
# TIMEOUT_FLAG and terminate the owned group. A write to WAIT_FIFO releases the
# wait early so proof can expire without wall-clock delay.
owned_process_group_watchdog() {
  local pid=$1
  local pgid=$2
  local deadline=$3
  local grace=$4
  local sentinel=$5
  local timeout_flag=$6
  local wait_fifo=$7

  trap 'exit 0' TERM INT
  exec 4<> "${wait_fifo}"
  read -r -t "${deadline}" -u 4 _ || true
  exec 4>&-
  if [[ ! -f ${sentinel} ]]; then
    exit 0
  fi
  : > "${timeout_flag}"
  owned_process_group_terminate "${pgid}" "${pid}" "${grace}"
}

# KILL is the only stop that cannot run inherited EXIT cleanup inside the
# forked watchdog before it has reset traps.
owned_process_group_stop_watchdog() {
  local watchdog=$1

  kill -s KILL "${watchdog}" 2> /dev/null || true
  wait "${watchdog}" 2> /dev/null || true
}
