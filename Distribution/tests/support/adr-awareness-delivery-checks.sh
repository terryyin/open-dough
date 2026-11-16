#!/usr/bin/env bash
# Routine delivery transition check; native fixture helpers stay case-owned.
# shellcheck disable=SC2154 # Fixture helpers provide delivery paths.

delivery_run_deterministic_transition() {
  local output

  delivery_prepare_fixture
  delivery_assert_baseline_install
  delivery_capture_update_state
  output="${delivery_temporary_dir}/deterministic-update-output.txt"
  delivery_apply_ordinary_from_recorded_source "${output}"
  delivery_assert_update "${output}" 0
}
