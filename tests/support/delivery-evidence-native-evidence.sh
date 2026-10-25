#!/usr/bin/env bash
# Evidence identity and retained review artifacts for delivery-evidence journeys.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-import-closure.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-import-closure.sh"

# These journeys retain observations for explicit review, never prose certification.
delivery_evidence_requires_review() {
  case $1 in
    aggregate | nostore | deferred | original | terminal | release | drift) return 0 ;;
    *) return 1 ;;
  esac
}

# Hashes the installed guidance HOST's round reads; the drift family also
# exercises the story-obligation gate, so its scripts and guidance are captured.
delivery_evidence_capture_installed_inputs() {
  local host=$1 case_name=$2
  local installed_root='.agents/skills'
  [[ ${host} != claude ]] || installed_root='.claude/skills'
  local -a inputs=(
    "${installed_root}/dough-execute-plan/references/delegation.md"
    "${installed_root}/dough-execute-plan/references/wrap-up.md"
    "${installed_root}/dough-story-refinement/references/executable-proof.md"
  )
  if [[ ${case_name} == drift ]]; then
    inputs+=(
      "${installed_root}/dough-execute-plan/scripts/story-obligations.mjs"
      "${installed_root}/dough-execute-plan/scripts/story-obligation-reader.mjs"
      "${installed_root}/dough-execute-plan/scripts/story-obligation-source-review.mjs"
      "${installed_root}/dough-execute-plan/references/story-obligations.md"
    )
  fi
  (
    cd -- "${delivery_evidence_workspace}" || exit
    shasum -a 256 "${inputs[@]}"
  ) > "${delivery_evidence_root}/installed-inputs.sha256"
}

delivery_evidence_write_evidence_identity() {
  local case_name=$1
  local case_prefix="tests/support/delivery-evidence-${case_name}-native"
  delivery_evidence_case_known "${case_name}" || return 2
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
    tests/support/delivery-evidence-native-cases.sh \
    tests/support/delivery-evidence-native-prompt.sh \
    tests/support/delivery-evidence-native-evidence.sh \
    tests/support/delivery-evidence-native-payload.sh \
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
  if [[ ${case_name} == scheduling ]]; then
    native_result_input_hash_lines \
      tests/proof-scheduling-native.sh \
      "${case_prefix}-checks.sh" \
      "${case_prefix}-stylesheet-content.sh" \
      "${case_prefix}-library-content.sh" \
      "${case_prefix}-proof-logger.sh" \
      tests/support/delivery-evidence-promise-status.sh \
      src/skills/dough-execute-plan/SKILL.md \
      src/skills/dough-post-change-refactor/SKILL.md \
      src/skills/dough-story-refinement/references/executable-proof.md
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
  if [[ ${case_name} == original ]]; then
    native_result_input_hash_lines \
      tests/fixtures/delivery-evidence/readiness-original-story.md \
      src/skills/dough-execute-plan/references/story-obligations.md
  fi
  if [[ ${case_name} == terminal ]]; then
    native_result_input_hash_lines \
      tests/fixtures/delivery-evidence/terminal-original-story.md \
      tests/fixtures/delivery-evidence/terminal-narrowed-plan.md \
      tests/fixtures/delivery-evidence/terminal-implementation-return.md \
      tests/fixtures/delivery-evidence/terminal-precomputed.json \
      tests/fixtures/delivery-evidence/terminal-human-amendment.md \
      tests/support/delivery-evidence-original-native-assess.sh \
      src/skills/dough-execute-plan/references/story-obligations.md
  fi
  if [[ ${case_name} == amended ]]; then
    native_result_input_hash_lines \
      tests/fixtures/delivery-evidence/amended-backlog.md \
      tests/fixtures/delivery-evidence/amended-seed.md \
      tests/fixtures/delivery-evidence/amended-plan.md \
      "${case_prefix}-product-content.sh" \
      tests/support/native-host-stream.sh \
      src/skills/dough-execute-plan/references/source-freshness.md \
      src/skills/dough-execute-plan/references/story-obligations.md \
      src/skills/dough-execute-plan/references/finish-or-stop.md
    native_import_closure_input_hash_lines \
      src/skills/dough-execute-plan/scripts/source-freshness.mjs \
      src/skills/dough-execute-plan/scripts/story-obligations.mjs
  fi
  if [[ ${case_name} == release ]]; then
    native_result_input_hash_lines \
      tests/fixtures/delivery-evidence/release-original-story.md \
      tests/fixtures/delivery-evidence/release-narrowed-plan.md \
      tests/fixtures/delivery-evidence/release-implementation-return.md \
      tests/fixtures/delivery-evidence/release-status-projection.py \
      tests/fixtures/delivery-evidence/release-corrected-status-projection.py \
      tests/support/delivery-evidence-original-native-assess.sh \
      src/skills/dough-execute-plan/references/story-obligations.md
  fi
  if [[ ${case_name} == drift ]]; then
    native_result_input_hash_lines \
      tests/fixtures/delivery-evidence/drift-original-story.md \
      tests/fixtures/delivery-evidence/drift-narrowed-plan.md \
      tests/fixtures/delivery-evidence/drift-implementation-return.md \
      tests/fixtures/delivery-evidence/drift-human-amendment.md \
      src/skills/dough-execute-plan/references/story-obligations.md
    native_import_closure_input_hash_lines \
      src/skills/dough-execute-plan/scripts/story-obligations.mjs
  fi
}

