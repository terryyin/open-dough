#!/usr/bin/env bash
# Credential-free reconstruction and observation checks, never native proof.
# shellcheck disable=SC2154
run_delivery_evidence_aggregate_checks() {
  local root status
  root=$(mktemp -d)
  delivery_evidence_aggregate_write_baseline "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/*.test.mjs e2e/*.test.mjs) > "${root}/baseline.txt" 2>&1
  delivery_evidence_aggregate_write_reorder "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/*.test.mjs) > "${root}/focused.txt" 2>&1
  status=0
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/*.test.mjs e2e/*.test.mjs) > "${root}/changed.txt" 2>&1 || status=$?
  [[ ${status} -ne 0 ]]
  grep -q 'not ok .*membership makes no live or completion claim' "${root}/changed.txt"
  delivery_evidence_aggregate_write_correction "${root}/workspace"
  (cd "${root}/workspace" && node --test --test-reporter=tap tests/*.test.mjs e2e/*.test.mjs) > "${root}/corrected.txt" 2>&1
  # No fabricated summary, removed assertion, or contamination becomes an
  # automatic pass: the aggregate case requires inspected native evidence.
  local claim
  for claim in 'accepted: all' 'command: node --test e2e/membership.test.mjs' 'assertions: removed' 'harness-inspected: true' 'stream: incomplete'; do
    printf '%s\n' "${claim}" > "${root}/observations.txt"
    if delivery_evidence_aggregate_assess "${root}/observations.txt"; then
      echo 'FAIL: aggregate requires explicit review' >&2
      return 1
    fi
  done
  node --input-type=module - "${source_dir}/tests/support/native-host-stream.mjs" << 'JS'
import assert from 'node:assert/strict';
const { readHostStreamText } = await import(process.argv[2]);
const prose = { type: 'assistant', message: { content: [{ type: 'text', text: 'node --test e2e/membership.test.mjs passed' }] } };
const start = { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'proof', name: 'Bash', input: { command: 'node --test e2e/membership.test.mjs' } }] } };
const result = { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'proof', content: 'not ok 1 - membership makes no live or completion claim' }] } };
const read = events => readHostStreamText('claude', events.map(JSON.stringify).join('\n'));
assert.equal(read([prose]).calls.length, 0);
assert.equal(read([start]).calls[0].output, null);
assert.match(read([start, result]).calls[0].output, /not ok 1/);
JS
  rm -rf -- "${root}"
}
