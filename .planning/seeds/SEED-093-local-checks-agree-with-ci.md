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

### Keep the dashboard tests' recurring race shapes out by construction

**Identity:** SEED-093#expose-timing-races-locally
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/233-dashboard-test-race-shapes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1d01fe8c3da3f9b53409ff3efddb803e5c156c30dfa9f5ce74a6448153721416","plan":"e4650150ed9be59171dc6734cc19b04ccfd0ce7d88c8b30ad0874a0c705b880e"}}
```

**For / why:** The agent or maintainer publishing a change needs the dashboard
suite to give CI's verdict on the first run. Races keep arriving one CI failure
at a time, and each one pauses the slices in progress for a diagnosis and a
repair.

**Goal:** The dashboard browser tests stop producing the race shapes that
keep failing CI, because shared test support settles the page, drains its
reads, and orders fault setups for every spec. Individual specs no longer
repair these shapes one at a time.

**Findings:**
[tests whose verdict depends on timing or machine load](../../ProjectFindings.md#tests-whose-verdict-depends-on-timing-or-machine-load-first-priority-queued)
(DD-186, DD-195, DD-199).

**Field evidence (refinement, 2026-10-03):**

- Every race named by the findings and CI history is already repaired, and
  no named spec failed on a revision containing its repair (126 failed runs
  surveyed). The `read-failure.spec.ts` and `agent-launch-start-taken.spec.ts`
  CI failures came from their own branches, not races.
- Races still keep arriving. About 20 test-only race repairs landed between
  2026-09-28 and 2026-10-03. Most take three shapes:
  - Acting or measuring before the page settles: `6a8d3608`, `656de358`,
    `1af1db40`, `79ae5949`, `0d103b4a`, `076ed50a`, `dc402362`.
  - Disposing the context while intercepted reads are still in flight:
    `180b34aa`, `0e88f016`.
  - Injecting a fault before observing the event it depends on: `3fdae6f2`,
    `02cd7e86`.
- A generic slow-path run does not separate races from slowness:
  - Chromium CPU throttling ×4 at 16 workers failed the repaired
    `startup-host-words.spec.ts` in 16 of 20 runs on plain deadlines.
  - Random 0–1500 ms delays on local fetches neither raised nor lowered the
    reverted race's rate of about 1 in 60.

**Scope:**

- **Teardown drain:** the shared dashboard test fixture finishes the page's
  intercepted reads before the context is disposed, for every spec. The
  per-spec copies in `startup-host-words.spec.ts` (two, from a merge) and
  `project-remove.spec.ts` go.
- **Settled page:** the shared page helpers that open or reload the dashboard
  return only once the stages show their cards and the cards' preparation
  facts are read. Specs that hand-roll that wait use the shared one instead.
- **Fault after event:** a fault setup observes the event it depends on (for
  example accepted input) before injecting the fault. Sweep the dashboard
  specs for setups that use a deadline in place of that event, and convert
  them.
- **Repair method:** repairs wait for events. They do not lengthen deadlines,
  add sleeps, or add retries, because a retry or a longer wait hides the race
  instead of removing it (`retries: 0` stays).

**Key examples:**

- A spec intercepts a background read with `page.route` and has no teardown
  drain of its own. Its last assertion passes while the read is in flight →
  the test ends → the shared fixture finishes the read before disposal, and
  the run passes without "Response has been disposed".
- A spec reloads the stages and immediately measures a card's position or
  facts → the shared helper returned only after cards and preparation facts
  arrived → the measurement matches the settled page (no 507.8 versus 586.7
  shift, no "Reading preparation…").
- A recovery spec disconnects a native substitute after a short launch
  deadline → the converted setup first observes the substitute's accepted
  input, then disconnects → absent history can no longer pass as equal
  records.

**Deferred:**

- A local slow-path or jitter detector. The refinement probes above found
  neither one discriminating.
- A pre-publication repeat run of changed specs.
- The cause of the single local `agent-launch-start-taken.spec.ts:53` "server
  could not be reached" failure. It has not recurred in CI and is left to
  recur through DD-195.
- Node test races.

**Boundary:** This repository's dashboard tests and test support only.
Published skill guidance about proof selection stays with its DearDough
findings.

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
