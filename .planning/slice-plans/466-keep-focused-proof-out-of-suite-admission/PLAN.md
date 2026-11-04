# Keep focused proof out of full-suite admission

**Identity:** SEED-231#keep-focused-proof-out-of-suite-admission

**Source:** [Selected story](../../seeds/SEED-231-keep-focused-proof-out-of-suite-admission.md#keep-focused-proof-out-of-suite-admission)

**Prepared:** 2026-11-04 in `cursor/keep-focused-proof-out-of-full-suite-admission` at
baseline `838069d47`.

## Outcome and direction

A focused `bash scripts/test.sh <paths>` proof that names a runner-fixture
check finishes without waiting on another worktree's full suite. Only a real
full repository or unfiltered dashboard run takes
`refs/dough/local-test-suite`. Nested pathless runs against a substitute
checks directory outside the checkout neither take nor release that admission;
pathless runs against an in-checkout suite directory still serialize or inherit
as today. Align
[local-test-resources.md](../../../tests/local-test-resources.md) with that
classification. Broader admission redesign and per-fixture path-only rewrites
are excluded (see the story).

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow
`tests/local-test-resources.md`: Bash 5 on PATH, and on AC power
`caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Existing solution and design

- **PFE.** Reuse the existing admission owner in
  `scripts/local-test-suite.mjs` and the re-entry gate in `scripts/test.sh`.
  Do not add a second lock, env opt-out, or per-fixture path rewrite as the
  primary fix. The defect is the gate treating every pathless local run as a
  full repository suite even when `OPEN_DOUGH_TEST_DIR` names a temporary
  substitute directory; admission is still acquired against the checkout that
  holds `scripts/test.sh`, so that nested fixture contends with other
  worktrees.
- **Common rule.** Before `local-test-suite.mjs repository`, a pathless local
  non-CI non-split run takes shared admission only when the resolved test
  directory (`OPEN_DOUGH_TEST_DIR`, default `tests`, resolved from the
  repository root after `cd`) lies inside this checkout. A temporary or other
  outside-checkout substitute directory skips the admission wrapper. Relative
  in-checkout directories such as the controlled fixture's `checks` still take
  admission, so existing serialization proofs keep their meaning.
  `DOUGH_LOCAL_SUITE_RUNNER_PID` re-entry, nested inheritance for in-checkout
  pathless children, CI, and `OPEN_DOUGH_TEST_SPLIT` stay as they are.
- **Docs.** State that runner fixtures over outside-checkout substitute
  directories remain independent, beside named checks and copied non-Git
  fixtures, without weakening the one-full-suite promise.

No Accepted ADR defines local-suite admission; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports cheap focused feedback. No ADR conflict.

## Decisive premises

| Premise | Consuming operation | Observation (2026-11-04) | Result |
| --- | --- | --- | --- |
| Pathless `OPEN_DOUGH_TEST_DIR=<temp>/checks` waits on live shared admission | Gate classification | With owner pid 78876 holding `refs/dough/local-test-suite`, pathless temp-dir `bash scripts/test.sh` entered `local-test-suite.mjs repository` against this worktree and was still waiting after 2s; same dir with the check path named finished status 0 | True: outside-checkout pathless runs take repository admission today |
| Controlled suite fixtures use an in-checkout `OPEN_DOUGH_TEST_DIR` | Preserve serialization proofs | Read `tests/support/local-test-suite-fixtures.mjs` `repository()`: default `OPEN_DOUGH_TEST_DIR: "checks"` under the fixture project root | True: in-checkout rule keeps fixture full runs as admission takers |
| Existing independent-run harness can express an outside-checkout pathless case | Slice 1 proof | Same `repository(t, …, env, args)` accepts env overrides of `OPEN_DOUGH_TEST_DIR`; absolute temp paths already used by runner-fixture checks | True: extend `local-test-suite.test.mjs` beside the focused/CI independence cases |

## Proof ownership

| Promise (story) | Slice | Proof |
| --- | --- | --- |
| Focused proof naming a runner-fixture check does not wait | 1 | Admission test: with one worktree holding admission, pathless outside-checkout `OPEN_DOUGH_TEST_DIR` enters and finishes without waiting; regression `bash scripts/test.sh tests/test-runner-failure-report.sh` (and peer fixtures in focused proof if touched) |
| Real full repository / unfiltered dashboard runs still serialize | 1 | Existing `local-test-suite.test.mjs` serialization cases stay green; in-checkout pathless still waits |
| Nested in-checkout pathless still inherits; substitute-dir nested neither takes nor releases | 1 | Existing nested inheritance case stays green; outside-checkout pathless under a held outer suite leaves the waiter blocked until the outer releases |
| Fixture still proves runner behavior on its temp directory | 1 | `tests/test-runner-failure-report.sh` (representative) still passes |
| Docs match the classification | 1 | `tests/local-test-resources.md` states outside-checkout substitute directories are independent |

## Slices

### 1. Outside-checkout pathless runner fixtures stay off shared admission
Type: Behavior
Status: planned
Proof: With another linked worktree holding admission, a pathless run whose
`OPEN_DOUGH_TEST_DIR` is outside the checkout starts and finishes without
waiting; an in-checkout pathless full run still waits; nested inheritance and
runner-fixture behavior stay green; `local-test-resources.md` matches.

Behavior: Given another worktree holds `refs/dough/local-test-suite`, when a
developer or focused proof runs pathless `scripts/test.sh` with
`OPEN_DOUGH_TEST_DIR` pointing at a temporary substitute checks directory (as
`tests/test-runner-failure-report.sh` does), the run does not wait on that
admission and the fixture still proves the runner; pathless runs against this
checkout's own suite directory and unfiltered dashboard runs continue to take
and release admission as today.

## Concern evidence

Slice-plan refinement was not needed: one Behavior slice owns one proof loop
and one common classification rule; no independent second outcome, hidden
preparation, or cumulative special-case design remains.

Remaining slice-specific concerns: none identified.
