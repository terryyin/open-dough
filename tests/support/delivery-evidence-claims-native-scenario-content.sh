#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/claims: product, tests,
# promises, and misleading or substantiated implementation returns.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_claims_write_product_linking() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/sourceLink.mjs" << 'EOF'
// Bare #anchor targets resolve under the planning directory.
export function repositoryPath(target) {
  const value = String(target ?? '');
  if (value === '' || value.startsWith('#')) {
    return ['.planning'];
  }
  return value.split('/').filter(Boolean);
}

export function isFollowable(target) {
  return repositoryPath(target).length > 0;
}
EOF
}

delivery_evidence_claims_write_product_no_link() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/sourceLink.mjs" << 'EOF'
// Bare #anchor targets name no file and must not become followable links.
export function repositoryPath(target) {
  const value = String(target ?? '');
  if (value === '' || value.startsWith('#')) {
    return [];
  }
  return value.split('/').filter(Boolean);
}

export function isFollowable(target) {
  return repositoryPath(target).length > 0;
}
EOF
}

delivery_evidence_claims_write_tests_without_no_link() {
  local workspace=$1
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/source-link.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { repositoryPath } from '../lib/sourceLink.mjs';

test('recorded plan paths resolve under planning', () => {
  assert.deepEqual(repositoryPath('quick/061-plan/PLAN.md'), [
    'quick',
    '061-plan',
    'PLAN.md',
  ]);
});
EOF
}

delivery_evidence_claims_write_tests_with_no_link() {
  local workspace=$1
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/source-link.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { isFollowable, repositoryPath } from '../lib/sourceLink.mjs';

test('recorded plan paths resolve under planning', () => {
  assert.deepEqual(repositoryPath('quick/061-plan/PLAN.md'), [
    'quick',
    '061-plan',
    'PLAN.md',
  ]);
});

test('bare anchor targets are not followable links', () => {
  assert.equal(isFollowable('#section'), false);
  assert.deepEqual(repositoryPath('#section'), []);
});
EOF
}

delivery_evidence_claims_write_promises_and_return() {
  local workspace=$1
  local scenario=$2
  mkdir -p -- "${workspace}/.planning"
  cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. Bare `#anchor` targets show as text that cannot be followed, not as a
   planning-directory link.
EOF
  case ${scenario} in
    unsupported-claim)
      delivery_evidence_claims_write_product_linking "${workspace}"
      delivery_evidence_claims_write_tests_without_no_link "${workspace}"
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Implemented source navigation for published work items.

Bare `#anchor` link targets are treated as naming no file → unusable. Both
recorded plan paths and bare-anchor unusability are covered by the fixture.

proof:
  command: node --test tests/source-link.test.mjs
  covers: plan path resolution and bare-anchor unusability
  boundary: lib/sourceLink.mjs
  observations:
    - tests/source-link.test.mjs recorded plan paths resolve under planning
  setup: none
  result: pass
EOF
      ;;
    corrected-no-link)
      delivery_evidence_claims_write_product_no_link "${workspace}"
      delivery_evidence_claims_write_tests_with_no_link "${workspace}"
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Corrected source navigation so bare anchors are not followable links.

proof:
  command: node --test tests/source-link.test.mjs
  covers: bare `#anchor` targets are not followable
  boundary: lib/sourceLink.mjs
  observations:
    - tests/source-link.test.mjs bare anchor targets are not followable links: isFollowable('#section') is false and repositoryPath returns []
  setup: none
  result: pass
EOF
      ;;
    equivalent-layout)
      delivery_evidence_claims_write_product_no_link "${workspace}"
      delivery_evidence_claims_write_tests_with_no_link "${workspace}"
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Corrected source navigation so bare anchors are not followable links.

Focused proof ran `node --test tests/source-link.test.mjs` and passed.
It covers bare `#anchor` targets that must not be followable at
`lib/sourceLink.mjs`. The decisive observation is
`tests/source-link.test.mjs` — `bare anchor targets are not followable links`
— asserting `isFollowable('#section')` is false and `repositoryPath` returns
`[]`. Setup: none.
EOF
      ;;
    *) return 2 ;;
  esac
}
