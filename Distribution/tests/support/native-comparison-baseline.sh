#!/usr/bin/env bash
# A standalone frozen arm and immutable baseline export/reassessment. The
# archive helper owns durable evidence; the existing runner owns execution.
# shellcheck disable=SC2034,SC2154,SC2312 # Runner globals, set for the frozen arm.
native_comparison_baseline_capture() {
  local case_name=$1 source_dir=$2 work=$3 results_dir=$4 case_files tree
  native_comparison_case_files "${source_dir}" "${case_name}" || return 2
  native_comparison_basis_commit "${source_dir}" "Distribution/tests/native-comparison/${case_name}" \
    "${case_files[@]}" "${native_comparison_inputs[@]}" "${native_run_supervision_inputs[@]}" \
    "${native_comparison_pair_inputs[@]}" > /dev/null || return 2
  native_comparison_pair_freeze baseline "${native_comparison_pair_baseline}" "${work}" || return 2
  local native_comparison_payload_dir="${work}/payload-baseline" native_comparison_payload_revision native_comparison_payload_requested
  read -r native_comparison_payload_revision tree native_comparison_payload_requested < "${work}/payload-baseline.id"
  native_comparison_run_case "${case_name}" "${source_dir}" "${work}" "${results_dir}"
}

native_comparison_baseline_export() {
  node "${source_dir}/Distribution/tests/support/native-comparison-archive.mjs" export \
    "$1" "$2" "${source_dir}" "${work}/archive-observations.txt" "${baseline_arm}"
}

native_comparison_baseline_assess() {
  node "${source_dir}/Distribution/tests/support/native-comparison-archive.mjs" assess \
    "$1" '' "${source_dir}" "${work}/archive-observations.txt"
}
