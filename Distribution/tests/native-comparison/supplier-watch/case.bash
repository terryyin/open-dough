#!/usr/bin/env bash
# Controlled preparation of an ordinary hold followed by one actual watch request.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared case and journey globals.
watch_case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${watch_case_dir}/../../support/native-comparison-supplier.sh"
case_events=watch
case_empty_events=''
case_adjust_overlay() { node "${watch_case_dir}/project.mjs" "$@"; }
case_materialize() { supplier_case_materialize "$@"; }

# The real route uses the approved windows; only exact controlled substitute
# bytes may select an external FIFO clock. Neither route changes model prompts.
case_prepare_run() {
  if [[ ${native_codex_isolate:-0} -eq 1 ]]; then
    watch_clock_mode=native
    return 0
  fi
  case_prepare_reason='supplier-watch permits only the controlled supplier substitute; no session started'
  cmp -s "$(command -v codex)" "${watch_case_dir}/../../support/native-agent-paused-supplier.sh" || return 1
  case_prepare_reason='supplier-watch requires an explicit controlled release clock; no session started'
  [[ -n ${NATIVE_COMPARISON_CONTROL_CLOCK-} && -p ${NATIVE_COMPARISON_CONTROL_CLOCK}/advance ]] || return 1
  watch_clock_mode=controlled
}
case_apply_event() { [[ $2 == watch ]]; }

case_prepare_turn() {
  local root=$1 turn=$2 stream=$3 scratch=$4 started=$5 name
  [[ ${turn} -eq 2 ]] || return 0
  mkdir -p "${scratch}/case-evidence"
  for name in case_basis_consumer case_basis_supplier case_remote_main native_comparison_thread harness; do
    printf '%s=%q\n' "${name}" "${!name}"
  done > "${scratch}/case-evidence/watch-state.bash"
  printf 'turn-2-watch-start-ms: %s\n' "$((started / 1000))" > "${scratch}/case-evidence/watch-observations.txt"
  printf 'turn-2-producer-schedule: fixed-180s-180s\n' >> "${scratch}/case-evidence/watch-observations.txt"
  native_run_controller_command=("${BASH}" "${watch_case_dir}/control.bash"
    "${root}" "${stream}" "${scratch}" "${watch_clock_mode}" "${NATIVE_COMPARISON_CONTROL_CLOCK-}" "$((started / 1000))")
}

case_observe() {
  local root=$1 turn=$2 stream=$3 scratch=$4
  if [[ ${turn} -eq 2 ]]; then
    if [[ -f ${scratch}/case-evidence/expected-main ]]; then
      case_remote_main=$(< "${scratch}/case-evidence/expected-main")
    fi
    [[ ! -f ${scratch}/case-evidence/watch-observations.txt ]] \
      || cat "${scratch}/case-evidence/watch-observations.txt"
    native_run_classify_stream codex "${stream}"
    printf 'turn-2-watch-stream: %s\n' "${native_run_stream_status}"
    printf 'turn-2-watch-reproduction: %s\n' "$([[ ${watch_clock_mode} == native ]] && echo unreviewed-native-handles || echo unobserved-controlled-host)"
    local saved sessions
    sessions=$(native_comparison_sessions_root)
    saved=$(node "${watch_case_dir}/../../support/native-codex-session.mjs" "${native_comparison_thread}" "${sessions}" 2> /dev/null | sed -n 's/^codex-session-file: //p') || saved=''
    node "${watch_case_dir}/evidence.mjs" "${saved}" "${scratch}/case-evidence/watch-observations.txt" \
      "${scratch}/case-evidence/watch-facts.json"
    if [[ ${native_run_failure_reason-} == 'native command ended before its active-turn controller' ]]; then
      printf 'turn-2-watch-controller: cancelled-on-model-exit\n'
      printf 'turn-2-watch-result: ended-before-publication\n'
    else
      printf 'turn-2-watch-controller: %s\n' "${native_run_outcome}"
      printf 'turn-2-watch-result: %s\n' "$([[ ${native_run_outcome} == exited ]] && echo completed || echo stopped)"
    fi
  fi
  supplier_case_observe "$@"
}

case_observe_stopped() { case_observe "$@"; }
