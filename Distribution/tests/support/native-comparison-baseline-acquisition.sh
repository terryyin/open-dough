#!/usr/bin/env bash
# Baseline acquisition uses one applicability decision; the pair remains the
# only launcher and outcome judge. A miss starts a fresh arm, never a retry.
# shellcheck disable=SC2034,SC2154,SC2312 # Entry and pair globals.
native_comparison_baseline_acquire() {
  local case_name=$1 source_dir=$2 work=$3 dest=$4 revision route machine
  read -r revision _ < "${work}/payload-baseline.id"
  route=substitute
  [[ ! -L $(command -v codex) ]] || route=native
  machine=$(native_comparison_machine)
  native_comparison_acquisition_arguments=("${work}" "${dest}" "${source_dir}" "${reuse_baseline:-}"
    "${case_name}" "${revision}" "${model}" "${effort}" "$(codex --version | head -n 1)"
    "${route}" "${machine}" "${require_usage:-false}" "${fresh_pair:-false}" "$(command -v codex)")
  node "${source_dir}/Distribution/tests/support/native-comparison-baseline-acquisition.mjs" prepare \
    "${native_comparison_acquisition_arguments[@]}"
  native_comparison_baseline_reused=$(jq -r .reused "${work}/baseline-acquisition.json")
}

native_comparison_baseline_finish() {
  node "${source_dir}/Distribution/tests/support/native-comparison-baseline-acquisition.mjs" finish \
    "${native_comparison_acquisition_arguments[@]}"
}
