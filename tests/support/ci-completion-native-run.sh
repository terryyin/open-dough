#!/usr/bin/env bash
# Controlled native journeys for execution/review completion. The fixture owns
# CI result timing independently of the model and observes real installed
# complete-revision calls through a PATH shim.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/ci-completion-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-fixture.sh"
# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"

ci_completion_observe() {
  local scenario=$1
  local transcript=$2
  local response=$3
  local coverage state=missing terminal=missing
  local complete_count=0 stop_count=0 await_count=0
  local review_started=false
  local product_shutdown=false forced_stop=false worker_alive=unknown
  coverage="${ci_completion_mailbox}/coverage/${ci_completion_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${ci_completion_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${ci_completion_mailbox}/result.json")
  complete_count=$(native_completion_call_count \
    "${ci_completion_node_log}" "${transcript}" \
    "${ci_completion_mailbox}" "${ci_completion_sha}")
  stop_count=$(native_completion_stop_count \
    "${ci_completion_node_log}" "${ci_completion_mailbox}")
  await_count=$(native_completion_await_count \
    "${ci_completion_node_log}" "${ci_completion_mailbox}" "${ci_completion_sha}")
  [[ -f ${ci_completion_project}/.planning/review-observation/start ]] \
    && review_started=true
  forced_stop=$(native_completion_forced_stop "${ci_completion_forced_stop_file-}")
  product_shutdown=$(native_completion_product_shutdown \
    "${complete_count}" "${ci_completion_forced_stop_file-}" "${terminal}")
  if [[ -f ${ci_completion_mailbox}/worker.json ]]; then
    local pid
    pid=$(jq -r '.pid' "${ci_completion_mailbox}/worker.json")
    if kill -0 "${pid}" 2> /dev/null; then
      worker_alive=true
    else
      worker_alive=false
    fi
  fi
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'coverage-state: %s\n' "${state}"
    printf 'observer-terminal: %s\n' "${terminal}"
    printf 'complete-count: %s\n' "${complete_count}"
    printf 'stop-count: %s\n' "${stop_count}"
    printf 'await-count: %s\n' "${await_count}"
    printf 'product-shutdown: %s\n' "${product_shutdown}"
    printf 'forced-stop: %s\n' "${forced_stop}"
    printf 'worker-alive: %s\n' "${worker_alive}"
    printf 'review-started: %s\n' "${review_started}"
    printf 'review-completed: %s\n' "$([[ -f ${ci_completion_project}/.planning/review-observation/complete ]] && echo true || echo false)"
    printf 'completion-marker: %s\n' "$(grep -Fc '## PLAN EXECUTION COMPLETE' "${response}" || true)"
    printf 'failure-reported: %s\n' "$(grep -Eiq 'CI.+fail|fail.+CI|unresolved' "${response}" && echo true || echo false)"
    printf 'control-order:\n'
    sed 's/^/  /' "${ci_completion_control_log}"
    printf 'node-completion-calls:\n'
    grep -E 'complete-revision|await-revision|[[:space:]]stop[[:space:]]' \
      "${ci_completion_node_log}" | sed 's/^/  /' || true
  }
}

ci_completion_assess() {
  local scenario=$1
  local observations=$2
  local state terminal complete_count stop_count await_count
  local product_shutdown forced_stop worker_alive
  local review_started review_completed marker failure_reported
  state=$(awk '/^coverage-state:/{print $2}' "${observations}")
  terminal=$(awk '/^observer-terminal:/{print $2}' "${observations}")
  complete_count=$(awk '/^complete-count:/{print $2}' "${observations}")
  stop_count=$(awk '/^stop-count:/{print $2}' "${observations}")
  await_count=$(awk '/^await-count:/{print $2}' "${observations}")
  product_shutdown=$(awk '/^product-shutdown:/{print $2}' "${observations}")
  forced_stop=$(awk '/^forced-stop:/{print $2}' "${observations}")
  worker_alive=$(awk '/^worker-alive:/{print $2}' "${observations}")
  review_started=$(awk '/^review-started:/{print $2}' "${observations}")
  review_completed=$(awk '/^review-completed:/{print $2}' "${observations}")
  marker=$(awk '/^completion-marker:/{print $2}' "${observations}")
  failure_reported=$(awk '/^failure-reported:/{print $2}' "${observations}")
  # Fixture fallback stop must never turn a missing product shutdown into a pass.
  [[ ${forced_stop} == false ]] || return 1
  case ${scenario} in
    pending | ready | skip-retro)
      [[ ${complete_count} == 1 && ${stop_count} == 0 && ${await_count} == 0 &&
        ${product_shutdown} == true &&
        (${terminal} == stopped || ${terminal} == finished) ]] || return 1
      ;;
    failure)
      [[ ${complete_count} == 1 && ${stop_count} == 0 &&
        ${product_shutdown} == false && ${terminal} == missing &&
        ${worker_alive} == true ]] || return 1
      ;;
    *) return 2 ;;
  esac
  case ${scenario} in
    pending)
      [[ ${state} == success && ${review_started} == true &&
        ${review_completed} == true && ${marker} == 1 ]] || return 1
      awk '/review-start/{a=NR} /complete-start/{b=NR} /ci-release/{c=NR} END{exit !(a<b && b<c)}' \
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

ci_completion_assess_rejects_fixture_masked_shutdown() {
  local observations=$1
  ! ci_completion_assess pending "${observations}"
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
  ci_completion_forced_stop_file="${root}/forced-stop.txt"
  : > "${transcript}"
  : > "${native_stderr}"
  export CI_COMPLETION_TRANSCRIPT="${transcript}"

  ci_completion_controller "${scenario}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1

  # Observe product shutdown state before any fixture cleanup/stop so a
  # harness fallback cannot mask a missing product shutdown as success.
  ci_completion_observe "${scenario}" "${transcript}" "${output_file}" \
    > "${root}/observations.txt"
  if [[ ! -f ${ci_completion_mailbox}/result.json ]]; then
    (cd "${ci_completion_project}" \
      && node "${ci_completion_launcher}" stop "${ci_completion_mailbox}") \
      > "${ci_completion_forced_stop_file}" || stop_status=$?
  fi
  if [[ ${scenario} == failure ]]; then
    # Failing assessor example: fixture-masked "success" after forced stop
    # must not pass when the product left the observer alive.
    {
      printf 'scenario: pending\n'
      printf 'coverage-state: success\n'
      printf 'observer-terminal: stopped\n'
      printf 'complete-count: 0\n'
      printf 'stop-count: 0\n'
      printf 'await-count: 0\n'
      printf 'product-shutdown: false\n'
      printf 'forced-stop: true\n'
      printf 'worker-alive: false\n'
      printf 'review-started: true\n'
      printf 'review-completed: true\n'
      printf 'completion-marker: 1\n'
      printf 'failure-reported: false\n'
      printf 'control-order:\n'
      printf '  review-start\n'
    } > "${root}/masked-shutdown.txt"
    ci_completion_assess_rejects_fixture_masked_shutdown \
      "${root}/masked-shutdown.txt" || {
      git_publication_assess_status=fail
      git_publication_assess_reason='assessor accepted a fixture-masked shutdown'
      run_status=1
    }
  fi
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
  unset ci_completion_forced_stop_file
  rm -rf -- "${root}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
