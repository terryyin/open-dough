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
- **Done when** three consecutive full runs at default workers on unchanged
  code pass with no output, one of them under that load and one of them the
  first run in a freshly prepared checkout (its own dependency install, no
  earlier suite run), and CI's dashboard shards pass on the same revision
  within their recorded deadline.
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

1. *Loaded machine, unchanged code.* On a 16-core machine,
   `npm run test:dashboard` runs three times in a row at default workers
   (8), once while induced load holds the one-minute load average at or
   above 16, and once as the first run in a freshly prepared checkout.
   Every run exits 0 and prints nothing, exactly as CI on that revision.
2. *A real failure under load is still a real failure.* The same loaded run
   with one assertion deliberately broken in one spec fails that test only,
   naming it, and no other test fails.
3. *Failure evidence outlives a rerun.* A run in which one test fails prints
   the failure and the path where its report and trace are kept. A second
   run from the same checkout then passes; the first run's kept report and
   trace are still there and unchanged, and the second run's kept nothing.
4. *Two runs from one checkout.* A second `npm run test:dashboard` starts
   while the first is mid-run. Both finish, each with its own result; neither
   fails from the other's build or from a rebuilt asset directory.
5. *Vite start slower than its wait.* A page journey's preview server is
   slower than the suite's wait to report its address (DD-257 recorded
   20 s of silence; CPU load alone does not reproduce it). The test waits
   for the address or for Vite's exit, and passes once the address arrives;
   a Vite that exits, or stays silent past the wait, fails the test with
   Vite's output and keeps its evidence as in example 3.
6. *Boundary: load far beyond the bound.* With the load average several times
   the core count, a run may fail. It fails naming the wait that ended, keeps
   its evidence as in example 3, and is not retried.

**Evidence:** [ProjectFindings.md](../../ProjectFindings.md) DD-224, DD-226,
DD-240, and DD-257; CI runs 37708938920, 37536394813, and 37534699715 on
`main` for the same failure kind in CI.

## Breadcrumbs

- [Tests](../../tests/README.md) and [native setup](../../tests/native-setup.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
