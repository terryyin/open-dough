#!/usr/bin/env bash
# Trunk Mode closure observation and assessor counterexamples.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"

trunk_closure_observe() {
  local scenario=$1
  local transcript=$2
  local response=$3
  local coverage state=missing basis_state=none terminal=missing
  local complete_count=0 stop_count=0 await_count=0
  local product_shutdown=false forced_stop=false checkout_present=false
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${coverage} ]] && basis_state=$(jq -r '.basis.state // "none"' "${coverage}")
  [[ -f ${trunk_closure_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${trunk_closure_mailbox}/result.json")
  complete_count=$(native_completion_call_count \
    "${trunk_closure_node_log}" "${transcript}" \
    "${trunk_closure_mailbox}" "${trunk_closure_candidate_sha}")
  stop_count=$(native_completion_stop_count \
    "${trunk_closure_node_log}" "${trunk_closure_mailbox}")
  await_count=$(native_completion_await_count \
    "${trunk_closure_node_log}" "${trunk_closure_mailbox}" \
    "${trunk_closure_candidate_sha}")
  forced_stop=$(native_completion_forced_stop "${trunk_closure_forced_stop_file-}")
  product_shutdown=$(native_completion_product_shutdown \
    "${complete_count}" "${trunk_closure_forced_stop_file-}" "${terminal}")
  [[ -d ${trunk_closure_workspace} ]] && checkout_present=true
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'remote-sha: %s\n' "$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')"
    printf 'candidate-sha: %s\n' "${trunk_closure_candidate_sha}"
    printf 'mailbox-target: %s\n' "$(jq -r '.branch' "${trunk_closure_mailbox}/request.json")"
    printf 'coverage-state: %s\n' "${state}"
    printf 'basis-state: %s\n' "${basis_state}"
    printf 'observer-terminal: %s\n' "${terminal}"
    printf 'complete-count: %s\n' "${complete_count}"
    printf 'await-count: %s\n' "${await_count}"
    printf 'register-count: %s\n' "$(grep -Fc "register-push ${trunk_closure_mailbox} ${trunk_closure_candidate_sha}" "${trunk_closure_node_log}" || true)"
    printf 'stop-count: %s\n' "${stop_count}"
    printf 'product-shutdown: %s\n' "${product_shutdown}"
    printf 'forced-stop: %s\n' "${forced_stop}"
    printf 'checkout-present-after: %s\n' "${checkout_present}"
    printf 'cleanup-complete: %s\n' "$([[ -f ${trunk_closure_cleanup_marker} ]] && echo true || echo false)"
    printf 'provider-candidate-calls: %s\n' "$(grep -Fc "${trunk_closure_candidate_sha}" "${trunk_closure_gh_log}" || true)"
    printf 'control-order:\n'
    sed 's/^/  /' "${trunk_closure_control_log}"
    printf 'response-completion-result: %s\n' "$(grep -Eiq 'CI.+(success|not.required)|success.+CI|not.required|completion receipt|shutdown' "${response}" && echo true || echo false)"
    printf 'transcript-complete: %s\n' "$(grep -Fq 'complete-revision' "${transcript}" && echo true || echo false)"
    printf 'harness-inspected: %s\n' "$(grep -Eiq 'trunk-closure-native|native harness|trunk-closure/(source|ignored-only)' "${transcript}" && echo true || echo false)"
  }
}

trunk_closure_assess() {
  local scenario=$1
  local observations=$2
  local remote candidate state basis terminal completes awaits registers stops
  local cleanup harness product_shutdown forced_stop mailbox_target
  remote=$(awk '/^remote-sha:/{print $2}' "${observations}")
  candidate=$(awk '/^candidate-sha:/{print $2}' "${observations}")
  state=$(awk '/^coverage-state:/{print $2}' "${observations}")
  basis=$(awk '/^basis-state:/{print $2}' "${observations}")
  terminal=$(awk '/^observer-terminal:/{print $2}' "${observations}")
  completes=$(awk '/^complete-count:/{print $2}' "${observations}")
  awaits=$(awk '/^await-count:/{print $2}' "${observations}")
  registers=$(awk '/^register-count:/{print $2}' "${observations}")
  stops=$(awk '/^stop-count:/{print $2}' "${observations}")
  cleanup=$(awk '/^cleanup-complete:/{print $2}' "${observations}")
  harness=$(awk '/^harness-inspected:/{print $2}' "${observations}")
  product_shutdown=$(awk '/^product-shutdown:/{print $2}' "${observations}")
  forced_stop=$(awk '/^forced-stop:/{print $2}' "${observations}")
  mailbox_target=$(awk '/^mailbox-target:/{print $2}' "${observations}")
  # Fixture fallback stop must never turn a missing product shutdown into a pass.
  [[ ${forced_stop} == false && ${product_shutdown} == true ]] || return 1
  [[ ${remote} == "${candidate}" && ${completes} == 1 && ${awaits} == 0 &&
    ${registers} == 1 && ${stops} == 0 && ${cleanup} == true &&
    ${mailbox_target} == main &&
    ${harness} == false &&
    (${terminal} == stopped || ${terminal} == finished) ]] || return 1
  if [[ ${scenario} == source ]]; then
    [[ ${state} == success ]] || return 1
    awk '/publication/{a=NR} /registration/{b=NR} /complete-start/{c=NR} /ci-release/{d=NR} /coverage-success/{e=NR} /shutdown/{f=NR} /cleanup-complete/{g=NR} END{exit !(a<b && b<c && c<d && d<e && e<f && f<g)}' "${observations}"
  else
    [[ ${state} == not_required && ${basis} == success ]] || return 1
    grep -Fq 'provider-candidate-calls: 0' "${observations}"
    awk '/publication/{a=NR} /registration/{b=NR} /coverage-not-required/{c=NR} /complete-start/{d=NR} /shutdown/{e=NR} /cleanup-complete/{f=NR} END{exit !(a<b && b<c && c<d && d<e && e<f)}' "${observations}"
  fi
}

trunk_closure_write_assessor_observation() {
  local path=$1 scenario=$2 state=$3 basis=$4 provider_calls=$5
  local complete_count=${6-1}
  local order=${7-normal}
  local forced_stop=${8-false}
  {
    printf 'scenario: %s\nremote-sha: abc\ncandidate-sha: abc\n' "${scenario}"
    printf 'mailbox-target: main\n'
    printf 'coverage-state: %s\nbasis-state: %s\n' "${state}" "${basis}"
    printf 'observer-terminal: stopped\ncomplete-count: %s\n' "${complete_count}"
    printf 'await-count: 0\nregister-count: 1\nstop-count: 0\n'
    printf 'product-shutdown: true\nforced-stop: %s\n' "${forced_stop}"
    printf 'checkout-present-after: false\ncleanup-complete: true\n'
    printf 'provider-candidate-calls: %s\nharness-inspected: false\ncontrol-order:\n' "${provider_calls}"
    if [[ ${scenario} == source ]]; then
      if [[ ${order} == normal ]]; then
        printf '  publication\n  registration\n  complete-start\n  ci-release\n  coverage-success\n  shutdown\n  cleanup-complete\n'
      else
        printf '  publication\n  registration\n  shutdown\n  complete-start\n  ci-release\n  coverage-success\n  cleanup-complete\n'
      fi
    else
      printf '  publication\n  registration\n  coverage-not-required\n  complete-start\n  shutdown\n  cleanup-complete\n'
    fi
  } > "${path}"
}

run_trunk_closure_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  trunk_closure_write_assessor_observation \
    "${work}/source.txt" source success none 1
  trunk_closure_assess source "${work}/source.txt"
  trunk_closure_write_assessor_observation \
    "${work}/ignored.txt" ignored-only not_required success 0
  trunk_closure_assess ignored-only "${work}/ignored.txt"
  trunk_closure_write_assessor_observation \
    "${work}/missing-complete.txt" source success none 1 0
  ! trunk_closure_assess source "${work}/missing-complete.txt"
  trunk_closure_write_assessor_observation \
    "${work}/early-shutdown.txt" source success none 1 1 early
  ! trunk_closure_assess source "${work}/early-shutdown.txt"
  trunk_closure_write_assessor_observation \
    "${work}/ignored-provider.txt" ignored-only not_required success 1
  ! trunk_closure_assess ignored-only "${work}/ignored-provider.txt"
  trunk_closure_write_assessor_observation \
    "${work}/forced-stop.txt" source success none 1 1 normal true
  ! trunk_closure_assess source "${work}/forced-stop.txt"
  echo 'PASS: Trunk closure assessor accepts source and ignored-only completion; rejects a missing complete-revision, early shutdown, invented ignored-only provider run, and fixture-masked shutdown.'
}
