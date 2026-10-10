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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/288-recently-done-waits-for-added-project-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fee26521d89bc32571e4bafc733df1f0cee7b9f0e2b58459f4d01c68b622958b","plan":"13c159df3d7f22309346dee34b1da24c71e685391b2ddd3bc35baf0966c38e7c"}}
```

**Source:** execution retrospective of
SEED-123#dashboard-suite-stable-under-load (recovery: `1b365ce0:.planning/seeds/SEED-123-dashboard-suite-stable-under-load.md`; plan
282, `1b365ce0:.planning/slice-plans/282-dashboard-suite-stable-under-load/PLAN.md`; commits
`210b335d`..`83d75f3e`, slice 4 `f01ea795`). The findings, with their code
locations, are in the plan.

**Goal:** A developer who adds a project while the dashboard is open, which
selects it, has Recently done read that project's done stories as it reads
the first project's: none until the project's saved sessions are known, then
only the stories among its first ten entries. Plan 282 slice 4 gated the
first open this way so the column's first ten settle once and the suite can
state exactly which done records a journey reads; an added project bypasses
that gate because the page's sessions are already "read" from the earlier
project list.

**Scope:**

- **Gate on the current project list's sessions.** Recently done reads a done
  story only once a sessions read asked after the latest change of the
  project list has ended, answered or not. The existing fallback stays: a
  read that ends unanswered lets the stories shown without sessions be read.
  The first open keeps its behaviour, since its first sessions read is the
  one asked after the first project list.
- **The Cursor recovery spec's paint delay.** `cursor-session-recovery.spec.ts`
  keeps the smallest `cursorSubmitPaintMs` that still reaches the fake Cursor
  as a separate write after Enter, instead of 1 s on every paste submission in
  the file; the fix it guards (`97e0e442`) waits for the chip to clear, not
  for time.
- **Runner stop withdrawal.** `dashboardServer.ts` withdraws its at-exit
  runner stop on every close, for a fixture's machine as for its own.
- **Deferred:** when sessions are read is unchanged. The unbounded Cursor
  keep wait after a submitted chip stays with
  SEED-129#bounded-cursor-launch-wait, and the loaded acceptance runs with
  SEED-123#dashboard-suite-passes-loaded-acceptance.

**Key examples:**

1. *An added project waits for its sessions.* The page shows project A with
   its sessions known. Project B, whose saved sessions sit at its done
   entries 2, 7 and 11, is added, and the page selects it. Until the sessions
   read asked after B's addition ends, no done record of B is read; once it
   answers, only the stories among B's first ten entries are read (eight,
   since entries 2 and 7 are sessions), and no more after the column settles.
2. *That sessions read fails.* As in example 1, but the read asked after B's
   addition fails: the ten stories B shows without sessions are read, as on a
   first open whose sessions cannot be read.
3. *The shorter delay still reproduces the chip race.* With the shorter
   delay, `cursor-session-recovery.spec.ts` fails on the chip label against
   the pre-`97e0e442` `launchInstruction.ts`, and passes five repeats on the
   current one.
4. *A server on a fixture's machine.* A test server created on a fixture's
   machine and closed leaves no runner stop to run at process exit.

**Preserved:** slice 4's first-project behaviour and its two specs in
`recently-done-progressive-after-sessions.spec.ts`;
`cursor-recover-submitted-chip.spec.ts` as the deterministic proof of the
chip fix.

## Breadcrumbs

- [Tests](../../tests/README.md) and [native setup](../../tests/native-setup.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
