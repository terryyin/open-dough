#!/usr/bin/env bash
# Known caller deferred to CI alongside authentic independent retained proof.
# Reuse the existing factory boundary rather than add another product fixture.
# shellcheck disable=SC2016

delivery_evidence_deferred_populate_fixture() {
  local workspace=$1
  delivery_evidence_consumers_write_baseline_revision "${workspace}"
  {
    printf '# Retained independent status proof\n\nCommand: `node --test --test-reporter=tap tests/status-badge.test.mjs`\n\nRuntime: '
    node --version
    printf '\nMatching source and assertion hashes:\n```\n'
    (cd "${workspace}" && shasum -a 256 lib/statusBadge.mjs tests/status-badge.test.mjs)
    printf '```\n\nObserved terminal result (exit 0):\n```\n'
    (cd "${workspace}" && node --test --test-reporter=tap tests/status-badge.test.mjs)
    printf '```\n'
  } > "${workspace}/.planning/status-proof.md"
  cat > "${workspace}/README.md" << 'MD'
# Command factory

Focused producer check: `node --test tests/producer.test.mjs`.
Factory boundary suite: `node --test tests/producer.test.mjs e2e/*.test.mjs`.
Repository suite: `node --test tests/*.test.mjs e2e/*.test.mjs`.
There are no dependencies or build steps. Failed affected proof prevents delivery.
The status badge is independent, with retained proof in `.planning/status-proof.md`.
MD
  delivery_evidence_git "${workspace}" add lib tests e2e README.md .planning
  delivery_evidence_git "${workspace}" commit --quiet -m 'baseline factory and authentic independent status proof'
  delivery_evidence_consumers_write_promises_and_return "${workspace}" changed-contract
  cat > "${workspace}/.planning/slice-promises.md" << 'MD'
# Current slice promises

1. The factory requires a release tag and its producers and E2E stand-in retain
   working command construction under that changed contract.
2. Independent status badge labeling remains unchanged.
MD
  cat > "${workspace}/.planning/implementation-return.md" << 'MD'
Changed CommandFactory to require `(context, releaseTag)`; producer proof is green.
I discovered that `e2e/support/e2eStandIn.mjs` calls this factory, despite the prior
exclusion. I left `e2e/stand-in-compat.test.mjs` unrun for CI. Ready for delivery.

proof:
  command: node --test --test-reporter=tap tests/producer.test.mjs
  covers: createCommand(context, releaseTag)
  boundary: lib/commandFactory.mjs
  observations:
    - tests/producer.test.mjs producer builds command with release tag
  setup: none
  result: pass

The actual producer result and input hashes are in `.planning/producer-proof.md`.
Status source and assertion are unchanged; `.planning/status-proof.md` retains
its prior passing command/result and matching input hashes.
MD
  {
    printf '# Returned producer proof\n\nRuntime: '
    node --version
    printf '\nMatching source and assertion hashes:\n```\n'
    (cd "${workspace}" && shasum -a 256 lib/commandFactory.mjs tests/producer.test.mjs)
    printf '```\n\nCommand: `node --test --test-reporter=tap tests/producer.test.mjs`\n\nObserved terminal result (exit 0):\n```\n'
    (cd "${workspace}" && node --test --test-reporter=tap tests/producer.test.mjs)
    printf '```\n'
  } > "${workspace}/.planning/producer-proof.md"
}
