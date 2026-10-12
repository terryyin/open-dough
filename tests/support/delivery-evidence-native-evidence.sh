#!/usr/bin/env bash
# Evidence identity and retained review artifacts for delivery-evidence journeys.
# shellcheck disable=SC2034,SC2154,SC2312

# These journeys retain observations for explicit review, never prose certification.
delivery_evidence_requires_review() {
  case $1 in
    aggregate | nostore | deferred) return 0 ;;
    *) return 1 ;;
  esac
}

delivery_evidence_capture_installed_inputs() {
  local installed_root='.agents/skills'
  [[ $1 != claude ]] || installed_root='.claude/skills'
  (
    cd -- "${delivery_evidence_workspace}" || exit
    shasum -a 256 \
      "${installed_root}/dough-execute-plan/references/delegation.md" \
      "${installed_root}/dough-execute-plan/references/wrap-up.md" \
      "${installed_root}/dough-story-refinement/references/executable-proof.md"
  ) > "${delivery_evidence_root}/installed-inputs.sha256"
}

delivery_evidence_write_evidence_identity() {
  local case_name=$1
  local case_prefix="tests/support/delivery-evidence-${case_name}-native"
  printf 'helper-identity: tests/support/delivery-evidence-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/delivery-evidence-native-run.sh\n'
  printf 'scenario-content-identity: %s-scenario-content.sh\n' "${case_prefix}"
  printf 'observe-identity: %s-observe.sh\n' "${case_prefix}"
  printf 'assessor-identity: %s-assess.sh\n' "${case_prefix}"
  native_result_input_hash_lines \
    tests/git-publication-native.sh \
    tests/support/git-publication-native-host.sh \
    tests/support/delivery-evidence-native-run.sh \
    tests/support/delivery-evidence-native-prompt.sh \
    tests/support/delivery-evidence-native-evidence.sh \
    tests/support/native-observation.sh \
    "${case_prefix}-assess.sh" \
    "${case_prefix}-observe.sh" \
    "${case_prefix}-scenario-content.sh" \
    tests/support/git-publication-native-run.sh
  native_result_supervision_input_hash_lines
  native_result_input_hash_lines \
    src/skills/dough-execute-plan/references/wrap-up.md \
    src/skills/dough-execute-plan/references/delegation.md
  if [[ ${case_name} == nostore || ${case_name} == deferred ]]; then
    native_result_input_hash_lines tests/support/delivery-evidence-aggregate-native-observe.sh
  fi
  if [[ ${case_name} == deferred ]]; then
    native_result_input_hash_lines tests/support/delivery-evidence-consumers-native-scenario-content.sh
  fi
  if [[ ${case_name} == selection ]]; then
    native_result_input_hash_lines \
      "${case_prefix}-repository-content.sh" \
      "${case_prefix}-proof-logger.sh"
  fi
  if [[ ${case_name} == consumers ]] || delivery_evidence_requires_review "${case_name}"; then
    native_result_input_hash_lines \
      src/skills/dough-story-refinement/references/executable-proof.md
  fi
}

delivery_evidence_retain_review_artifacts() {
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/status-proof.md" status-proof.md
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/producer-proof.md" producer-proof.md
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/implementation-return.md" implementation-return.md
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/slice-promises.md" slice-promises.md
  native_result_copy_if_present "${delivery_evidence_root}/installed-inputs.sha256" installed-inputs.sha256
  native_result_copy_if_present "${delivery_evidence_root}/command-results.jsonl" command-results.jsonl
  native_result_copy_if_present "${delivery_evidence_root}/file-reads.jsonl" file-reads.jsonl
  native_result_copy_if_present "${delivery_evidence_root}/final-product.diff" final-product.diff
  mkdir -p -- "${native_result_attempt_dir}/final-product"
  cp -R -- "${delivery_evidence_workspace}/lib" "${delivery_evidence_workspace}/tests" "${delivery_evidence_workspace}/e2e" "${native_result_attempt_dir}/final-product/"
}
