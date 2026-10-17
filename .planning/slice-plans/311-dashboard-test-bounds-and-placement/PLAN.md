# Bound each dashboard test after its event and place page-less specs at the boundary

**Identity:** SEED-136#dashboard-test-bounds-and-placement
**Source:** [bounded correction](../../seeds/SEED-136-dashboard-test-efficiency.md#dashboard-test-bounds-and-placement)
from the execution retrospective of SEED-136#unify-and-streamline-dashboard-e2e
([plan 310](../310-unify-dashboard-e2e-strategy/PLAN.md), commits
789b7ca9..0bee7fd8, slices 3 and 4 and the Learnings).

## Goal and scope

No dashboard test's bound precedes the event it depends on, and every spec
that opens no page lives in `dashboard/tests/boundary/`, as
`dashboard/tests/README.md` "Two tiers" (line 38) and "Synchronization"
(lines 91–96) state. Three findings, the first two older than the campaign
and surfaced by its loaded whole runs, the third a residue of its slice 4:

1. `dashboard/tests/boundary/project-add-boundary.spec.ts:71–98`: the
   deadline case starts its server with a 500 ms read deadline (line 75) and
   then polls for `server.ghPid() > 0` (line 91). The product's bound runs
   from the request's arrival over the whole handler
   (`dashboard/server/localJsonEndpoints.ts:46–56` through
   `dashboard/server/responseSignal.ts:13`), and the fake `gh` writes its
   pid file only once it runs (`dashboard/tests/fixtures/fake-gh:28–29`,
   read by `dashboard/tests/support/dashboardServer.ts:229–231`), so under
   load the 503 is answered before `gh` is spawned and the test's
   precondition is never observed; its poll fails at 5 s (plan 310, slice 3:
   one run in two alone at load 28).
2. Three git-heavy specs declare no `test.setTimeout` and run under
   Playwright's default 30 s (`dashboard/playwright.config.ts` sets no
   `timeout`): `dashboard/tests/agent-launch-preparation-codex-retry.spec.ts`
   (10 tests, 81.0 s summed and up to 9.4 s per test in the slice 9
   eight-worker record, the largest file by summed time),
   `dashboard/tests/boundary/agent-launch-preparation-resume.spec.ts` (5
   tests, 22.3 s) and `dashboard/tests/boundary/agent-launch-start-resume.spec.ts`
   (5 tests, 30.0 s); the latter two's long tests took 17–24 s alone at load
   40–57 (plan 310, Learnings). `dashboard/tests/writing-journeys.md:78–80`
   prescribes a declared bound for a test that builds the full-source
   fixture; 156 spec files declare one (120 s in 153 tests). The sibling
   `agent-launch-preparation-cursor.spec.ts` declares one; these three do
   not.
3. `dashboard/tests/serving-modes.spec.ts` (added in slice 4, commit
   740e141b: two real Vite servers over HTTP and WebSocket, imports
   `support/pageTest.ts`, opens no page) and
   `dashboard/tests/production-watcher-refusals.spec.ts` (older: builds the
   full-source fixture and runs the watcher command, no server, no page)
   live in the journey directory; the README cites `serving-modes.spec.ts`
   at the top-level path (line 52), and five specs cite it in comments. A
   code-level scan of the top-level specs (comments and string literals
   stripped, then `page`, `newPage`, `browser`) names exactly these two.

Included: the deadline case's order of observation; declared bounds in the
three files and the guide sentence that states the rule generally; the two
moves with imports, citing comments and README references, and the README
qualification that `boundary/serving-modes.spec.ts` alone starts Vite
servers on the run's build.

Preserved: every assertion and title; `retries: 0`; worker and shard counts;
the run's process sweep.

Excluded: `prebuilt: builtDashboardDir` consolidation and build placement
(SEED-136#restore-ci-under-three-minutes); the tablet iterations of
`launchTouchViewports`; file-size splits of the production files;
`longest-first`.

Assumptions: the repeat script's `--load` (one `yes` burner per online core,
`scripts/dashboard-repeat.sh:109–116`) reproduces the load the failures
needed; a bound is declared, never a retry or a longer `expect` bound.

## Design and existing solutions

- **The deadline case cannot move the product's clock** (fact). The bound
  starts when the request reaches the middleware, before body parsing,
  validation and the `gh` spawn, so the test observes the spawn first only
  if the deadline exceeds the spawn-to-pid-file latency under load. The
  product's default is 30 s (`dashboard/src/authenticatedReadRules.ts:58`),
  far too long for the test. Chosen direction: a deadline of a few seconds,
  measured with the repeat script under burners, documented in the test
  beside the number; the test's own time grows by about that much (it took
  up to 1.1 s quiet) for one test. The `expect.poll` calls stay the
  synchronization; no sleep. The disconnect case (30 s deadline, line 75)
  and the unfinished-body case (100 ms, line 125, which asserts that `gh`
  was never called) are already in order.
- **Declared bounds follow the suite's own convention** (reuse). 156 files
  declare `test.setTimeout`; 60–180 s are the values in use. Each of the
  three files declares one bound at file level or per test as its siblings
  do (`agent-launch-preparation-cursor.spec.ts`), sized from the record
  (9.4 s quiet, 24 s at load 50) with the same headroom the fixture-building
  tests have. The guide sentence at `writing-journeys.md:78–80` becomes the
  general rule: a test whose own work (a fixture build, several real git
  starts) can approach the default bound declares one.
