#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/consumers: two-revision
# factory contract, stale unaffected-suite exclusion, producer proof, E2E
# stand-in, and an unrelated unchanged-boundary control. Does not name the
# missed consumer or pre-perform acceptance.
# shellcheck disable=SC2034,SC2154,SC2312

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

delivery_evidence_consumers_write_promises_and_return() {
  local workspace=$1
  local scenario=$2
  mkdir -p -- "${workspace}/.planning"
  case ${scenario} in
    changed-contract)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. `createCommand` requires `(context, releaseTag)` and producers build commands
   with a release tag.
EOF
      # Second revision: factory and producer updated; stand-in left incompatible.
      delivery_evidence_consumers_write_factory_two_arg "${workspace}"
      delivery_evidence_consumers_write_producer_tests_two_arg "${workspace}"
      # Intentionally leave one-arg stand-in and one-arg compat test.
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Changed CommandFactory to require `(context, releaseTag)`.

E2E suite is unaffected — previously assessed that the stand-in does not call
CommandFactory. Producer proof covers the factory signature change.

proof:
  command: node --test tests/producer.test.mjs
  covers: createCommand(context, releaseTag)
  boundary: lib/commandFactory.mjs
  observations:
    - tests/producer.test.mjs producer builds command with release tag
  setup: none
  result: pass
EOF
      ;;
    corrected-consumer)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. `createCommand` requires `(context, releaseTag)` and the E2E stand-in builds
   commands with the current factory contract.
EOF
      delivery_evidence_consumers_write_factory_two_arg "${workspace}"
      delivery_evidence_consumers_write_stand_in_two_arg "${workspace}"
      delivery_evidence_consumers_write_producer_tests_two_arg "${workspace}"
      delivery_evidence_consumers_write_compat_tests_two_arg "${workspace}"
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Aligned the E2E stand-in to `createCommand(context, releaseTag)` and obtained
compatibility proof.

proof:
  command: node --test tests/producer.test.mjs e2e/stand-in-compat.test.mjs
  covers: producer and E2E stand-in use the two-arg factory contract
  boundary: lib/commandFactory.mjs, e2e/support/e2eStandIn.mjs
  observations:
    - tests/producer.test.mjs producer builds command with release tag
    - e2e/stand-in-compat.test.mjs e2e stand-in builds command with current factory contract
  setup: none
  result: pass
EOF
      ;;
    unchanged-boundary)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. Status badge labels remain `badgeLabel(status)` text for the given status.
EOF
      # Factory/stand-in stay at the baseline one-arg contract (unchanged).
      # Unrelated badge boundary is already correct with its existing proof.
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
No change to status badge labeling. Existing proof still covers the promise.

proof:
  command: node --test tests/status-badge.test.mjs
  covers: badgeLabel returns the status text
  boundary: lib/statusBadge.mjs
  observations:
    - tests/status-badge.test.mjs badge labels status
  setup: none
  result: pass
EOF
      ;;
    *) return 2 ;;
  esac
}

# Committed baseline revision, then the uncommitted scenario overlay: the
# implementation return and any contract edits left for acceptance.
delivery_evidence_consumers_populate_fixture() {
  delivery_evidence_consumers_write_baseline_revision "$1"
  delivery_evidence_git "$1" add \
    lib e2e tests .planning/prior-consumer-assessment.md
  delivery_evidence_git "$1" \
    commit --quiet -m 'baseline one-arg factory with matching E2E stand-in'
  delivery_evidence_consumers_write_promises_and_return "$1" "$2"
}
