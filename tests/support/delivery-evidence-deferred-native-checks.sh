#!/usr/bin/env bash
# Named green producer proof does not observe the incompatible E2E caller.
run_delivery_evidence_deferred_checks() {
  local root status
  root=$(mktemp -d)
  git init --quiet -b main "${root}/workspace"
  delivery_evidence_deferred_populate_fixture "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/producer.test.mjs) > "${root}/producer.txt" 2>&1
  status=0
  (cd "${root}/workspace" && node --test --test-reporter=tap e2e/stand-in-compat.test.mjs) > "${root}/caller.txt" 2>&1 || status=$?
  [[ ${status} -ne 0 ]]
  grep -q 'releaseTag is required' "${root}/caller.txt"
  grep -q 'not ok .*e2e stand-in builds command with current factory contract' "${root}/caller.txt"
  delivery_evidence_consumers_write_stand_in_two_arg "${root}/workspace"
  delivery_evidence_consumers_write_compat_tests_two_arg "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/producer.test.mjs e2e/*.test.mjs) > "${root}/corrected.txt" 2>&1
  (cd "${root}/workspace" && git diff --exit-code -- lib/statusBadge.mjs tests/status-badge.test.mjs)
  rm -rf -- "${root}"
}