# Original-source acceptance retains actual product/proof state for a human
# review. Each product supplies its observer and focused proof command.
delivery_evidence_observe_source_acceptance() {
  local scenario=$1 workspace=$2 response=$3 transcript=$4 product_observer=$5
  shift 5
  local evidence_root product_status=0 proof_status=0
  evidence_root=$(dirname -- "${transcript}")
  native_host_stream "${native_case_host}" "${transcript}" calls \
    > "${evidence_root}/command-results.jsonl"
  native_host_stream "${native_case_host}" "${transcript}" reads \
    > "${evidence_root}/file-reads.jsonl"
  git -C "${workspace}" diff > "${evidence_root}/final-product.diff"
  "${product_observer}" "${workspace}" \
    > "${evidence_root}/product-observation.json" \
    2> "${evidence_root}/product-observation.stderr" || product_status=$?
  (cd -- "${workspace}" && "$@") \
    > "${evidence_root}/final-proof.txt" 2>&1 || proof_status=$?
  printf 'scenario: %s\n' "${scenario}"
  printf 'judgment: review-required\n'
  printf 'product-observation-status: %s\n' "${product_status}"
  printf 'focused-proof-status: %s\n' "${proof_status}"
  printf 'review-complete: false\n'
  printf 'harness-inspected: %s\n' "$(native_harness_inspected 'tests/support/delivery-evidence-.*-native|native harness source' "${transcript}" "${response}")"
}

delivery_evidence_retain_source_acceptance() {
  local file
  for file in product-observation.json product-observation.stderr final-proof.txt; do
    native_result_copy_if_present "${delivery_evidence_root}/${file}" "${file}"
  done
  cp -R -- "${delivery_evidence_root}/original-inputs" "${native_result_attempt_dir}/"
  mkdir -p -- "${native_result_attempt_dir}/final-product"
  cp -R -- "${delivery_evidence_workspace}/.planning" "${native_result_attempt_dir}/final-product/"
  for file in "$@"; do
    cp -R -- "${delivery_evidence_workspace}/${file}" "${native_result_attempt_dir}/final-product/"
  done
}

delivery_evidence_retain_review_artifacts() {
  local retain="delivery_evidence_${1}_retain_review_artifacts"
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/status-proof.md" status-proof.md
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/producer-proof.md" producer-proof.md
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/implementation-return.md" implementation-return.md
  native_result_copy_if_present "${delivery_evidence_workspace}/.planning/slice-promises.md" slice-promises.md
  native_result_copy_if_present "${delivery_evidence_root}/installed-inputs.sha256" installed-inputs.sha256
  native_result_copy_if_present "${delivery_evidence_root}/command-results.jsonl" command-results.jsonl
  native_result_copy_if_present "${delivery_evidence_root}/file-reads.jsonl" file-reads.jsonl
  native_result_copy_if_present "${delivery_evidence_root}/final-product.diff" final-product.diff
  if declare -F "${retain}" > /dev/null; then
    "${retain}"
    return
  fi
  mkdir -p -- "${native_result_attempt_dir}/final-product"
  cp -R -- "${delivery_evidence_workspace}/lib" "${delivery_evidence_workspace}/tests" "${delivery_evidence_workspace}/e2e" "${native_result_attempt_dir}/final-product/"
}
