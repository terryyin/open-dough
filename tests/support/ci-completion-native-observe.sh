#!/usr/bin/env bash
# Execution/review completion observation: the fields the assessor reads.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"

ci_completion_observe() {
  local scenario=$1
  local host=$2
  local transcript=$3
  local response=$4
  local coverage state=missing terminal=missing
  local ci_complete=0 ci_stop=0 ci_await=0
  local review_started=false
  local ci_product_shutdown=false ci_forced_stop=false worker_alive=unknown
  coverage="${ci_completion_mailbox}/coverage/${ci_completion_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${ci_completion_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${ci_completion_mailbox}/result.json")
  native_completion_measure ci "${ci_completion_node_log}" "${host}" "${transcript}" \
    "${ci_completion_mailbox}" "${ci_completion_sha}" "${terminal}" \
    "${ci_completion_forced_stop_file-}"
  [[ -f ${ci_completion_project}/.planning/review-observation/start ]] \
    && review_started=true
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
    printf 'complete-count: %s\n' "${ci_complete}"
    printf 'stop-count: %s\n' "${ci_stop}"
    printf 'await-count: %s\n' "${ci_await}"
    printf 'product-shutdown: %s\n' "${ci_product_shutdown}"
    printf 'forced-stop: %s\n' "${ci_forced_stop}"
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
