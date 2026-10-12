#!/usr/bin/env bash
# Keep host-attributed results and inspected files separate from prose judgment.
# The reviewing maintainer inspects these and the retained final product state.
# shellcheck disable=SC2154,SC2312
delivery_evidence_aggregate_observe() {
  local scenario=$1 workspace=$2 response=$3 transcript=$4
  local evidence_root
  evidence_root=$(dirname -- "${transcript}")
  native_host_stream "${native_case_host}" "${transcript}" calls > "${evidence_root}/command-results.jsonl"
  native_host_stream "${native_case_host}" "${transcript}" reads > "${evidence_root}/file-reads.jsonl"
  git -C "${workspace}" diff > "${evidence_root}/final-product.diff"
  printf 'scenario: %s\n' "${scenario}"
  printf 'judgment: review-required\n'
  printf 'harness-inspected: %s\n' "$(native_harness_inspected 'tests/support/delivery-evidence-aggregate-native|native harness source' "${transcript}" "${response}")"
}
