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

<a id="read-kept-state-after-its-event"></a>

### Read a launch's kept record only after the event that settles it

**Identity:** SEED-093#read-kept-state-after-its-event
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The agent or maintainer publishing a change needs the
dashboard suite to give CI's verdict on the first run. The ad hoc Cursor start
spec failed CI run 37098217155 on a race of the "read before its event"
shape, and each such failure pauses slices for a diagnosis and a repair.

**Goal:** A dashboard spec that asserts a launch's kept record reads it after
the event that settles the asserted state, so its verdict no longer depends
on whether the page showed the session before the record was confirmed.

**Findings:**
[tests whose verdict depends on timing or machine load](../../ProjectFindings.md#tests-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-195, DD-199).

**Evidence:**

- `dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts` reads
  `keptRecord(dashboard.home)` once, right after the recent-session card
  appears, and later asserts that snapshot's first input is `confirmed`.
  - The server records `uncertain` before the Cursor client starts and
    writes `confirmed` only once the instruction is entered.
  - The spec's later wait for "First input accepted" checks the page, not
    the earlier snapshot.
- CI run 37098217155 failed on that assertion with `uncertain`. That the page
  can show the card before the confirmed write is inferred, not observed.

**Scope:**

- Read the kept record in that spec after the event that settles the
  asserted state, for example once "First input accepted" is shown.
- Sweep the dashboard specs for other single reads of kept launch state taken
  before the event their assertions depend on, and convert them the same way.
- Repairs wait for events. They do not lengthen deadlines, add sleeps, or add
  retries (`retries: 0` stays).

**Key example:** a Cursor ad hoc start with an instruction → the recent
session card appears while the record is still `uncertain` → the spec reads
the record only after "First input accepted" shows → it sees `confirmed`.

**Boundary:** This repository's dashboard tests and test support only.

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
