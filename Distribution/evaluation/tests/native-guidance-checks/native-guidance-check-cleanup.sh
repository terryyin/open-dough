#!/usr/bin/env bash
# Credential-free early arm cleanup through the Native guidance checks entry.
# A stand-in case starts a service before the reason an arm might stop. A
# stand-in host blocks during turn 1 and records its workspace at exit.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals and journey verdicts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/native-comparison-pair-fixture.sh"
source "${source_dir}/Distribution/tests/helpers/wait-for.bash"

work=$(mktemp -d)
cleanup_fixture() {
  local file
  for file in "${work}"/*/entry.pid "${work}"/*/arm.*/{host,service}.pid; do
    [[ ! -s ${file} ]] || kill -KILL "$(< "${file}")" 2> /dev/null || true
  done
  rm -rf -- "${work}"
}
trap cleanup_fixture EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"

case_dir="${work}/source/Distribution/evaluation/cases/guidance-checks/cleanup-probe"
mkdir -p "${case_dir}"
printf 'Perform the stand-in task.\n' > "${case_dir}/task.txt"
printf 'Continue the stand-in task.\n' > "${case_dir}/wake.txt"
cat > "${case_dir}/case.bash" << 'CASE'
case_events='stand-in-event'

case_materialize() {
  local root=$1
  case_evidence="${CLEANUP_EVIDENCE}/arm.${root##*.}"
  mkdir -p "${case_evidence}"
  (
    trap '' INT TERM HUP
    : > "${case_evidence}/service.ready"
    exec 8<> "${CLEANUP_EVIDENCE}/hold"
    read -r -u 8 _
  ) &
  case_service_pid=$!
  printf '%s\n' "${case_service_pid}" > "${case_evidence}/service.pid"
  [[ ${CLEANUP_SCENARIO} != failed-materialization ]] || return 1
  git clone --quiet --local "${CLEANUP_PROJECT}" "${root}/workspace" || return
  case_project_basis='stand-in cleanup project'
}

case_prepare_run() {
  [[ ${CLEANUP_SCENARIO} != refused-route ]] || {
    case_prepare_reason='the stand-in case refused its host route'
    return 1
  }
}

case_apply_event() { : > "${case_evidence}/later-event"; }
case_observe() { : > "${case_evidence}/observed-turn"; }

case_cleanup() {
  local host_pid
  if [[ -s ${case_evidence}/host.pid ]]; then
    host_pid=$(< "${case_evidence}/host.pid")
    if kill -0 "${host_pid}" 2> /dev/null; then
      : > "${case_evidence}/host-survived-into-cleanup"
    fi
  fi
  kill -KILL "${case_service_pid}" 2> /dev/null || true
  wait "${case_service_pid}" 2> /dev/null || true
  printf '%s\n' cleanup >> "${case_evidence}/cleanup"
  printf 'cleanup: stand-in service stopped\n'
}
CASE
cat > "${case_dir}/assess.bash" << 'ASSESS'
case_assess() {
  : > "${case_evidence}/assessed"
  case_assess_status=fail
  case_assess_reason='the blocked turn should not be assessed'
}
ASSESS
native_comparison_fixture_git "${work}/source" add -- "${case_dir}"
native_comparison_fixture_git "${work}/source" commit -qm 'Stand-in arm for early cleanup'

cat > "${work}/bin/codex" << 'HOST'
#!/usr/bin/env bash
set -euo pipefail
if [[ ${1-} == --version ]]; then
  echo 'stand-in codex'
  exit
fi
: > "${CLEANUP_EVIDENCE}/started-host"
[[ ${CLEANUP_SCENARIO} == interrupted ]] || exit 1
while [[ ${1-} != -C ]]; do
  shift
done
workspace=$2
root=${workspace%/workspace}
arm="${CLEANUP_EVIDENCE}/arm.${root##*.}"
report_exit() {
  if [[ -d ${workspace} ]]; then
    echo existed > "${arm}/host-exited"
  else
    echo missing > "${arm}/host-exited"
  fi
}
trap report_exit EXIT
trap 'exit 143' TERM
exec 8<> "${CLEANUP_EVIDENCE}/hold"
printf '%s\n' "${BASHPID}" > "${arm}/host.pid"
read -r -u 8 _
HOST

