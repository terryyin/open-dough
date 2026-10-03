---
id: SEED-093
status: active
planted: 2026-10-03
planted_during: Maintainer request to group project retrospective findings and queue the two highest priorities
trigger_when: A change proved locally fails CI for a reason the local proof could not show
scope: unknown
---

# SEED-093: Local checks agree with CI

## Why This Matters

Executing agents and maintainers publish Open Dough work on the strength of
this repository's local checks. The
[project findings](../../ProjectFindings.md#priority-assessment) show those
checks repeatedly disagreeing with CI: tests that race under CI's load, and
checks whose result depends on the directory they start in. Each failed CI run
pauses the slices in progress for a stash, diagnosis, repair, and publication
cycle, and each false local failure costs a diagnosis and a rerun.

## Stories

<a id="expose-timing-races-locally"></a>

### Expose timing races in this repository's tests before CI does

**Identity:** SEED-093#expose-timing-races-locally
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The agent or maintainer about to publish a change needs a test
that races to fail on their machine, not first on CI's runner or only when the
machine is busy.

**Goal:** A timing race in this repository's dashboard or Node tests shows up
in a deliberate local run before publication, and the one recorded failure
without a cause is explained and repaired.

**Findings:**
[tests whose verdict depends on timing or machine load](../../ProjectFindings.md#tests-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-186, DD-195, DD-199).

**Scope:** To be refined. Candidates from the findings:

- A slow-path way to run selected tests locally (for example CPU throttling
  or delayed routes) that reproduces the recorded races when their repairs
  are reverted. Plain load did not: 48 runs under 16 busy processes passed.
- Find and repair the cause of the `agent-launch-start-taken.spec.ts:53`
  failure ("server could not be reached").
- Start from the specs that failed CI on several unrelated branches without
  failing on trunk, 2026-09-29 to 2026-10-03: `agent-launch-attention.spec.ts`
  (five branches), `startup-host-words.spec.ts` and
  `agent-launch-ad-hoc-cursor.spec.ts` (four each), `read-failure.spec.ts` and
  `agent-launch-card-delete.spec.ts` (three each). Cross-branch failure
  suggests a race; each still needs its cause confirmed.
- Fault setups that wait for the event they depend on instead of a deadline
  (DD-199).

**Boundary:** This repository's tests and test support only. Published skill
guidance about proof selection stays with its DearDough findings.

<a id="checks-run-from-any-directory"></a>

### Run a check from any directory and get CI's result

**Identity:** SEED-093#checks-run-from-any-directory
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The agent running a focused check from a plan or a delegation
needs the same verdict CI gives, whichever directory the command starts in,
so a false failure does not cost a diagnosis and a rerun.

**Goal:** This repository's Node tests and dashboard Playwright suite find the
repository root from their own location, so a focused run from any directory
passes or fails as it does from the repository root and leaves no build
output outside the usual place.

**Findings:**
[checks whose result depends on where or how they are run](../../ProjectFindings.md#checks-whose-result-depends-on-where-or-how-they-are-run-second-priority-queued)
(DD-168, DD-178, DD-194).

**Scope:** To be refined. Candidates from the findings:

- Derive the root from the file's location in
  `ci-mailbox-complete-unresolved-cases.mjs`,
  `ci-mailbox-complete-exit-cases.mjs`,
  `dashboard/tests/support/dashboardServer.ts`, and
  `dashboard/tests/support/fixtureExecutable.ts`, and in any other test that
  reads `process.cwd()` for it.
- A check that fails when a test takes the repository root from the working
  directory.
- Deferred to refinement: whether DD-162 (a direct run that bypasses
  `scripts/test.sh`) and DD-216 (a passing run prints no count) belong here.

**Boundary:** This repository's tests and test support only.