- **Placement** (apply the README's rule). `boundary/` holds every spec
  that opens no page, "whatever it drives" (line 38). `serving-modes` is the
  one spec in that tier that needs the run's build, which "Adding a test"
  (line 148, "needs no build") must say; `production-watcher-refusals` fits
  the rule as written (the commands the server installs). Discovery and
  sharding follow the file (`support/testFiles.mjs`, recursive), protected
  by `tests/support/dashboard-test-files.test.mjs`; `longest-first` lists
  neither file. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  applies (fast feedback, one representation); no conflict, no new decision.

## Preparation observations and decisive premises

Observed 2026-10-18 in the execution checkout at `0bee7fd8` (read-only; the
slice 9 record `final9/full8.json` under the job's temporary directory).

| Premise | Observation | Consequence |
| --- | --- | --- |
| The deadline bounds the handler from arrival, not from the spawn | `localJsonEndpoints.ts:46–56` wraps `answer(...)` in `withResponseSignal(res, ..., readTimeoutMs())`; `responseSignal.ts:13` arms the timer at call. | Slice 1 raises the test's deadline; it cannot re-anchor it. |
| The three files declare no bound | `grep test.setTimeout` over the three files: none; their only timeouts are `expect.poll` 20 s options. | Slice 1 adds the declaration; no helper change. |
| Exactly two top-level specs open no page | Code-level scan over `dashboard/tests/*.spec.ts`: `production-watcher-refusals.spec.ts`, `serving-modes.spec.ts`. | Slice 2 moves both; the proof repeats the scan. |
| Nothing but comments and the README reference the two files | `grep -rn` over `*.ts`, `*.md`, `*.mjs`, `longest-first`: README line 52 and comments in `authenticated-project-overview`, `project-configuration`, `system-settings-terminal-theme`, `boundary/agent-terminal-boundary`, `boundary/authenticated-read-boundary`; `longest-first` names neither. | Slice 2 touches more than the two files and README, so the move is its own slice. |
| The repeat script takes the specs after its flags and burns every core under `--load` | `scripts/dashboard-repeat.sh:33–45, 109–116, 156`. | The proof command below is well-formed. |

## Outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Deadline observed in order (key example 1) | 1: `boundary/project-add-boundary.spec.ts` passes 3 of 3 under `--load`; a scratch product regression that answers the deadline without ending `gh` fails the test on `ghExitedBy()`, not on the pid poll. |
| Bound declared for real work (key example 2) | 1: the three files pass 3 of 3 under `--load` with their declared bounds; a scratch regression in one behavior each proves fails that test with its own assertion. |
| The guide states the rule | 1: `writing-journeys.md` "Commands, servers and shared preconditions" names the general case. |
| Placement (key example 3) | 2: both files run from `boundary/`; the scan of top-level specs finds none; `npm test -- tests/support/dashboard-test-files.test.mjs` green; README references point at the new paths and qualify the build. |
| Preserved: assertions, titles, `retries: 0`, workers, shards, sweep | Both slices: the diff adds bounds and moves files only; the config is untouched; a whole run at four workers passes with nothing of the run surviving. |

## Ordered slices

### 1. Bounds follow their events
Type: Behavior
Status: planned
Proof: `bash scripts/dashboard-repeat.sh 3 --load boundary/project-add-boundary.spec.ts agent-launch-preparation-codex-retry.spec.ts boundary/agent-launch-preparation-resume.spec.ts boundary/agent-launch-start-resume.spec.ts`
exits 0 (three runs, every test passed, load average reported); the
deadline case's chosen deadline and its reason are stated in the test; a
scratch regression per changed test fails it for its own reason (the
deadline test on `ghExitedBy()` or the 503 when the product no longer ends
`gh` at the deadline; one test of each git-heavy file on its assertion when
the behavior it proves is broken, with no timeout in the failure); the
`writing-journeys.md` sentence states the general rule; `npm run
typecheck:dashboard` green; a whole run at four workers passes with nothing
of the run surviving.

Behavior: pre: on a loaded machine the deadline test's precondition is
never observed and the git-heavy tests hit the default 30 s → trigger: the
deadline is long enough for the spawn to be observed first, and each
git-heavy file declares the bound its work needs → result: the same
assertions pass under load, and a failure in these files names a defect.

### 2. Page-less specs live in `boundary/`
Type: Behavior
Status: planned
Proof: `git mv` of `serving-modes.spec.ts` and
`production-watcher-refusals.spec.ts` into `dashboard/tests/boundary/` with
imports resolved; the five citing comments and the README (line 52 and
"Adding a test") name the new paths, the README stating that
`boundary/serving-modes.spec.ts` is the one boundary spec that starts the
Vite servers on the run's build; `npm run --silent test:dashboard --
boundary/serving-modes.spec.ts boundary/production-watcher-refusals.spec.ts`
passes 6 tests; `npm test -- tests/support/dashboard-test-files.test.mjs`
green; the code-level scan of `dashboard/tests/*.spec.ts` finds no spec
without a page; typecheck green; a whole run at four workers passes with
nothing of the run surviving.

Behavior: pre: two specs that open no page sit among the journeys →
trigger: relocation → result: the README's placement rule holds for every
file, and discovery selects each once.

## Current decisions

- The deadline case keeps its event-driven polls and takes a longer
  deadline chosen by measurement under `--load`; a sleep, a longer `expect`
  bound or a retry is not a correction.
- Bounds are declared per file in the suite's existing form
  (`test.setTimeout` or `test.describe.configure({ timeout })`), sized from
  the record with the headroom the fixture-building tests use; no retry, no
  change to `retries: 0`, workers or shards.
- Both page-less specs move; the README's "needs no build" sentence is
  qualified for `serving-modes` rather than keeping the file at the top
  level. `prebuilt: builtDashboardDir` stays as it is (next story).
- The whole-run proof uses `--workers 4` while the machine is shared, as
  plan 310 did; the configuration is unchanged.

## Learnings

None yet.