prepare_run() {
  export CLEANUP_EVIDENCE="${work}/$1" CLEANUP_SCENARIO=$2
  export CLEANUP_PROJECT="${work}/payloads"
  export PATH="${work}/bin:${PATH}" CODEX_HOME="${CLEANUP_EVIDENCE}/codex-home"
  export TMPDIR="${CLEANUP_EVIDENCE}/tmp"
  mkdir -p "${TMPDIR}"
  mkfifo "${CLEANUP_EVIDENCE}/hold"
  command=("${native_comparison_fixture_entry[@]}" --native codex --case cleanup-probe
    --results-dir "${CLEANUP_EVIDENCE}/results")
}

assert_cleaned_services() {
  local arm
  for arm in "${CLEANUP_EVIDENCE}"/arm.*; do
    [[ $(< "${arm}/cleanup") == cleanup ]]
    if kill -0 "$(< "${arm}/service.pid")" 2> /dev/null; then
      printf 'FAIL: stand-in service survived in %s\n' "${arm}" >&2
      return 1
    fi
  done
}

unstarted() (
  local reason=$2 status=0
  prepare_run "$1" "$1"
  "${command[@]}" > "${CLEANUP_EVIDENCE}/out" 2> "${CLEANUP_EVIDENCE}/err" || status=$?
  [[ ${status} -eq 1 ]]
  grep -Fxq "unstarted: ${reason}" "${CLEANUP_EVIDENCE}/out"
  if ! grep -Fxq 'cleanup: stand-in service stopped' "${CLEANUP_EVIDENCE}/out"; then
    printf 'FAIL: no cleanup observation after %s\n' "${reason}" >&2
    return 1
  fi
  grep -Fxq 'result-path: none retained' "${CLEANUP_EVIDENCE}/out"
  [[ ! -e ${CLEANUP_EVIDENCE}/started-host && -z $(find "${CLEANUP_EVIDENCE}/results" -type f) ]]
  assert_cleaned_services
)

unstarted failed-materialization 'the case could not be materialized'
unstarted refused-route 'the stand-in case refused its host route'

# Count only arms whose substitute host entered its blocking turn. The service
# and host both publish their own ready evidence after installing their traps.
all_arms_ready() {
  local expected=$1 arm arms=0
  for arm in "${CLEANUP_EVIDENCE}"/arm.*; do
    [[ -e ${arm}/service.ready && -s ${arm}/host.pid ]] || return 1
    arms=$((arms + 1))
  done
  [[ ${arms} -eq ${expected} ]]
}

interrupt_turn() (
  local name=$1 signal=$2 target=$3 expected_status=$4 arms=$5 entry_pid status=0 arm
  shift 5
  prepare_run "${name}" interrupted
  # Start the entry as its own foreground process group for the Ctrl-C form.
  set -m
  "${command[@]}" "$@" > "${CLEANUP_EVIDENCE}/out" 2> "${CLEANUP_EVIDENCE}/err" &
  entry_pid=$!
  set +m
  printf '%s\n' "${entry_pid}" > "${CLEANUP_EVIDENCE}/entry.pid"
  wait_for "the substitute hosts to enter turn 1" 20 "all_arms_ready ${arms}" || {
    cat "${CLEANUP_EVIDENCE}/err" >&2
    return 1
  }
  [[ ${target} != group ]] || target=-
  [[ ${target} != entry ]] || target=
  kill -s "${signal}" -- "${target}${entry_pid}"
  wait_for "the entry to finish the interrupted run" 20 "! kill -0 ${entry_pid} 2>/dev/null"
  wait "${entry_pid}" || status=$?
  rm -- "${CLEANUP_EVIDENCE}/entry.pid"
  [[ ${status} -eq ${expected_status} ]]
  for arm in "${CLEANUP_EVIDENCE}"/arm.*; do
    if kill -0 "$(< "${arm}/host.pid")" 2> /dev/null; then
      printf 'FAIL: stand-in host survived in %s\n' "${arm}" >&2
      return 1
    fi
    if ! grep -Fxq existed "${arm}/host-exited"; then
      printf 'FAIL: stand-in host did not exit while its workspace existed in %s\n' "${arm}" >&2
      return 1
    fi
    [[ ! -e ${arm}/host-survived-into-cleanup && ! -e ${arm}/observed-turn &&
      ! -e ${arm}/later-event && ! -e ${arm}/assessed ]]
  done
  assert_cleaned_services
  [[ -z $(find "${TMPDIR}" -mindepth 1 -print) ]]
)

interrupt_turn pair-int INT group 130 2 --arms concurrent --payload-repo "${work}/payloads" \
  --baseline "${native_comparison_fixture_baseline}" --candidate "${native_comparison_fixture_baseline}" \
  --factor 'substitute payload' --gain 'same effort' --quality 'case outcome'
interrupt_turn single-int INT group 130 1
interrupt_turn single-term TERM entry 143 1
