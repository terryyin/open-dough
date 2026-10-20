#!/usr/bin/env bash
# Observations for delivery-evidence/scheduling: the ordered proof-run log the
# product commands wrote, the final product state's identity, and the
# harness's own independent whole-suite run on that final state. A logged
# invocation or exit zero alone is not coverage: a broad run covers the final
# state only when it ran on that state's content and observed the same named
# tests the harness observes there, all passing.
# Fields (one line each):
#   trace: KIND:LABEL[*]:exitE[:PASSED/FAILED] per logged run, in order; LABEL
#     numbers distinct product states by first appearance, * marks the final
#   broad-runs, broad-runs-before-move (on fewer stylesheet files than the
#     final state, i.e. before the extraction), broad-runs-superseded (on a
#     state other than the final one)
#   final-broad-coverage: true | false
#   targeted-proof-before-refactor: a passing focused run before the move
#   extraction-in-implementation: no such run, but a passing focused run on a
#     state already holding the final stylesheets: implementation made the
#     extraction, so no refactor move could invalidate broad proof
#   final-observed-suite: pass | fail (the harness's run on the final state)
#   agent-calls: transcript lines delegating to an agent (diagnostic only)
# shellcheck disable=SC2154,SC2312

delivery_evidence_scheduling_logger() {
  printf '%s\n' \
    "${delivery_evidence_support_dir}/delivery-evidence-scheduling-native-proof-logger.sh"
}

