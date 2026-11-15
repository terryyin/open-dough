#!/usr/bin/env bash
# An active-turn controller shares the native supervisor's ownership: its
# failure stops a blocked command, and a completed command retires the controller.
# shellcheck disable=SC1091,SC2016,SC2034,SC2154,SC2312 # Child-shell expansion, supervisor globals and sourced helpers.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-run-supervise.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_case_deadline=30
native_case_grace=0

# Even a quickly completed model must start and settle its controller. The
# controller runs independently and can publish before the model exits.
mkfifo "${work}/release"
native_run_controller_command=(bash -c 'printf "%s" "$BASHPID" > "$1/controller"; printf published > "$1/published"; printf release > "$1/release"' _ "${work}")
native_run_owned "${work}/out" "${work}/err" '' bash -c \
  'source "$2"; read -r _ < "$1/release" || true; wait_for controller-exit 5 "! kill -0 $(cat "$1/controller") 2>/dev/null"; test -f "$1/published"; printf completed' \
  _ "${work}" "${source_dir}/Distribution/tests/helpers/wait-for.bash"
[[ $(< "${work}/out") == completed ]]
[[ $(< "${work}/published") == published ]]

# A controller failure owns a blocked model and its otherwise lingering child.
mkdir "${work}/failure"
mkfifo "${work}/failure/hold"
native_run_controller_command=(bash -c 'source "$2"; wait_for model 5 "test -s $1/model"; exit 19'
  _ "${work}/failure" "${source_dir}/Distribution/tests/helpers/wait-for.bash")
status=0
native_run_owned_or_fail "${work}/out" "${work}/err" '' bash -c \
  'printf "%s" "$BASHPID" > "$1/model"; bash -c '\''printf "%s" "$BASHPID" > "$1/child"; exec 8<> "$1/hold"; read -r -u 8 _'\'' _ "$1" & wait' \
  _ "${work}/failure" || status=$?
[[ ${status} -eq 19 && ${native_run_failure_reason} == 'active-turn controller exited 19' ]]
kill -0 "$(< "${work}/failure/model")" 2> /dev/null && exit 1
if [[ -s ${work}/failure/child ]]; then
  wait_for child-stopped 5 "! kill -0 $(< "${work}/failure/child") 2>/dev/null"
fi

# A completed model cannot leave a controller blocked on a release barrier.
mkdir "${work}/early"
mkfifo "${work}/early/hold"
native_run_controller_command=(bash -c 'printf "%s" "$BASHPID" > "$1/controller"; exec 8<> "$1/hold"; read -r -u 8 _' _ "${work}/early")
status=0
native_run_owned_or_fail "${work}/out" "${work}/err" '' bash -c \
  'source "$2"; wait_for controller 5 "test -s $1/controller"' \
  _ "${work}/early" "${source_dir}/Distribution/tests/helpers/wait-for.bash" || status=$?
[[ ${status} -eq 125 && ${native_run_failure_reason} == 'native command ended before its active-turn controller' ]]
kill -0 "$(< "${work}/early/controller")" 2> /dev/null && exit 1

# Drive the real safety watchdog through its existing FIFO, without waiting
# for time to pass. Both groups and the supervisor must finish on expiry.
mkdir "${work}/timeout"
mkfifo "${work}/timeout/hold"
native_run_watchdog() {
  printf '%s' "$7" > "${work}/watchdog"
  owned_process_group_watchdog "$@"
}
native_run_controller_command=(bash -c
  'source "$2"; printf "%s" "$BASHPID" > "$1/controller"; wait_for watchdog 5 "test -s $3/watchdog"; printf "expire\n" > "$(cat "$3/watchdog")"; exec 8<> "$1/hold"; read -r -u 8 _'
  _ "${work}/timeout" "${source_dir}/Distribution/tests/helpers/wait-for.bash" "${work}")
status=0
native_run_owned_or_fail "${work}/out" "${work}/err" '' bash -c \
  'printf "%s" "$BASHPID" > "$1/model"; exec 8<> "$1/hold"; read -r -u 8 _' \
  _ "${work}/timeout" || status=$?
[[ ${status} -eq 124 && ${native_run_outcome} == timeout ]]
kill -0 "$(< "${work}/timeout/model")" 2> /dev/null && exit 1
kill -0 "$(< "${work}/timeout/controller")" 2> /dev/null && exit 1

# TERM arrives after the safety watchdog observes a fully owned execution.
# The caller's existing trap must also be restored afterward.
mkdir "${work}/interrupt"
mkfifo "${work}/interrupt/hold"
rm "${work}/watchdog"
(
  printf '%s' "${BASHPID}" > "${work}/supervisor"
  native_run_controller_command=(bash -c
    'printf "%s" "$BASHPID" > "$1/controller"; exec 8<> "$1/hold"; read -r -u 8 _' _ "${work}/interrupt")
  trap 'printf restored > "${work}/restored"' TERM
  status=0
  native_run_owned_or_fail "${work}/out" "${work}/err" '' bash -c \
    'printf "%s" "$BASHPID" > "$1/model"; exec 8<> "$1/hold"; read -r -u 8 _' \
    _ "${work}/interrupt" || status=$?
  [[ ${status} -eq 143 ]]
  kill -TERM "${BASHPID}"
) &
supervisor=$!
wait_for watchdog-ready 5 "test -s '${work}/watchdog'"
kill -TERM "$(< "${work}/supervisor")"
wait "${supervisor}"
[[ $(< "${work}/restored") == restored ]]
kill -0 "$(< "${work}/interrupt/model")" 2> /dev/null && exit 1
kill -0 "$(< "${work}/interrupt/controller")" 2> /dev/null && exit 1

# A failed host also retires a controller's clock descendant, rather than
# leaving its Bash parent blocked in wait. No clock time must elapse.
mkdir "${work}/host-failure"
mkfifo "${work}/host-failure/hold"
native_run_controller_command=(bash -c
  'printf "%s" "$BASHPID" > "$1/controller"; bash -c '\''printf "%s" "$BASHPID" > "$1/clock"; exec 8<> "$1/hold"; read -r -u 8 _'\'' _ "$1" & wait'
  _ "${work}/host-failure")
status=0
native_run_owned_or_fail "${work}/out" "${work}/err" '' bash -c \
  'source "$2"; wait_for clock 5 "test -s $1/clock"; exit 17' \
  _ "${work}/host-failure" "${source_dir}/Distribution/tests/helpers/wait-for.bash" || status=$?
[[ ${status} -eq 17 && ${native_run_failure_reason} == 'native command ended before its active-turn controller' ]]
kill -0 "$(< "${work}/host-failure/controller")" 2> /dev/null && exit 1
wait_for clock-stopped 5 "! kill -0 $(< "${work}/host-failure/clock") 2>/dev/null"
