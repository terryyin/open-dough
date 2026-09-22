#!/usr/bin/env bash
# Controlled native journeys for execution/review completion. The fixture owns
# CI result timing independently of the model and observes real installed
# await-revision calls through a PATH shim.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/ci-completion-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-fixture.sh"

ci_completion_observe() {
  local scenario=$1
  local transcript=$2
  local response=$3
  local coverage state=missing terminal=missing wait_count node_wait_count
  local transcript_wait_count review_started=false
  coverage="${ci_completion_mailbox}/coverage/${ci_completion_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${ci_completion_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${ci_completion_mailbox}/result.json")
  node_wait_count=$(grep -Fc \
    "await-revision ${ci_completion_mailbox} ${ci_completion_sha}" \
    "${ci_completion_node_log}" || true)
  transcript_wait_count=$(
    grep -F '"subtype":"started"' "${transcript}" \
      | grep -F 'await-revision' \
      | grep -F "${ci_completion_mailbox}" \
      | grep -Fc "${ci_completion_sha}" || true
  )
  wait_count=${node_wait_count}
  if ((transcript_wait_count > wait_count)); then
    wait_count=${transcript_wait_count}
  fi
  [[ -f ${ci_completion_project}/.planning/review-observation/start ]] \
    && review_started=true
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'coverage-state: %s\n' "${state}"
    printf 'observer-terminal: %s\n' "${terminal}"
    printf 'await-count: %s\n' "${wait_count}"
    printf 'review-started: %s\n' "${review_started}"
    printf 'review-completed: %s\n' "$([[ -f ${ci_completion_project}/.planning/review-observation/complete ]] && echo true || echo false)"
    printf 'completion-marker: %s\n' "$(grep -Fc '## PLAN EXECUTION COMPLETE' "${response}" || true)"
    printf 'failure-reported: %s\n' "$(grep -Eiq 'CI.+fail|fail.+CI|unresolved' "${response}" && echo true || echo false)"
    printf 'control-order:\n'
    sed 's/^/  /' "${ci_completion_control_log}"
    printf 'node-await-calls:\n'
    grep -F 'await-revision' "${ci_completion_node_log}" | sed 's/^/  /' || true
  }
}

ci_completion_assess() {
  local scenario=$1
  local observations=$2
  local state terminal wait_count review_started review_completed marker failure_reported
  state=$(awk '/^coverage-state:/{print $2}' "${observations}")
  terminal=$(awk '/^observer-terminal:/{print $2}' "${observations}")
  wait_count=$(awk '/^await-count:/{print $2}' "${observations}")
  review_started=$(awk '/^review-started:/{print $2}' "${observations}")
  review_completed=$(awk '/^review-completed:/{print $2}' "${observations}")
  marker=$(awk '/^completion-marker:/{print $2}' "${observations}")
  failure_reported=$(awk '/^failure-reported:/{print $2}' "${observations}")
  [[ ${wait_count} == 1 && (${terminal} == stopped || ${terminal} == finished) ]] || return 1
  case ${scenario} in
    pending)
      [[ ${state} == success && ${review_started} == true &&
        ${review_completed} == true && ${marker} == 1 ]] || return 1
      awk '/review-start/{a=NR} /await-start/{b=NR} /ci-release/{c=NR} END{exit !(a<b && b<c)}' \
        "${observations}"
      ;;
    ready)
      [[ ${state} == success && ${review_started} == true &&
        ${review_completed} == true && ${marker} == 1 ]] || return 1
      awk '/review-start/{a=NR} /ci-release/{b=NR} /coverage-terminal/{c=NR} /review-complete/{d=NR} END{exit !(a<b && b<c && c<d)}' \
        "${observations}"
      ;;
    skip-retro)
      [[ ${state} == success && ${review_started} == false && ${marker} == 1 ]]
      ;;
    failure)
      [[ ${state} == failure && ${review_started} == true &&
        ${marker} == 0 && ${failure_reported} == true ]]
      ;;
    *) return 2 ;;
  esac
}

ci_completion_run_journey() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local results_dir=$4
  local root prompt controller_pid run_status=0 stop_status=0
  root=$(mktemp -d)
  ci_completion_create_fixture "${source_dir}" "${host}" "${scenario}" "${root}"
  prompt=$(ci_completion_prompt_for "${scenario}")
  native_case_host=${host}
  native_case_id="execution-review/${scenario}"
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${root}/events.jsonl"
  output_file="${root}/response.md"
  native_stderr="${root}/stderr.log"
  target=${ci_completion_project}
  native_run_workspace=${ci_completion_project}
  platform=${host}
  : > "${transcript}"
  : > "${native_stderr}"

  ci_completion_controller "${scenario}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1

  if [[ ! -f ${ci_completion_mailbox}/result.json ]]; then
    (cd "${ci_completion_project}" \
      && node "${ci_completion_launcher}" stop "${ci_completion_mailbox}") \
      > "${root}/forced-stop.txt" || stop_status=$?
  fi
  ci_completion_observe "${scenario}" "${transcript}" "${output_file}" \
    > "${root}/observations.txt"
  if ci_completion_assess "${scenario}" "${root}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='controlled CI ordering and final handoff observed'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='execution/review completion ordering was not observed'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" \
    "${transcript}" "${output_file}" "${native_stderr}" \
    "${root}/observations.txt" execution-review
  printf 'run-status: %s\n' "${run_status}"
  printf 'assessment-status: %s\n' "${git_publication_assess_status}"
  printf 'assessment-reason: %s\n' "${git_publication_assess_reason}"
  printf 'observations:\n'
  cat "${root}/observations.txt"
  if [[ ${run_status} -ne 0 ]]; then
    printf 'response:\n'
    cat "${output_file}" 2> /dev/null || true
    printf 'stderr:\n'
    cat "${native_stderr}" 2> /dev/null || true
  fi
  export PATH=${ci_completion_old_path}
  unset CI_COMPLETION_NODE_LOG CI_COMPLETION_SHA DOUGH_CI_MAILBOX_ROOT
  rm -rf -- "${root}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
