#!/usr/bin/env bash
# Controlled native journeys for Trunk Mode completion after final publication.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/trunk-closure-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-fixture.sh"

trunk_closure_write_evidence_identity() {
  printf 'helper-identity: tests/support/trunk-closure-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/trunk-closure-native-fixture.sh\n'
  printf 'assessor-identity: tests/support/trunk-closure-native-run.sh\n'
  native_result_input_hash_line tests/git-publication-native.sh
  native_result_input_hash_line tests/support/git-publication-native-host.sh
  native_result_input_hash_line tests/support/trunk-closure-native-run.sh
  native_result_input_hash_line tests/support/trunk-closure-native-fixture.sh
  native_result_input_hash_line tests/support/git-publication-native-run.sh
  native_result_input_hash_line tests/support/native-run-supervise.sh
  native_result_input_hash_line src/skills/dough-execute-plan/references/trunk-publication.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/ci-monitor.md
  native_result_input_hash_line src/skills/dough-story-wrap-up/SKILL.md
}

trunk_closure_wait_for() {
  local description=$1
  local command=$2
  local deadline=$((SECONDS + 360))
  until eval "${command}"; do
    if ((SECONDS >= deadline)); then
      printf 'error: timed out waiting for %s\n' "${description}" >&2
      return 1
    fi
    sleep 0.05
  done
}

trunk_closure_controller() {
  local scenario=$1
  local remote_sha coverage
  trunk_closure_wait_for publication \
    "[[ \$(git ls-remote '${trunk_closure_origin}' refs/heads/main | awk '{print \$1}') == '${trunk_closure_candidate_sha}' ]]" || return
  printf 'publication\n' >> "${trunk_closure_control_log}"
  trunk_closure_wait_for registration \
    "test -f '${trunk_closure_registered}'" || return
  printf 'registration\n' >> "${trunk_closure_control_log}"
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  if [[ ${scenario} == source ]]; then
    trunk_closure_wait_for await \
      "grep -Fq 'await-revision ${trunk_closure_mailbox} ${trunk_closure_candidate_sha}' '${trunk_closure_node_log}'" || return
    printf 'await\n' >> "${trunk_closure_control_log}"
    : > "${trunk_closure_release}"
    printf 'ci-release\n' >> "${trunk_closure_control_log}"
    trunk_closure_wait_for coverage "grep -q '\"state\":\"success\"' '${coverage}'" || return
  else
    trunk_closure_wait_for coverage "grep -q '\"state\":\"not_required\"' '${coverage}'" || return
    printf 'coverage-not-required\n' >> "${trunk_closure_control_log}"
    trunk_closure_wait_for await \
      "grep -Fq 'await-revision ${trunk_closure_mailbox} ${trunk_closure_candidate_sha}' '${trunk_closure_node_log}'" || return
    printf 'await\n' >> "${trunk_closure_control_log}"
  fi
  [[ ${scenario} != source ]] || printf 'coverage-success\n' >> "${trunk_closure_control_log}"
  trunk_closure_wait_for shutdown \
    "grep -Fq 'stop ${trunk_closure_mailbox}' '${trunk_closure_node_log}'" || return
  printf 'shutdown\n' >> "${trunk_closure_control_log}"
  trunk_closure_wait_for cleanup "test -f '${trunk_closure_cleanup_marker}'" || return
  printf 'cleanup-complete\n' >> "${trunk_closure_control_log}"
  remote_sha=$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')
  [[ ${remote_sha} == "${trunk_closure_candidate_sha}" ]]
}