# The agent-side proof log of WORKSPACE's repository.
delivery_evidence_scheduling_log_path() {
  local common
  common=$(git -C "$1" rev-parse --git-common-dir)
  [[ ${common} == /* ]] || common="$1/${common}"
  printf '%s/proof-runs.log\n' "$(cd -- "${common}" && pwd)"
}

# Value of FIELD=... in proof-log LINE; names= runs to the end of the line.
delivery_evidence_scheduling_field() {
  local field=$1 line=$2
  if [[ ${field} == names ]]; then
    [[ ${line} == *' names='* ]] && printf '%s\n' "${line#* names=}"
    return 0
  fi
  sed -nE "s/.*(^| )${field}=([^ ]*).*/\\2/p" <<< "${line%% names=*}"
}

delivery_evidence_scheduling_acceptance() {
  local outcome="$1/.planning/acceptance-outcome.md" text
  if [[ ! -s ${outcome} ]]; then
    echo missing
    return 0
  fi
  text=$(cat -- "${outcome}")
  # shellcheck disable=SC2310
  if delivery_evidence_promise_status_stated incomplete "${text}"; then
    echo incomplete
  elif delivery_evidence_promise_status_stated accepted "${text}" \
    || delivery_evidence_all_promises_accepted "${text}"; then
    echo accepted
  else
    echo unstated
  fi
}

delivery_evidence_scheduling_observe() {
  local scenario=$1 workspace=$2 response=$3 transcript=$4
  local evidence_root logger agent_log observer_log final_state final_line
  local final_files final_names final_passed final_exit size_status=0 line
  local kind state files run_exit passed failed names label trace='' broad=0
  local before=0 superseded=0 coverage=false targeted=false upfront=false
  local -A labels=()
  evidence_root=$(dirname -- "${transcript}")
  logger=$(delivery_evidence_scheduling_logger)
  agent_log=$(delivery_evidence_scheduling_log_path "${workspace}")
  observer_log="${evidence_root}/observer-runs.log"
  : > "${observer_log}"
  if [[ -f ${agent_log} ]]; then
    cp -- "${agent_log}" "${evidence_root}/proof-runs.log"
  else
    : > "${evidence_root}/proof-runs.log"
  fi
  if [[ -s ${transcript} && -n ${native_case_host:-} ]]; then
    native_host_stream "${native_case_host}" "${transcript}" calls \
      > "${evidence_root}/command-results.jsonl"
  else
    : > "${evidence_root}/command-results.jsonl"
  fi
  git -C "${workspace}" status --porcelain=v1 > "${evidence_root}/final-status.txt"
  git -C "${workspace}" diff > "${evidence_root}/final-product.diff"

  final_state=$(cd -- "${workspace}" && bash "${logger}" --state)
  (cd -- "${workspace}" && PROOF_RUN_LOG=${observer_log} bash "${logger}" size) \
    > /dev/null 2>&1 || size_status=$?
  (cd -- "${workspace}" && PROOF_RUN_LOG=${observer_log} bash "${logger}" suite) \
    > "${evidence_root}/observer-suite.tap" 2>&1 || true
  final_line=$(grep ' kind=suite ' "${observer_log}" | tail -n 1)
  final_files=$(delivery_evidence_scheduling_field stylesheet-files "${final_line}")
  final_names=$(delivery_evidence_scheduling_field names "${final_line}")
  final_passed=$(delivery_evidence_scheduling_field passed "${final_line}")
  final_exit=$(delivery_evidence_scheduling_field exit "${final_line}")

  while IFS= read -r line || [[ -n ${line} ]]; do
    [[ -n ${line} ]] || continue
    kind=$(delivery_evidence_scheduling_field kind "${line}")
    state=$(delivery_evidence_scheduling_field state "${line}")
    files=$(delivery_evidence_scheduling_field stylesheet-files "${line}")
    run_exit=$(delivery_evidence_scheduling_field exit "${line}")
    passed=$(delivery_evidence_scheduling_field passed "${line}")
    failed=$(delivery_evidence_scheduling_field failed "${line}")
    names=$(delivery_evidence_scheduling_field names "${line}")
    if [[ -z ${labels[${state}]-} ]]; then
      labels[${state}]="s$((${#labels[@]} + 1))"
    fi
    label=${labels[${state}]}
    [[ ${state} != "${final_state}" ]] || label="${label}*"
    case ${kind} in
      targeted | suite) label="${label}:exit${run_exit}:${passed}/${failed}" ;;
      *) label="${label}:exit${run_exit}" ;;
    esac
    trace="${trace:+${trace} }${kind}:${label}"
    if [[ ${kind} == targeted && ${run_exit} == 0 && ${failed} == 0 &&
      ${passed} -gt 0 && ${files} -lt ${final_files:-0} ]]; then
      targeted=true
    fi
    if [[ ${kind} == targeted && ${run_exit} == 0 && ${failed} == 0 &&
      ${passed} -gt 0 && ${files} -ge ${final_files:-0} ]]; then
      upfront=true
    fi
    [[ ${kind} == suite ]] || continue
    broad=$((broad + 1))
    [[ ${files} -ge ${final_files:-0} ]] || before=$((before + 1))
    if [[ ${state} != "${final_state}" ]]; then
      superseded=$((superseded + 1))
    elif [[ ${run_exit} == 0 && ${failed} == 0 && ${passed} -gt 0 &&
      ${passed} == "${final_passed}" && ${names} == "${final_names}" ]]; then
      coverage=true
    fi
  done < "${evidence_root}/proof-runs.log"

  printf 'scenario: %s\n' "${scenario}"
  printf 'trace: %s\n' "${trace:-none}"
  printf 'broad-runs: %s\n' "${broad}"
  printf 'broad-runs-before-move: %s\n' "${before}"
  printf 'broad-runs-superseded: %s\n' "${superseded}"
  printf 'final-broad-coverage: %s\n' "${coverage}"
  printf 'targeted-proof-before-refactor: %s\n' "${targeted}"
  printf 'extraction-in-implementation: %s\n' \
    "$([[ ${targeted} == false && ${upfront} == true ]] && echo true || echo false)"
  printf 'final-state: %s\n' "${final_state}"
  printf 'final-stylesheets: %s\n' \
    "$(delivery_evidence_scheduling_field linked "${final_line}")"
  printf 'extraction-performed: %s\n' \
    "$([[ ${final_files:-0} -gt 1 ]] && echo true || echo false)"
  printf 'final-size-ok: %s\n' "$([[ ${size_status} -eq 0 ]] && echo true || echo false)"
  printf 'final-observed-suite: %s\n' \
    "$([[ ${final_exit} == 0 && ${final_passed:-0} -gt 0 ]] && echo pass || echo fail)"
  printf 'acceptance: %s\n' "$(delivery_evidence_scheduling_acceptance "${workspace}")"
  printf 'refactor-delegated: %s\n' \
    "$(grep -Eq '"name":"(Task|Agent)".*post-change-refactor' "${transcript}" \
      2> /dev/null && echo true || echo false)"
  printf 'agent-calls: %s\n' \
    "$(grep -Ec '"name":"(Task|Agent)"' "${transcript}" 2> /dev/null || true)"
  printf 'host-suite-calls: %s\n' \
    "$(grep -c 'bin/suite\.sh' "${evidence_root}/command-results.jsonl" || true)"
  printf 'harness-inspected: %s\n' \
    "$(native_harness_inspected 'tests/support/delivery-evidence-.*-native|native harness source' \
      "${transcript}" "${response}" 2> /dev/null || echo false)"
}

# Retains the task input, installed guidance identity, ordered proof-run log,
# the harness's own final-state run, host command calls and the final product,
# beside the shared runner's record, events and response.
delivery_evidence_scheduling_retain() {
  local prompt=$1 installed_root=.agents/skills artifact
  [[ ${native_case_host} != claude ]] || installed_root=.claude/skills
  printf '%s\n' "${prompt}" > "${native_result_attempt_dir}/prompt.txt"
  (
    cd -- "${delivery_evidence_workspace}" \
      && find "${installed_root}" -type f | LC_ALL=C sort | xargs shasum -a 256
  ) > "${native_result_attempt_dir}/installed-guidance.sha256" 2> /dev/null || true
  for artifact in proof-runs.log observer-runs.log observer-suite.tap \
    command-results.jsonl final-status.txt final-product.diff; do
    native_result_copy_if_present "${delivery_evidence_root}/${artifact}" \
      "${artifact}"
  done
  mkdir -p -- "${native_result_attempt_dir}/final-product"
  (
    cd -- "${delivery_evidence_workspace}" \
      && cp -R -- AGENTS.md index.html styles lib tests \
        "${native_result_attempt_dir}/final-product/"
  ) 2> /dev/null || true
  native_result_copy_if_present \
    "${delivery_evidence_workspace}/${delivery_evidence_scheduling_plan_path}" \
    final-plan.md
}
