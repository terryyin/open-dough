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

<a id="dashboard-suite-passes-loaded-acceptance"></a>

### The full dashboard suite passes three consecutive local runs, fresh and loaded

**Identity:** SEED-123#dashboard-suite-passes-loaded-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer or agent proving a dashboard change with local
Playwright runs on a machine that is also running other work.

**Goal:** Finish the first story's promise
(SEED-123#dashboard-suite-stable-under-load, completed; recovery:
`1b365ce0:.planning/seeds/SEED-123-dashboard-suite-stable-under-load.md`): three
consecutive full `npm run test:dashboard` runs at default workers on
unchanged code pass with no output, one under induced load and one the
first run in a freshly prepared checkout, as CI does on that revision.

**Scope:**

- **A fresh run's first reads.** On 2026-10-10 (plan 282 slice 7,
  `1b365ce0:.planning/slice-plans/282-dashboard-suite-stable-under-load/PLAN.md`; its kept run directories were in the retired workspace), the
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
  read had answered (slice 7 records it); 24 loaded repeats
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
   Vite's output and keeps its evidence as in example 2 of the completed first story.

<a id="recently-done-waits-for-added-project-sessions"></a>

### Correction: Recently done waits for an added project's sessions

**Identity:** SEED-123#recently-done-waits-for-added-project-sessions
**Slice plan:** [Recently done waits for an added project's sessions](../slice-plans/288-recently-done-waits-for-added-project-sessions/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/288-recently-done-waits-for-added-project-sessions/PLAN.md"}
```

**Source:** execution retrospective of
SEED-123#dashboard-suite-stable-under-load (recovery: `1b365ce0:.planning/seeds/SEED-123-dashboard-suite-stable-under-load.md`; plan
282, `1b365ce0:.planning/slice-plans/282-dashboard-suite-stable-under-load/PLAN.md`; commits
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