trunk_closure_observe() {
  local scenario=$1
  local transcript=$2
  local response=$3
  local coverage state=missing basis_state=none terminal=missing
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${coverage} ]] && basis_state=$(jq -r '.basis.state // "none"' "${coverage}")
  [[ -f ${trunk_closure_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${trunk_closure_mailbox}/result.json")
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'remote-sha: %s\n' "$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')"
    printf 'candidate-sha: %s\n' "${trunk_closure_candidate_sha}"
    printf 'coverage-state: %s\n' "${state}"
    printf 'basis-state: %s\n' "${basis_state}"
    printf 'observer-terminal: %s\n' "${terminal}"
    printf 'await-count: %s\n' "$(grep -Fc "await-revision ${trunk_closure_mailbox} ${trunk_closure_candidate_sha}" "${trunk_closure_node_log}" || true)"
    printf 'register-count: %s\n' "$(grep -Fc "register-push ${trunk_closure_mailbox} ${trunk_closure_candidate_sha}" "${trunk_closure_node_log}" || true)"
    printf 'stop-count: %s\n' "$(grep -Fc "stop ${trunk_closure_mailbox}" "${trunk_closure_node_log}" || true)"
    printf 'cleanup-complete: %s\n' "$([[ -f ${trunk_closure_cleanup_marker} ]] && echo true || echo false)"
    printf 'provider-candidate-calls: %s\n' "$(grep -Fc "${trunk_closure_candidate_sha}" "${trunk_closure_gh_log}" || true)"
    printf 'control-order:\n'
    sed 's/^/  /' "${trunk_closure_control_log}"
    printf 'response-wait-result: %s\n' "$(grep -Eiq 'CI.+(success|not.required)|success.+CI|not.required' "${response}" && echo true || echo false)"
    printf 'transcript-await: %s\n' "$(grep -Fq 'await-revision' "${transcript}" && echo true || echo false)"
    printf 'harness-inspected: %s\n' "$(grep -Eiq 'trunk-closure-native|native harness|trunk-closure/(source|ignored-only)' "${transcript}" && echo true || echo false)"
  }
}

trunk_closure_assess() {
  local scenario=$1
  local observations=$2
  local remote candidate state basis terminal awaits registers stops cleanup harness
  remote=$(awk '/^remote-sha:/{print $2}' "${observations}")
  candidate=$(awk '/^candidate-sha:/{print $2}' "${observations}")
  state=$(awk '/^coverage-state:/{print $2}' "${observations}")
  basis=$(awk '/^basis-state:/{print $2}' "${observations}")
  terminal=$(awk '/^observer-terminal:/{print $2}' "${observations}")
  awaits=$(awk '/^await-count:/{print $2}' "${observations}")
  registers=$(awk '/^register-count:/{print $2}' "${observations}")
  stops=$(awk '/^stop-count:/{print $2}' "${observations}")
  cleanup=$(awk '/^cleanup-complete:/{print $2}' "${observations}")
  harness=$(awk '/^harness-inspected:/{print $2}' "${observations}")
  [[ ${remote} == "${candidate}" && ${awaits} == 1 && ${registers} == 1 &&
    ${stops} == 1 && ${cleanup} == true &&
    ${harness} == false &&
    (${terminal} == stopped || ${terminal} == finished) ]] || return 1
  if [[ ${scenario} == source ]]; then
    [[ ${state} == success ]] || return 1
    awk '/publication/{a=NR} /registration/{b=NR} /^  await$/{c=NR} /ci-release/{d=NR} /coverage-success/{e=NR} /shutdown/{f=NR} /cleanup-complete/{g=NR} END{exit !(a<b && b<c && c<d && d<e && e<f && f<g)}' "${observations}"
  else
    [[ ${state} == not_required && ${basis} == success ]] || return 1
    grep -Fq 'provider-candidate-calls: 0' "${observations}"
    awk '/publication/{a=NR} /registration/{b=NR} /coverage-not-required/{c=NR} /^  await$/{d=NR} /shutdown/{e=NR} /cleanup-complete/{f=NR} END{exit !(a<b && b<c && c<d && d<e && e<f)}' "${observations}"
  fi
}

trunk_closure_write_assessor_observation() {
  local path=$1 scenario=$2 state=$3 basis=$4 provider_calls=$5
  local await_count=${6-1}
  local order=${7-normal}
  {
    printf 'scenario: %s\nremote-sha: abc\ncandidate-sha: abc\n' "${scenario}"
    printf 'coverage-state: %s\nbasis-state: %s\n' "${state}" "${basis}"
    printf 'observer-terminal: stopped\nawait-count: %s\n' "${await_count}"
    printf 'register-count: 1\nstop-count: 1\ncleanup-complete: true\n'
    printf 'provider-candidate-calls: %s\nharness-inspected: false\ncontrol-order:\n' "${provider_calls}"
    if [[ ${scenario} == source ]]; then
      if [[ ${order} == normal ]]; then
        printf '  publication\n  registration\n  await\n  ci-release\n  coverage-success\n  shutdown\n  cleanup-complete\n'
      else
        printf '  publication\n  registration\n  shutdown\n  await\n  ci-release\n  coverage-success\n  cleanup-complete\n'
      fi
    else
      printf '  publication\n  registration\n  coverage-not-required\n  await\n  shutdown\n  cleanup-complete\n'
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
    "${work}/missing-wait.txt" source success none 1 0
  ! trunk_closure_assess source "${work}/missing-wait.txt"
  trunk_closure_write_assessor_observation \
    "${work}/early-shutdown.txt" source success none 1 1 early
  ! trunk_closure_assess source "${work}/early-shutdown.txt"
  trunk_closure_write_assessor_observation \
    "${work}/ignored-provider.txt" ignored-only not_required success 1
  ! trunk_closure_assess ignored-only "${work}/ignored-provider.txt"
  echo 'PASS: Trunk closure assessor accepts source and ignored-only completion; rejects a missing wait, early shutdown, and an invented ignored-only provider run.'
}

trunk_closure_prompt_for() {
  printf '%s\n' "Use this project's installed Open Dough guidance. Complete the retained Trunk Mode final-closure candidate described in .planning/execution-state.txt, including its authorized publication, CI observation handoff, and local resource cleanup. Preserve the pending human edit in the separate default checkout and report the observed closure result. Treat the installed guidance and retained project state as the task inputs; do not inspect parent processes or external test-harness source."
}

trunk_closure_run_journey() {
  local source_dir=$1 host=$2 scenario=$3 results_dir=$4
  local root prompt controller_pid run_status=0 stop_status=0
  root=$(mktemp -d)
  trunk_closure_create_fixture "${source_dir}" "${host}" "${scenario}" "${root}"
  prompt=$(trunk_closure_prompt_for)
  native_case_host=${host}
  native_case_id="trunk-closure/${scenario}"
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${root}/events.jsonl"
  output_file="${root}/response.md"
  native_stderr="${root}/stderr.log"
  target=${trunk_closure_workspace}
  native_run_workspace=${trunk_closure_workspace}
  platform=${host}
  : > "${transcript}"
  : > "${native_stderr}"
  trunk_closure_controller "${scenario}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1
  if [[ ! -f ${trunk_closure_mailbox}/result.json ]]; then
    (cd "${trunk_closure_workspace}" \
      && node "${trunk_closure_launcher}" stop "${trunk_closure_mailbox}") \
      > "${root}/forced-stop.txt" || stop_status=$?
  fi
  trunk_closure_observe "${scenario}" "${transcript}" "${output_file}" \
    > "${root}/observations.txt"
  if trunk_closure_assess "${scenario}" "${root}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='final publication, bounded wait, shutdown, and cleanup order observed'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='Trunk Mode closure ordering was not observed'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" \
    "${transcript}" "${output_file}" "${native_stderr}" \
    "${root}/observations.txt" trunk-closure
  printf 'run-status: %s\nassessment-status: %s\nassessment-reason: %s\n' \
    "${run_status}" "${git_publication_assess_status}" \
    "${git_publication_assess_reason}"
  printf 'observations:\n'
  cat "${root}/observations.txt"
  if [[ ${run_status} -ne 0 ]]; then
    printf 'response:\n'
    cat "${output_file}" 2> /dev/null || true
    printf 'stderr:\n'
    cat "${native_stderr}" 2> /dev/null || true
  fi
  trunk_closure_cleanup_fixture
  rm -rf -- "${root}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
