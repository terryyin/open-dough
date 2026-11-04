# Keep focused proof out of full-suite admission

**Identity:** SEED-231#keep-focused-proof-out-of-suite-admission

**Source:** [Selected story](../../seeds/SEED-231-keep-focused-proof-out-of-suite-admission.md#keep-focused-proof-out-of-suite-admission)
**Source review:** [source-review.md](./source-review.md)

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
Status: done
Proof: With another linked worktree holding admission, a pathless run whose
`OPEN_DOUGH_TEST_DIR` is outside the checkout starts and finishes without
waiting; an in-checkout pathless full run still waits; nested inheritance and
runner-fixture behavior stay green; `local-test-resources.md` matches.
Accepted proof:
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/local-test-suite.test.mjs tests/test-runner-failure-report.sh`
(pass; outside-pathless case in serialize independence loop; docs aligned).
Learnings: Fixture admission harness timeouts needed 60s `until` and 120s
controlled Playwright timeout so parallel focused proof with runner fixtures
stays stable when outside-checkout pathless runs no longer serialize on the
real checkout's admission.

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


## Story obligations

### X1. No admission storage redesign
Reported: slice 1 — "Scope limit excludes admission storage redesign"
Story clause: "this story does not redesign admission storage, change CI's no-admission rule, or change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers"
Disposition: excluded "this story does not redesign admission storage, change CI's no-admission rule, or change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers"
Commitment: X1
### X2. CI no-admission unchanged
Reported: slice 1 — "Scope limit excludes CI admission rule changes"
Story clause: "this story does not redesign admission storage, change CI's no-admission rule, or change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers"
Disposition: excluded "this story does not redesign admission storage, change CI's no-admission rule, or change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers"
Commitment: X2
### X3. Dashboard selection beyond unfiltered takers unchanged
Reported: slice 1 — "Scope limit keeps unfiltered dashboard as admission takers only"
Story clause: "this story does not redesign admission storage, change CI's no-admission rule, or change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers"
Disposition: excluded "this story does not redesign admission storage, change CI's no-admission rule, or change dashboard selection rules beyond keeping unfiltered dashboard runs as admission takers"
Commitment: X3
### X4. Do not exclude fixtures from focused proofs
Reported: slice 1 — "Challenge rejects excluding fixtures from focused proofs"
Story clause: "Excluding those checks from focused proofs would meet a narrow "focused proof never waits" reading while missing the purpose"
Disposition: excluded "Excluding those checks from focused proofs would meet a narrow "focused proof never waits" reading while missing the purpose"
Commitment: X4
### D1. Deferred per-directory locks
Reported: slice 1 — "Deferred broader admission redesign"
Story clause: "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Disposition: excluded "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Commitment: D1
### D2. Deferred share tokens
Reported: slice 1 — "Deferred broader admission redesign"
Story clause: "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Disposition: excluded "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Commitment: D2
### D3. Deferred per-fixture path rewrites
Reported: slice 1 — "Deferred broader admission redesign"
Story clause: "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Disposition: excluded "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Commitment: D3
### D4. Deferred other pathless callers
Reported: slice 1 — "Deferred broader admission redesign"
Story clause: "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Disposition: excluded "Deferred: broader admission redesign (per-directory locks, explicit share tokens as the only escape), rewriting every fixture solely to pass paths when a gate-level classification already delivers the promise, and admitting or excluding other pathless callers that are not runner fixtures over substitute directories"
Commitment: D4
## Execution complete

Product advice: no change
