#!/usr/bin/env bash
# Factory, stand-in and test content shared by consumer acceptance fixtures.
# shellcheck disable=SC2312

delivery_evidence_consumers_write_factory_one_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/commandFactory.mjs" << 'EOF'
// Shared command factory: one-arg contract.
export function createCommand(context) {
  return { context, kind: 'command' };
}
EOF
}

delivery_evidence_consumers_write_factory_two_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/commandFactory.mjs" << 'EOF'
// Shared command factory: releaseTag is required.
export function createCommand(context, releaseTag) {
  if (releaseTag === undefined || releaseTag === null) {
    throw new TypeError('releaseTag is required');
  }
  return { context, releaseTag, kind: 'command' };
}
EOF
}

delivery_evidence_consumers_write_stand_in_one_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/e2e/support"
  cat > "${workspace}/e2e/support/e2eStandIn.mjs" << 'EOF'
import { createCommand } from '../../lib/commandFactory.mjs';

// E2E stand-in that constructs commands through the shared factory.
export function buildE2eCommand(context) {
  return createCommand(context);
}
EOF
}

delivery_evidence_consumers_write_stand_in_two_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/e2e/support"
  cat > "${workspace}/e2e/support/e2eStandIn.mjs" << 'EOF'
import { createCommand } from '../../lib/commandFactory.mjs';

// E2E stand-in aligned to the current factory contract.
export function buildE2eCommand(context, releaseTag) {
  return createCommand(context, releaseTag);
}
EOF
}

delivery_evidence_consumers_write_producer_tests_one_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/producer.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommand } from '../lib/commandFactory.mjs';

test('producer builds command from context', () => {
  assert.equal(createCommand({ id: 1 }).kind, 'command');
});
EOF
}

delivery_evidence_consumers_write_producer_tests_two_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/producer.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommand } from '../lib/commandFactory.mjs';

test('producer builds command with release tag', () => {
  const cmd = createCommand({ id: 1 }, 'v1.0.0');
  assert.equal(cmd.releaseTag, 'v1.0.0');
  assert.equal(cmd.kind, 'command');
});
EOF
}

delivery_evidence_consumers_write_compat_tests_one_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/e2e"
  cat > "${workspace}/e2e/stand-in-compat.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildE2eCommand } from './support/e2eStandIn.mjs';

test('e2e stand-in builds command with current factory contract', () => {
  assert.equal(buildE2eCommand({ id: 1 }).kind, 'command');
});
EOF
}

delivery_evidence_consumers_write_compat_tests_two_arg() {
  local workspace=$1
  mkdir -p -- "${workspace}/e2e"
  cat > "${workspace}/e2e/stand-in-compat.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildE2eCommand } from './support/e2eStandIn.mjs';

test('e2e stand-in builds command with current factory contract', () => {
  const cmd = buildE2eCommand({ id: 1 }, 'v1.0.0');
  assert.equal(cmd.releaseTag, 'v1.0.0');
  assert.equal(cmd.kind, 'command');
});
EOF
}

delivery_evidence_consumers_write_unrelated_badge() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib" "${workspace}/tests"
  cat > "${workspace}/lib/statusBadge.mjs" << 'EOF'
// Unrelated boundary: status badge labeling.
export function badgeLabel(status) {
  return String(status ?? '');
}
EOF
  cat > "${workspace}/tests/status-badge.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { badgeLabel } from '../lib/statusBadge.mjs';

test('badge labels status', () => {
  assert.equal(badgeLabel('ready'), 'ready');
});
EOF
}

delivery_evidence_consumers_write_baseline_revision() {
  local workspace=$1
  delivery_evidence_consumers_write_factory_one_arg "${workspace}"
  delivery_evidence_consumers_write_stand_in_one_arg "${workspace}"
  delivery_evidence_consumers_write_producer_tests_one_arg "${workspace}"
  delivery_evidence_consumers_write_compat_tests_one_arg "${workspace}"
  delivery_evidence_consumers_write_unrelated_badge "${workspace}"
  mkdir -p -- "${workspace}/.planning"
  cat > "${workspace}/.planning/prior-consumer-assessment.md" << 'EOF'
# Prior consumer assessment

Assessed for an earlier slice: the E2E suite does not call CommandFactory; its
stand-in only assembles ObservedRevision-style records. Producer unit proof is
sufficient for factory changes. Reuse this exclusion unless the contract
boundary changes in a way that reaches E2E.
EOF
}
