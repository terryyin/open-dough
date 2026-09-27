---
id: SEED-051
status: active
planted: 2026-09-27
planted_during: Maintainer review of project-owned retrospective findings
trigger_when: The test runner gains or changes a setting or environment it exports
scope: small
---

# SEED-051: Keep the test runner's settings where they belong

## Why This Matters

Maintainers and execution agents accept slices on a green local suite. When a
setting the runner uses for itself, or gives to checks, also reaches a check
that starts the runner or product code under test, a local pass can hide a
broken product guard, or CI's split jobs can fail where the local run passed.
Both leaks so far were repaired one setting at a time. This
addresses the general cause under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
stop-and-fix principle.

## Stories

<a id="isolate-runner-settings"></a>

### Keep the test runner's own settings from reaching the checks and product code it starts

**Identity:** SEED-051#isolate-runner-settings
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Open Dough maintainers and execution agents who rely on the
local suite and CI's split jobs to agree.

**Goal:** Every setting the runner exports has one stated reach: the runner
only, every check, or product code as well. A new setting cannot silently
reach further than its stated reach, so a local pass keeps proving product
guards and matches CI's split jobs.

**Scope candidate:** Classify the settings in `scripts/test.sh` and
`scripts/test-environment.bash` in one place, such as `OPEN_DOUGH_TEST_SPLIT`,
`OPEN_DOUGH_TEST_TIMES`, and the `GIT_CONFIG_*` Git state. Add a cheap local
check that fails on an unclassified runner setting, or on one that reaches a
nested runner or a product guard's test beyond its stated reach. Reuse the
existing split and agent-credit proofs rather than duplicating them. Exclude
changes to CI's jobs and to shipped product or installer behavior.

**Evaluation:** Reintroducing either recorded leak fails a local check that
names the setting: remove `ceae01c`'s split handling, or let the agent-credit
check inherit the runner's `user.useConfigOnly`. An added, unclassified
`OPEN_DOUGH_TEST_*` setting also fails. The existing suite still passes
locally and as each CI share (`OPEN_DOUGH_TEST_SPLIT=<i>/<n> npm test`).

**Findings:** [DD-114](../../ProjectFindings.md#dd-114--a-new-runner-setting-reached-checks-that-start-the-runner-only-cis-split-jobs-showed-it),
including its plan 120 occurrence.

**Completion:** Record the delivered response and its commit on DD-114 in
[ProjectFindings.md](../../ProjectFindings.md).
