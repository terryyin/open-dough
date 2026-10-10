---
id: SEED-123
status: active
planted: 2026-10-08
planted_during: Terry's request to queue the local dashboard test flakiness seen in plans 257 and 276
trigger_when: Dashboard Playwright specs fail locally in unchanged code and pass alone or with fewer workers
scope: story
---

# SEED-123: The dashboard suite gives the same result under local load

## Why This Matters

Agents prove dashboard changes with local Playwright runs on a developer
machine that often runs other workloads. Specs that fail there in unchanged
code and pass on a rerun cost a rerun each time, leave the cause unexplained,
and teach agents to discount local failures. The repository expects one suite
result locally and in CI.

## Story

<a id="dashboard-suite-stable-under-load"></a>

### The dashboard Playwright suite gives the same result on a loaded developer machine as in CI

**Identity:** SEED-123#dashboard-suite-stable-under-load
**Slice plan:** [The dashboard suite gives the same result under local load](../slice-plans/282-dashboard-suite-stable-under-load/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/282-dashboard-suite-stable-under-load/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c50d6b28c4a97f23c06f5f44b017610292e6ec62b8e2b67eeb36169acc2450dc","plan":"ba1b3345a7599986b36d12a35003e91ee0dd0087ff27a5e06109ececb9015676"}}
```

**Beneficiary:** A developer or agent proving a dashboard change with local
Playwright runs on a machine that is also running other work.

**Goal:** `npm run test:dashboard` at Playwright's default local worker count
on a loaded developer machine gives the same pass or fail result as CI on the
same code, so a local failure always points at a real defect and is never
answered with a rerun. Business goal: agents trust local dashboard evidence
and spend no rerun time on failures that unchanged code did not cause.

**Scope:**

- **Each failed run's evidence survives a rerun.** A failing dashboard run
  keeps its console report and its retained files (traces, attachments) in a
  location a later run from the same checkout does not clear or replace, and
  its failure output names that location. Playwright empties
  `dashboard/test-results` at each run start and the quiet reporter prints
  only to the console, so today a rerun destroys the only record (DD-224).
  The kept location is ignored by Git, and CI's report upload stays as it is.
- **Concurrent runs from one checkout do not interfere.** Two runs started
  from the same checkout, one while the other is still running, each report
  their own complete result. Each run builds and serves its own production
  assets instead of the shared `dashboard/dist` (DD-226), so a shared-output
  collision stops being a candidate cause of a load failure.
- **Reproduce at default workers, then fix the shown causes.** By repeated
  runs at default workers, with and without a CPU load the reproduction
  itself produces and records, and with the shared-output collision ruled
  out, reproduce the recorded failure kinds: Vite not reporting its address within its start wait, the column
  "row rests" wait, the empty Backlog heading, and the Claude completion
  poll timeouts and "did not finish within the wait" starts (DD-240,
  DD-257). Fix what the reproduction shows to cause them in the suite's
  waits, shared outputs, or local worker selection. The fix for each wait
  ends on an observable event or the real failure signal, not a shorter or
  longer elapsed time alone.
- **Fix the product causes the reproduction showed** (authorized
  2026-10-10 after the probe). Recently done chooses which done records to
  read before the saved-session list answers, so a fresh first run reads
  records outside the shown ten and holds or fails the tests' first batch;
  Recently done waits for that list before choosing what to read. Runs leave
  `vite preview` and Cursor `runnerMain` processes alive after they end,
  adding load to later runs; a run ends every process it started.
  Recover on Cursor's idle composer reported its label from the screen that
  still showed the submitted paste chip ("waiting for an answer"); its wait
  settles only once a later screen no longer shows that chip, or the client
  exits, so the label it reports is the settled one (authorized
  2026-10-10).
- **Load bound.** Loaded means a one-minute load average held at or above the
  machine's core count for the whole run by CPU-bound processes the
  reproduction starts and stops. Default workers means Playwright's own
  local default, half the cores. Repetition at default workers is the
  reproduction, and induced load is the acceptance condition: the facts
  below show CPU load alone is not the trigger.
- **Facts the reproduction starts from** (observed 2026-10-08 and
  2026-10-09 on the 16-core machine, 8 workers, the progressive-loading
  group of about 20 specs, unchanged code):
  - The recorded 5 s failure reproduces without induced load: 2 failing
    runs in 21 (the plan's 1 in 8, this refinement's 1 in 13). Each was
    the first group run of its session in a freshly prepared checkout;
    every later run passed. Whether a first run is the trigger is a
    hypothesis with two samples, for the reproduction to test.
  - Under 16 CPU burners (load 19 to 37) the group passed 6 of 6 runs; with
    an empty Playwright transform cache it passed 4 of 4.
  - Eight preview servers started together report their address within
    0.5 s unloaded and 0.75 s under the burners, so CPU load does not reach
    the 20 s Vite bound; DD-257's silent Vite stays unexplained.
  - The 2026-10-09 failing run kept three failures, all `toHaveAccessibleName`
    at the 5 s plain `expect` bound: two entries still `aria-busy` while
    their records were read, and one entry already read when the test
    expected it still unread after a sibling's failed read. The third is an
    ordering expectation, not a wait that a longer bound satisfies.
  - DD-257's failures occurred at a load average of 7 to 8, below the bound
    above, and CI on `main` had the same failure kind three times in its
    last 40 runs (a 5 s `expect` while reads were under way), each repaired
    by waiting for the reads the test depended on (`3595ae66`, `22b60e30`,
    `64e4268c`). The suite's result is not yet load-independent in CI either;
    CI is the reference result, not proof of a load-free suite.
- **Done when** each failed run keeps its evidence across a rerun, two runs
  from one checkout pass together, the causes the reproduction showed are
  fixed (Recently done's read order, processes left running, Recover's
  label), and CI's dashboard shards pass on the delivered revision within
  their recorded deadline. The three consecutive full runs, loaded and fresh,
  moved on 2026-10-10 to
  [the follow-up story](#dashboard-suite-passes-loaded-acceptance), with the
  two failure kinds the first acceptance attempt showed.
- **Documentation.** The tests guide names where a failed run's evidence is
  kept and that the suite's result does not depend on local load.

Constraints the fix respects, each from an existing project rule:

- `retries: 0` stays; tests are never retried to turn them green
  ([native setup](../../tests/native-setup.md#repeated-checks)).
- Tests wait for an observable event, never for elapsed wall time
  ([tests guide](../../tests/README.md#waits-fixtures-and-teardown)).
- Each CI dashboard shard still ends within `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`
  ([ci.yml](../../.github/workflows/ci.yml)); a fix that slows or
  serialises the suite is not accepted at CI's expense.

Deferred, not rejected:

- A result under load that leaves the suite no CPU at all, far above the
  core count, is not proved here; the suite stays truthful (it fails naming
  the wait) rather than passing by retry.
- A product defect the reproduction uncovers in the dashboard server or app,
  other than the causes above, gets its own bug report.
- Making the local full run faster is not a promise; only its result is.

**Key examples:**

1. *A real failure under load is still a real failure.* The same loaded run
   with one assertion deliberately broken in one spec fails that test only,
   naming it, and no other test fails.
2. *Failure evidence outlives a rerun.* A run in which one test fails prints
   the failure and the path where its report and trace are kept. A second
   run from the same checkout then passes; the first run's kept report and
   trace are still there and unchanged, and the second run's kept nothing.
3. *Two runs from one checkout.* A second `npm run test:dashboard` starts
   while the first is mid-run. Both finish, each with its own result; neither
   fails from the other's build or from a rebuilt asset directory.
4. *Boundary: load far beyond the bound.* With the load average several times
   the core count, a run may fail. It fails naming the wait that ended, keeps
   its evidence as in example 2, and is not retried.

**Evidence:** [ProjectFindings.md](../../ProjectFindings.md) DD-224, DD-226,
DD-240, and DD-257; CI runs 37708938920, 37536394813, and 37534699715 on
`main` for the same failure kind in CI.

<a id="dashboard-suite-passes-loaded-acceptance"></a>

### The full dashboard suite passes three consecutive local runs, fresh and loaded

**Identity:** SEED-123#dashboard-suite-passes-loaded-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer or agent proving a dashboard change with local
Playwright runs on a machine that is also running other work.

**Goal:** Finish
[the first story's](#dashboard-suite-stable-under-load) promise: three
consecutive full `npm run test:dashboard` runs at default workers on
unchanged code pass with no output, one under induced load and one the
first run in a freshly prepared checkout, as CI does on that revision.

**Scope:**

- **A fresh run's first reads.** On 2026-10-10 (plan 282 slice 7, kept
  `dashboard/test-results/2026-10-10T05-13-58.875Z` in that workspace), the
  first `GET /__authenticated-read?source=open-dough` of three pages at the
  head of a fresh run took 4.9 s, and the plain 5 s `expect` right after
  `page.goto("/")` ended while the page still showed "Reading published
  work…" (`accessible-overview.spec.ts:38` and `:131`,
  `accessible-overview-keyboard.spec.ts:144` via `dashboardPage.ts:134`).
  Find where those seconds go, and make the first open wait for the read to
  answer or fail rather than for 5 s.
- **Plan slices stay "Reading" under load.** In the loaded run (load 58,
  partly other work), `reopened-project-reads.spec.ts:87` (`expectSettled`,
  line 69) still showed "Reading plan slices…" 5 s after every revision B
  read had answered (kept `2026-10-10T05-36-27.883Z`); 24 loaded repeats
  passed. Decide between a client ordering race and a browser starved of
  CPU, and fix a race.
- **Acceptance.** `scripts/dashboard-repeat.sh 1 --fresh`, `1`, and
  `1 --load` pass consecutively, and CI's shards pass on that revision.

**Key examples:**

1. *Loaded machine, unchanged code.* On a 16-core machine,
   `npm run test:dashboard` runs three times in a row at default workers
   (8), once while induced load holds the one-minute load average at or
   above 16, and once as the first run in a freshly prepared checkout.
   Every run exits 0 and prints nothing, exactly as CI on that revision.
2. *Vite start slower than its wait.* A page journey's preview server is
   slower than the suite's wait to report its address (DD-257 recorded
   20 s of silence; CPU load alone does not reproduce it). The test waits
   for the address or for Vite's exit, and passes once the address arrives;
   a Vite that exits, or stays silent past the wait, fails the test with
   Vite's output and keeps its evidence as in the first story's example 2.

<a id="recently-done-waits-for-added-project-sessions"></a>

### Correction: Recently done waits for an added project's sessions

**Identity:** SEED-123#recently-done-waits-for-added-project-sessions
**Slice plan:** [Recently done waits for an added project's sessions](../slice-plans/288-recently-done-waits-for-added-project-sessions/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/288-recently-done-waits-for-added-project-sessions/PLAN.md"}
```

**Source:** execution retrospective of
[the first story](#dashboard-suite-stable-under-load) (plan 282, commits
`210b335d`..`83d75f3e`, slice 4 `f01ea795`).

**Goal:** Recently done reads only the stories its first entries show, once
that project's saved sessions are known, for a project added while the page
is open as for the first project shown.

**Scope:** Slice 4 gates reading on the page's first sessions read ending
(`DashboardColumns.tsx`, `launches.attemptEvidence !== "unread"`); in
`agentLaunches.ts` that state never returns to unread, while a change of
projects asks a new sessions read (the server answers sessions only for
configured projects). A project added in the page therefore places and reads
its first ten without its sessions. Gate on a sessions read asked after the
current project list, keeping the existing fallback: a read that ends
unanswered still lets the shown stories be read. Also, from the same review:
the file-wide `cursorSubmitPaintMs: 1_000` in
`cursor-session-recovery.spec.ts` shortens to the smallest delay that still
arrives as a separate write (the fix waits on an event), and
`dashboardServer.ts` withdraws its at-exit runner stop on close for a
fixture's machine as it does for its own.

**Key examples:**

1. A page shows project A; project B, with saved sessions at its entries 2,
   7 and 11, is added. Until the sessions read asked after B was added ends,
   no done record of B is read; then only B's ten shown stories are.
2. That read fails: B's ten stories shown without sessions are read.
3. `cursor-session-recovery.spec.ts` still reproduces the chip race on the
   pre-slice-6 `launchInstruction.ts` with the shorter delay.

**Preserved:** slice 4's first-project behaviour and its two specs; no
change to when sessions are read.

## Breadcrumbs

- [Tests](../../tests/README.md) and [native setup](../../tests/native-setup.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
