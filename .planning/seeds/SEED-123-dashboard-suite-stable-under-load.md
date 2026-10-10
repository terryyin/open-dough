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
**Slice plan:** [The full dashboard suite passes three consecutive local runs, fresh and loaded](../slice-plans/289-dashboard-suite-passes-loaded-acceptance/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/289-dashboard-suite-passes-loaded-acceptance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"836d4a4cc9da29483b6a308bf71ad90da86c9f9e203cc50f904e5905b09d52ab","plan":"2836f64694a1b3421a66b8e3e3534c7c28ba0712efbd60a5e9df42bb9bba1d58"}}
```

**Beneficiary:** A developer or agent proving a dashboard change with local
Playwright runs on a machine that is also running other work.

**Goal:** `npm run test:dashboard` at Playwright's default local worker count
passes three consecutive full runs on unchanged code with no output, as CI
does on that revision: the first run in a freshly prepared checkout, a run in
the warm checkout, and a run under induced load. This finishes the acceptance
the completed first story moved here
(SEED-123#dashboard-suite-stable-under-load; recovery:
`1b365ce0:.planning/seeds/SEED-123-dashboard-suite-stable-under-load.md`),
whose attempt on 2026-10-10 (plan 282 slice 7, recovery:
`1b365ce0:.planning/slice-plans/282-dashboard-suite-stable-under-load/PLAN.md`)
passed the warm run and showed one failure kind in each of the other two.
Business goal: an agent trusts a local dashboard failure as a defect and
spends no rerun on one that unchanged code did not cause.

**Scope:**

- **A journey's first open waits for its read, not for 5 s.** In the fresh
  run, the first `GET /__authenticated-read?source=open-dough` of three pages
  at the head of the run took 4.9 s, and the plain 5 s `expect` on a card
  right after `page.goto("/")` ended while the page still showed "Reading
  published work…" (at `8511d0cb`: `accessible-overview.spec.ts:38` and
  `:131` and `accessible-overview-keyboard.spec.ts:144` through
  `dashboardPage.ts:134`;
  in current source the card wait after the open in
  `dashboard/tests/accessible-overview.spec.ts` and the first-card wait in
  `expectSettledPage`, `dashboard/tests/dashboardPage.ts`). Every journey's
  first card check after an open waits first for the page's published-work
  read to answer or fail, the event the page already notes for
  `untilPageReadsAnswered` (`dashboard/tests/pageRequestNotes.ts`), through
  one shared wait rather than a longer bound in each spec. The test timeout
  stays the only bound; a read that fails ends the wait, and the journey's own
  expectation then fails naming what it expected. This change does not depend
  on the finding below.
- **Where a fresh run's first seconds go.** Find what the first reads of a
  freshly prepared checkout wait on, from the repeat script's `--fresh` run
  and its kept trace and timings: candidates are the server's cold module
  loading, the synthetic `gh` (one Node process per call, 8 reads admitted
  per server, 8 workers starting together), and the server's own work on a
  project's first read. Record the finding in the plan. Fix a cause in the
  suite, and a cause in the dashboard server's handling of a project's first
  read when a real user's first open would wait as long; a product defect
  elsewhere gets its own bug report, as the first story ruled.
- **Plan slices settle under load.** In the loaded run (load 14 to 58, partly
  other work), `reopened-project-reads.spec.ts:87` (`expectSettled`, now line
  60) still showed "Reading plan slices…" 5 s after every revision B read had
  answered, while 24 loaded repeats of the spec passed. Decide between a
  client ordering race, where the slices read's result reaches the page and
  the card keeps the label (`dashboard/src/SliceProgress.tsx`), and a browser
  starved of CPU, where no render happened after the result: repeat the spec
  under the burners and read the kept trace for whether the result arrived
  and whether the page rendered after it. A race is a product defect and is
  fixed here. Starvation alone leaves the test waiting on the same event, the
  label leaving after the reads it depends on answer, and is recorded in the
  plan with the load that produced it; no bound is lengthened to cover it.
- **Acceptance.** On this 16-core machine at default workers (8), in this
  order and with no code change between them:
  `bash scripts/dashboard-repeat.sh 1 --fresh`,
  `bash scripts/dashboard-repeat.sh 1`, and
  `bash scripts/dashboard-repeat.sh 1 --load`. Each run exits 0 and its suite
  prints nothing, so the script reports the exit, seconds, and load averages
  and no `FAIL:` or `PRINTED:` line; the plan records those lines. A failing
  run is a defect: its kept directory is read, the cause fixed, and the
  series starts again from the fresh run. CI's dashboard shards then pass on
  the published revision within their recorded deadline.
- **Load condition.** Loaded means the script's burners, one CPU-bound process
  per core, hold the one-minute load average at or above 16 for the whole run;
  other work on the machine may raise it further and is recorded with the
  run. A failure whose kept evidence shows only a wait that ended while the
  load was several times the core count is the first story's deferred
  boundary, not a pass: record it with that load and repeat the loaded run
  when the load is nearer the bound.

Constraints the work respects, each from an existing project rule:

- `retries: 0` stays; no test is retried to turn it green
  ([native setup](../../tests/native-setup.md#repeated-checks)).
- Tests wait for an observable event, never for elapsed wall time
  ([tests guide](../../tests/README.md#waits-fixtures-and-teardown)); the
  waits above end on the read answering or failing, or the label leaving.
- A passing run prints nothing and a failing run keeps its evidence in its
  own `dashboard/test-results/<start time>/`
  (`dashboard/tests/support/quietReporter.ts`).
- Each CI dashboard shard still ends within `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`
  ([ci.yml](../../.github/workflows/ci.yml)); a fix that slows or serialises
  the suite is not accepted at CI's expense.

Preserved from the first story: a real failure under load still fails only
its own test, naming it (the deliberate break in `published-work.spec.ts:213`
at `8511d0cb` did so in the loaded attempt); a run ends every process it started; a Vite
preview that exits or stays silent past its 20 s wait fails the start with
Vite's output (`dashboard/tests/support/viteAddress.ts`).

Deferred, not rejected:

- DD-257's 20 s silent Vite start is pursued only if one of the three runs
  reaches that wait; CPU load alone did not reproduce it.
- A product defect outside the server's handling of a project's first read
  and outside a slices-label race gets its own bug report.
- A result under load far above the core count is not proved; the suite
  stays truthful there, as the load condition says.
- Making the full local run faster is not a promise; only the result is.
- The sibling correction in this seed,
  [Recently done waits for an added project's sessions](#recently-done-waits-for-added-project-sessions),
  stays its own item.

**Key examples:**

1. *A fresh run's first open.* A new worktree of the revision, after its own
   `npm ci` and with no earlier run, starts the suite at 8 workers; the first
   published-work read of the page `accessible-overview.spec.ts` opens takes
   longer than 5 s. The journey waits until that read answers, then finds
   the long card and continues; the run exits 0 and prints nothing.
2. *Boundary: the first read fails.* The same open, but the synthetic GitHub
   answers the published-work read with an error. The wait ends when the read
   fails; the journey's card expectation then fails at once, naming the card,
   and the kept trace shows the page's read failure notice. No 5 s passes
   first.
3. *Plan slices under load.* With the burners holding the load average at or
   above 16, the reopened-project journey reaches `expectSettled` after every
   revision B read answered. The Taken card shows "6 of 8 slices recorded
   complete" and no "Reading plan slices…" remains; the test passes, and so
   do its loaded repeats and the full loaded run.
4. *Three consecutive runs, unchanged code.* On the 16-core machine,
   `scripts/dashboard-repeat.sh 1 --fresh`, then `1`, then `1 --load` each
   report exit 0 with no `FAIL:` or `PRINTED:` line, and CI's shards pass on
   that revision. Boundary: the loaded run fails one test; its kept
   directory shows the cause, the fix lands, and the three runs start over
   from the fresh one.

**Evidence:** [ProjectFindings.md](../../ProjectFindings.md) DD-240, DD-257,
and DD-260; plan 282 slice 7's attempt record (recovery above).

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
