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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
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
- **Reproduce under induced load, then fix the shown causes.** Under a CPU
  load the reproduction itself produces and records, at default workers and
  with the shared-output collision ruled out, reproduce the recorded failure
  kinds: Vite not reporting its address within its start wait, the column
  "row rests" wait, the empty Backlog heading, and the Claude completion
  poll timeouts and "did not finish within the wait" starts (DD-240,
  DD-257). Fix what the reproduction shows to cause them in the suite's
  waits, shared outputs, or local worker selection. The fix for each wait
  ends on an observable event or the real failure signal, not a shorter or
  longer elapsed time alone.
- **Load bound.** Loaded means a one-minute load average held at or above the
  machine's core count for the whole run by CPU-bound processes the
  reproduction starts and stops. That is above the 7–8 on 16 cores at which
  DD-257 failed. Default workers means Playwright's own local default, half
  the cores.
- **Done when** three consecutive full runs at default workers under that
  load, on unchanged code, pass with no output, and CI's dashboard shards
  pass on the same revision within their recorded deadline.
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
- A product defect the reproduction uncovers in the dashboard server or app
  gets its own bug report; this story fixes the suite's own causes.
- Making the local full run faster is not a promise; only its result is.

**Key examples:**

1. *Loaded machine, unchanged code.* On a 16-core machine, induced load holds
   the one-minute load average at or above 16. `npm run test:dashboard` runs
   three times in a row at default workers (8). Every run exits 0 and prints
   nothing, exactly as CI on that revision.
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
5. *Vite start under load.* Under the induced load, a page journey's preview
   server takes longer than 20 seconds to report its address. The test waits
   for the address or for Vite's exit, and passes once the address arrives;
   a Vite that exits still fails the test with Vite's output.
6. *Boundary: load far beyond the bound.* With the load average several times
   the core count, a run may fail. It fails naming the wait that ended, keeps
   its evidence as in example 3, and is not retried.

**Evidence:** [ProjectFindings.md](../../ProjectFindings.md) DD-224, DD-226,
DD-240, and DD-257.

## Breadcrumbs

- [Tests](../../tests/README.md) and [native setup](../../tests/native-setup.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
