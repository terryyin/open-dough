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

**Goal:** A developer or agent running a focused local proof with
`bash scripts/test.sh <paths>` gets its result without waiting for another
worktree's full suite, as
[local full-suite resource use](../../tests/local-test-resources.md) already
promises for named checks. Only a real full repository or dashboard run takes
the shared `refs/dough/local-test-suite` admission.

**Defect:** Checks that exercise the real runner, such as
`tests/test-runner-failure-report.sh`, call `scripts/test.sh` with no path
arguments and `OPEN_DOUGH_TEST_DIR` pointing at a temporary checks directory.
The runner treats that as a full run and asks for admission. Run as part of a
focused proof with no admission-holding ancestor, the check waits for any
other worktree's full suite. The same pattern appears in
`tests/test-runner-split.sh`, `test-runner-github-requests.sh`,
`test-runner-budget.sh`, `test-runner-ci-environment.sh`,
`test-runner-interrupt.sh` and `test-runner-selection.sh`.

**Evidence:** In SEED-230#summarize-ci-proof-in-intent on 2026-11-04, slice 1's
five-file focused proof (`ci-proof-summary.test.mjs`,
`ci-proof-declaration.test.mjs`, `test-runner-failure-report.sh`,
`native-setup.sh`, `ci-container.sh`) started at 07:25 UTC and passed at
08:12 UTC. From 07:39 its nested `local-test-suite.mjs repository` process
was waiting behind `reduce-remote-sessions-traffic`'s full `npm test`.

**Key examples:**

- With another worktree holding full-suite admission, a focused proof that
  names `tests/test-runner-failure-report.sh` starts and finishes at once,
  without waiting.
- `npm test`, `bash scripts/test.sh` without paths, and unfiltered dashboard
  runs from the repository's own `tests` still take and release admission as
  before, and a nested runner fixture inside them still reuses the ancestor's
  admission.
- A runner fixture check still proves the runner's behavior on its own
  temporary checks directory.
