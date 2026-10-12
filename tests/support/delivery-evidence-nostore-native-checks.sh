#!/usr/bin/env bash
# Credential-free discrimination of both purposes at the endpoint boundary.
run_delivery_evidence_nostore_checks() {
  local root status
  root=$(mktemp -d)
  delivery_evidence_nostore_write_baseline "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/*.test.mjs e2e/*.test.mjs) > "${root}/baseline.txt" 2>&1
  delivery_evidence_nostore_write_unconditional "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/exit-settings.test.mjs) > "${root}/focused.txt" 2>&1
  status=0
  (cd "${root}/workspace" && node --test --test-reporter=tap e2e/*.test.mjs) > "${root}/changed.txt" 2>&1 || status=$?
  [[ ${status} -ne 0 ]]
  grep -q 'not ok .*missing and blank preset references remain observable without a store' "${root}/changed.txt"
  grep -q 'not ok .*named-genome holding returns its error row without a store' "${root}/changed.txt"
  grep -q 'ENOENT' "${root}/changed.txt"
  delivery_evidence_nostore_write_correction "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/*.test.mjs e2e/*.test.mjs) > "${root}/corrected.txt" 2>&1
  node --input-type=module - "${root}/workspace/lib/exit-settings.mjs" << 'JS'
import assert from 'node:assert/strict';
const { computeExitSettings } = await import(process.argv[2]);
let calls = 0;
const read = () => { calls++; return 'latest'; };
computeExitSettings('unused', [{ id: 'a', preset: 'daily' }, { id: 'b', preset: 'daily' }], read);
assert.equal(calls, 1);
computeExitSettings('unused', [{ id: 'missing' }, { id: 'blank', preset: ' ' }, { id: 'named', preset: 'daily', genome: 'growth' }], read);
assert.equal(calls, 1);
JS
  rm -rf -- "${root}"
}
