---
id: SEED-231
status: active
planted: 2026-11-04
planted_during: Terry Yin's request to analyze why recent story executions took hours per slice
trigger_when: A focused local proof waits for another worktree's full suite
scope: story
---

# SEED-231: Keep focused proof out of full-suite admission

<a id="keep-focused-proof-out-of-suite-admission"></a>

### Keep focused proof out of full-suite admission

**Identity:** SEED-231#keep-focused-proof-out-of-suite-admission
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/466-keep-focused-proof-out-of-suite-admission/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3444e82c1d872364c001c6dc7bf203cf2b82851537f24123f5b73677592b5fc6","plan":"6510b546ac237977e59b2837f96508b27d1f2de28259871b73a0b3555a0f3477"}}
```

**Goal:** A developer or agent running a focused local proof with
`bash scripts/test.sh <paths>` gets its result without waiting for another
worktree's full suite, as
[local full-suite resource use](../../tests/local-test-resources.md) already
promises for named checks. Only a real full repository or dashboard run takes
the shared `refs/dough/local-test-suite` admission.

**Defect:** Checks that exercise the real runner, such as
`tests/test-runner-failure-report.sh`, call `scripts/test.sh` with no path
arguments and `OPEN_DOUGH_TEST_DIR` pointing at a temporary checks directory.
The runner treats that as a full run and asks for admission against the
repository's Git common directory (not the temporary directory). Run as part
of a focused proof with no admission-holding ancestor, the nested pathless
invocation waits for any other worktree's full suite. The same pattern appears
in `tests/test-runner-split.sh`, `test-runner-github-requests.sh`,
`test-runner-budget.sh`, `test-runner-ci-environment.sh`,
`test-runner-interrupt.sh` and related runner-fixture checks that invoke the
real runner pathlessly over a substitute directory. `test-runner-selection.sh`
sets `CI=true` and therefore already skips admission.

**Evidence:** In SEED-230#summarize-ci-proof-in-intent on 2026-11-04, slice 1's
five-file focused proof (`ci-proof-summary.test.mjs`,
`ci-proof-declaration.test.mjs`, `test-runner-failure-report.sh`,
`native-setup.sh`, `ci-container.sh`) started at 07:25 UTC and passed at
08:12 UTC. From 07:39 its nested `local-test-suite.mjs repository` process
was waiting behind `reduce-remote-sessions-traffic`'s full `npm test`.
On 2026-11-04 in this workspace, with another process holding
`refs/dough/local-test-suite`, a pathless
`OPEN_DOUGH_TEST_DIR=<temp>/checks bash scripts/test.sh` entered
`local-test-suite.mjs repository` against this worktree and was still waiting
after two seconds, while the same directory with the check path named finished
immediately with status 0.

**Scope:**

- Required: a focused proof that names a runner-fixture check finishes without
  waiting on, or contending for, another worktree's full-suite admission.
  Nested pathless runner invocations over a substitute checks directory used
  only to prove the runner stay independent of the shared admission.
- Required: `npm test`, `bash scripts/test.sh` with no paths against the
  repository's own tests, and unfiltered dashboard runs still take and release
  `refs/dough/local-test-suite` as today across linked worktrees.
- Required: a nested runner fixture inside a live full suite still reuses the
  ancestor's admission and does not release it early or let a sibling full run
  start.
- Required: a runner fixture check still proves the runner's behavior on its
  own temporary checks directory (selection, failure report, budget, interrupt,
  and the other existing fixture promises stay intact).
- Required restriction: two real full repository or unfiltered dashboard suites
  across this repository's linked worktrees must not run at once. That
  serialization is an independent product need from
  [local full-suite resource use](../../tests/local-test-resources.md); this
  story must not weaken it.
- Scope limit: this story does not redesign admission storage, change CI's
  no-admission rule, or change dashboard selection rules beyond keeping
  unfiltered dashboard runs as admission takers. Align
  [local-test-resources.md](../../tests/local-test-resources.md) with the
  corrected classification of substitute-directory runner fixtures when the
  current wording would still read them as full runs.
- Deferred: broader admission redesign (per-directory locks, explicit share
  tokens as the only escape), rewriting every fixture solely to pass paths
  when a gate-level classification already delivers the promise, and admitting
  or excluding other pathless callers that are not runner fixtures over
  substitute directories.

**Architecture:** The consequential seam is the full-run classifier in
`scripts/test.sh` (and any shared helper it uses) before
`scripts/local-test-suite.mjs repository` acquires admission against the
checkout's Git common directory. Pathlessness alone is not a reliable signal of
a real full repository suite when `OPEN_DOUGH_TEST_DIR` names a substitute
directory. No Accepted ADR defines local-suite admission; [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports keeping focused feedback cheap, and this change stays a local runner
classification fix rather than a new product-wide architecture decision. No
Accepted ADR conflicts with the promised behavior.

**Key examples:**

- With another worktree holding full-suite admission, a focused proof that
  names `tests/test-runner-failure-report.sh` (and likewise the other
  substitute-directory runner fixtures) starts and finishes without waiting.
- `npm test`, `bash scripts/test.sh` without paths against the repository's
  own tests, and unfiltered dashboard runs from this repository still take and
  release admission as before; a second full run in a linked worktree waits
  until release.
- A nested runner fixture inside a live full suite still reuses the ancestor's
  admission; a waiting sibling full run in another worktree stays blocked until
  the outer suite releases.
- A runner fixture check still proves the runner on its own temporary checks
  directory (passing and failing substitute checks behave as today).
- Pathless `OPEN_DOUGH_TEST_DIR=<temporary checks>` while another worktree
  holds admission does not wait (recovery of the focused-proof case). Pathless
  against the repository's own tests while admission is held still waits.
- Interrupting or killing a focused proof mid fixture leaves no new stuck
  shared admission for that nested substitute-directory run; stale-owner
  takeover for real full runs remains as today.

**Challenge:** The purpose holds: naming a runner-fixture check in a focused
proof must yield a result without cross-worktree full-suite wait. Excluding
those checks from focused proofs would meet a narrow "focused proof never
waits" reading while missing the purpose. Mechanism (gate classification versus
per-fixture path arguments) is an implementation choice for planning; the
examples fix the promised outcome.
