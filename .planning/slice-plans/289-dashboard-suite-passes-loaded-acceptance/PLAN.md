# The full dashboard suite passes three consecutive local runs, fresh and loaded

**Identity:** SEED-123#dashboard-suite-passes-loaded-acceptance
**Source:** [refined story](../../seeds/SEED-123-dashboard-suite-stable-under-load.md#dashboard-suite-passes-loaded-acceptance).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/the-full-dashboard-suite-passes-three-consecutiv`
on `claude/the-full-dashboard-suite-passes-three-consecutiv`, under the
preparation assignment for `jackson-chan` (announced at `faf39e40`, continued
for this plan). Publication target: `origin/main`; integration checkout:
`/Users/terryyin/git/open-dough`.

## Goal and boundaries

`npm run test:dashboard` at Playwright's default local worker count passes
three consecutive full runs on unchanged code with no output, as CI does on
that revision: the first run in a freshly prepared checkout, a run in the warm
checkout, and a run under induced load. The first story (plan 282, recovery
`1b365ce0:.planning/slice-plans/282-dashboard-suite-stable-under-load/PLAN.md`)
delivered kept evidence, isolated builds, the repeat script, process cleanup,
and three product fixes; its acceptance attempt on 2026-10-10 at `8511d0cb`
passed the warm run and failed the fresh run on three first-open waits and the
loaded run on one plan-slices label wait.

In scope, from the story: every journey's first card check after an open
waits for the page's published-work read to answer or fail, through one
shared wait; where a fresh run's first seconds go is found and recorded, and
a cause in the suite or in the server's handling of a project's first read is
removed; the plan-slices label under load is decided between a client race
(fixed) and starvation (recorded); the three runs through
`scripts/dashboard-repeat.sh` pass in order with no suite output, and CI's
nine dashboard shards pass on the published revision.

Material exclusions, from the story: DD-257's silent 20 s Vite start unless a
run reaches it; a product defect outside the server's first-read path and a
slices-label race, which gets a bug report; load far above the core count;
a faster full run. Constraints: `retries: 0`; waits end on an observable
event, never on elapsed time; a passing run prints nothing; each CI shard
ends within `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`.

## Published baseline and integration context

Origin was fetched at `6d19d738` by the assignment's `start`. The highest plan
directory allocated on that history and in every local worktree is `288`
(two plans share it); `289-dashboard-suite-passes-loaded-acceptance` was free
immediately before this write. This workspace is at `faf39e40` plus the
refined seed; trunk's four later commits touch no file under `dashboard/`,
`scripts/`, or `tests/`. This workspace has no `node_modules`; the repeat
script's `--fresh` run needs none here (it installs in its own worktree), and
focused checks install with `npm ci` first (plan 282 measured under a second
from the warm cache).

No North Star topic governs the suite's waits. "One owner admits reads to
GitHub" (`.planning/NORTH-STAR.md`) governs the server's read admission, which
slice 3 may find on the first read's path: a fix there keeps admission the one
owner and changes no rule of it. ADR 0008 keeps page state derived from
reads, which slices 2 and 5 respect. No Accepted ADR conflicts; this plan
adds no topic.

## Existing solutions and selected approach

| Need | Finding |
| --- | --- |
| A journey's first wait ends on the read, not on 5 s | **Change** `dashboard/tests/pageRequestNotes.ts` and `dashboard/tests/dashboardPage.ts`. Every page notes its requests from before its scripts run (`dashboardTest.ts:135`, `noteRequestsInEveryPage`), and `untilPageReadsAnswered` already waits on `readsUnanswered`, but that set holds promises without their URLs, so it cannot wait for the published-work read alone, and journeys that hold a detail read would never return from it. The note gains the read's kind, and a new wait ends when no published-work read (a `/__authenticated-read` request with `source` and at most `revision`, no `path`, `done`, `agents`, `branch`, or `since`) is unanswered. `expectMembership` (83 files) and `expectSettledPage` (40 files) call it first; the 21 journeys whose first expectation after `page.goto("/")` is a plain card or text `expect` go through those helpers or call the wait. No per-spec bound changes. |
| Settled checks observe render after the event | **Change** `expectSettledPage`: today it checks "Reading preparation…" is gone (5 s bound) before `untilPageReadsAnswered`; reversed, the label check is a render check after the reads it depends on answered. `reopened-project-reads.spec.ts`'s own `expectSettled` (which never waits on the reads) uses the same order through the shared helper or the wait. |
| Where a fresh run's first seconds go | **Gap.** The server records elapsed time only for failed `gh` calls (`server/readDiagnostics.ts`); the kept trace shows the page request's 4.9 s and nothing of the server's share. Slice 3 adds a `Server-Timing` header to `/__authenticated-read` answers naming the admission wait, the `gh` spawn-to-answer time, and the rest, so the kept trace of any failing run carries the breakdown with no console output. The fake GitHub records every `gh` call's arrival, and the repeat script's `--fresh` run is the reproduction. |
| Plan slices under load | **Observe first.** `publishedWorkDetails.ts` sets the label through `awaitingProgressSources`, resolves it in `withProgressSources`, and shows through `answered()`, which prefers the resolved `progress`; reading found no path that rewrites a counted entry back to loading, so a race is not shown by reading. Slice 2's event-first check makes a persisting label a product fact: after the branch head and plan reads answered, the label leaving is a render. Slice 5 then fixes a race only if the loaded repeats reproduce it. |
| Three runs and CI | **Reuse** `scripts/dashboard-repeat.sh` (`--fresh`, `--load`, spec and Playwright flags pass through) and the quiet reporter's `FAIL:`/`PRINTED:`/`Kept:` lines; CI's nine shards (`ci.yml`, 6-minute jobs). |

## Current decisions

- The shared wait is in the suite's page helpers, not a longer `expect`
  bound and not a product change; it ends on answer or failure, and the
  journey's own expectation then decides. The test timeout (30 s) remains
  the only bound.
- Label checks come after the page's reads: a label still shown after every
  read it depends on answered is a rendering fact to investigate, never a
  reason to lengthen the bound.
- Timing evidence travels in the kept trace (`Server-Timing`), not on stdout,
  so a passing run still prints nothing.
- A product cause is fixed here only in the server's handling of a project's
  first read or a slices-label race; anything else is a bug report named in
  this plan's learnings.
- Loaded runs record the script's load lines; a failure at a load several
  times the core count is recorded and the loaded run repeated nearer the
  bound, as the story's load condition says. The fresh run of 2026-10-10
  (load to 57, five-minute 97 from other work) is such a record: its 36
  test timeouts and the nested-run bounds of `run-processes.spec.ts` are
  not pursued unless a run inside the bound shows them.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The failing fresh-run waits were plain 5 s bounds right after an open | Slice 1's shape | At `8511d0cb`, Playwright named the tests by declaration line: `accessible-overview.spec.ts:38` and `:131` are the two tests whose first expectation after `page.goto("/")` is `expect(longCard).toBeVisible()` or the narrow-window first expect; `accessible-overview-keyboard.spec.ts:144` opens through `openAtA` → `expectMembership` (`dashboardPage.ts:134`, `toHaveText` with the default 5 s). `playwright.config.ts` sets no `expect.timeout`. | Confirmed. |
| Every page notes its reads before its scripts run, so a wait can observe the opening read | Slice 1's wait | `dashboardTest.ts:133-135`: the `context` fixture calls `noteRequestsInEveryPage`, an init script; `pageRequestNotes.ts` keeps `readsUnanswered` for `/__authenticated-read` requests without `since`. | Confirmed; the set keeps no URL, so the kind is added (slice 1). |
| A held first answer reproduces the symptom deterministically | Slice 1's red proof | `fakeGitHub.ts:33`: a `RepositoryAnswerer` may wait before answering, so a spec can hold the first `ref` answer about 6 s (over the 5 s bound, under the 30 s test timeout) and release it. | Mechanism confirmed by reading; the red run is slice 1's first step. |
| The loaded failure's check never waited on the reads it depended on | Slice 2's shape | `reopened-project-reads.spec.ts:60-78` `expectSettled`: membership, source, card text, then `toHaveCount(0)` on three labels, no `untilPageReadsAnswered`; `expectSettledPage` (`dashboardPage.ts:155-172`) checks the preparation label before the reads. | Confirmed. |
| A counted entry is not rewritten to loading after its plan answered | Slice 5's premise | `publishedWorkDetails.ts:46-61,131-170`: `answered()` uses `progress` once set; `withSliceClocks` derives from the resolved progress; `movedBranchProgress.ts:40` reads only moved branches. | No overwrite found by reading; not settled. Slice 2's event-first check and loaded repeats decide; slice 5 is conditional on them. |
| The repeat script passes specs and Playwright flags through | Slices 2 and 6 | `scripts/dashboard-repeat.sh`: every argument other than `--load`/`--fresh` is appended to `npm run --silent test:dashboard --`. | Confirmed. |
| A fresh run reproduces the slow first read | Slice 3's shape | `/opt/homebrew/bin/bash scripts/dashboard-repeat.sh 1 --fresh` on 2026-10-10 from this workspace, 8 workers, other work on the machine: load 11.7 at start, 57 at the end (five-minute average 97), 1370 s, kept at `dashboard/test-results/2026-10-10T08-22-41.986Z` here (git-ignored). | Not reproduced at the head: none of `8511d0cb`'s three journeys failed. The run failed 42 tests, 36 of them 30 s test timeouts and the rest plain expects, all from `frame-launch-look` onward in the alphabetical order, as other work took the load far past the bound: the story's deferred boundary, not an observation of this premise. Two fresh runs so far: one reproduced it, one did not; slice 3 remains the probe. One new fact: `frame-launch-look.spec.ts:101` failed "not read whole" because `expectNoSidewaysScrollAndWholeText` (`pageLayout.ts:127`) listed "SPAN: Reading published work…", a whole-page layout check made while the published-work read was under way, the same kind as slice 1's. |
| CI's bound | Slice 6 | `.github/workflows/ci.yml`: nine shards, `timeout-minutes: 6`, deadline through `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`. | Confirmed. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| A fresh run's first open waits for its read (1) | 1 | A spec holding the first `ref` answer 6 s fails on the current helpers at the 5 s bound and passes with the wait; the status consumers (`published-work`, `steady-refresh`, `transient-read-recovery`, `accessible-overview*`) and the held-read journeys (`published-facts-*`, `recently-done-progressive-*`) pass. |
| Boundary: the first read fails (2) | 1 | The same spec with the `ref` answer failing: the wait ends at the failure and the membership expectation fails at once, naming the titles, inside 5 s. |
| Plan slices under load (3) | 2, 5 | `reopened-project-reads.spec.ts --repeat-each 20` under `--load` passes with the event-first check; a label persisting after its reads answered is slice 5's reproduction. |
| Where the first seconds go (scope) | 3 | The `Server-Timing` breakdown of the head-of-run reads in a fresh run, recorded in Learnings. |
| An owned cause is removed (scope) | 4 | The same breakdown after the fix, in a fresh run, relative to slice 3's under comparable load. |
| Three consecutive runs, unchanged code (4) | 6 | The script's three run lines (exit 0, no `FAIL:`/`PRINTED:`) in order, recorded here with their loads; CI green on the published revision. |
| Preserved: a real failure still fails only its test | 6 | One loaded run with one assertion deliberately broken fails that test only (as plan 282 slice 7 observed), then the break is removed. |

## Ordered slices

### 1. A journey's first expectation after an open waits for the published-work read
Type: Behavior
Status: planned
Proof: `dashboard/tests/first-open-waits-for-read.spec.ts` (or a test in
`published-work.spec.ts`): the fake GitHub holds the first `ref` answer 6 s;
`page.goto("/")` then `expectMembership` fails on the current helpers at the 5
s bound and passes with the wait, inside the test timeout; with the `ref`
answer failing, the membership expectation fails inside 5 s naming the titles.
Then `npm run test:dashboard -- accessible-overview published-work
steady-refresh transient-read-recovery published-facts recently-done-progressive
refresh` passes.

Behavior: A page opened by a journey → its first card or membership check →
waits until the page has no published-work read unanswered, then checks.
`pageRequestNotes.ts` notes each read's kind; `untilPublishedWorkRead(page)`
loops as `untilNotedAnswered` does; `expectMembership` and `expectSettledPage`
call it first; the plain first expects after `page.goto("/")` (21 sites) use
those helpers or the wait. The whole-page layout checks in `pageLayout.ts`
(`expectNoSidewaysScrollAndWholeText`, used by `frame-launch-look` and the
accessible-overview specs) observe the page after that wait too: the fresh
run of 2026-10-10 failed `frame-launch-look.spec.ts:101` by listing the
status line's "Reading published work…" as text not read whole. Consumers to
run: the five files asserting "Reading published work…", the `pageLayout.ts`
callers, and every held-read journey.

### 2. Settled checks observe labels after the page's reads
Type: Structure
Status: planned
Proof: `expectSettledPage` callers (40 files) pass; `reopened-project-reads`
passes `--repeat-each 20` through `scripts/dashboard-repeat.sh 1 --load`, its
load lines recorded here. A label still shown after the reads answered fails
the test naming the label and keeps its trace: slice 5's input.

Structure: `expectSettledPage` waits `untilPageReadsAnswered` before checking
"Reading preparation…"; `reopened-project-reads.spec.ts`'s `expectSettled`
waits the same way before its three label checks (through the shared helper
where its membership and source checks allow). Enables slice 5's decision and
slice 6's loaded run.

### 3. Where a fresh run's first seconds go is recorded
Type: Structure
Status: planned
Proof: `/opt/homebrew/bin/bash scripts/dashboard-repeat.sh 1 --fresh` with
the header in place; for the three head-of-run journeys of `8511d0cb`'s
failure (or whichever the run shows slowest), the breakdown of the page's
first `/__authenticated-read` time into admission wait, `gh` spawn to answer,
and the rest, from the kept trace (a failing run) or from a trace recorded for
those specs (a passing run), recorded in Learnings with the run's load lines.

Structure: `dashboard/server/authenticatedRead.ts` (or `performedRead.ts`)
adds `Server-Timing` to each answer from the times `trackedGh.ts` and
`readAdmission.ts` already pass through; `authenticated-read-*` boundary
specs stay green; nothing prints. Enables slice 4.

### 4. An owned cause of the slow first read is removed
Type: Behavior
Status: planned, conditional on slice 3
Proof: In a fresh run after the change, the same breakdown shows the owned
share gone, relative to slice 3's under comparable load; the boundary specs
and the group of slice 1 pass.

Behavior: A fresh checkout's first head-of-run reads → the cause slice 3
named, in the suite (cold module loading, synthetic `gh` start, process
storm) or in the server's handling of a project's first read → no longer
waits on it. When slice 3 names a cause outside both, this slice is replaced
by a bug report named in Learnings and slice 1's wait carries the acceptance.

### 5. The plan-slices label leaves once its reads answered
Type: Behavior
Status: planned, conditional on slice 2
Proof: A spec ordering the branch head and plan answers against the other
detail reads as the kept trace shows them reproduces the persisting label on
the current code and passes after the fix; the loaded repeats of slice 2 pass.

Behavior: After every read a Taken card's slices depend on answered → the
card shows its count → "Reading plan slices…" is gone. When slice 2's loaded
repeats and slice 6's loaded run never show the label after the reads, this
slice is recorded as not reproduced, with the loads observed, and removed.

### 6. The three runs pass and CI is green
Type: Behavior
Status: planned
Proof: On this 16-core machine at 8 workers, with no code change between
them: `/opt/homebrew/bin/bash scripts/dashboard-repeat.sh 1 --fresh`, then
`1`, then `1 --load`; each prints exit 0 and no `FAIL:`/`PRINTED:` line; the
lines and loads are recorded here. Then one loaded run with one assertion
deliberately broken fails that test only; the break is removed before the
result is kept. CI's nine shards pass on the published revision.

Behavior: Unchanged code → the three runs in order → each exits 0 with no
suite output. A failing run is a defect: read its kept directory, fix the
cause in the owning slice above, and start the series again from the fresh
run.

## Verification and sizing

- Slices 1 and 2 are each one proof loop with focused groups of under two
  minutes; slice 1's consumer run is the groups named (a few minutes).
- Slices 3 and 6 are dominated by full runs (about nine minutes each at 8
  workers here, longer under load); run them in the background with a log.
  Slice 3's header is small; its observation is one fresh run.
- Slices 4 and 5 are conditional and sized when their input arrives; each is
  one proof loop or a recorded replacement.
- `node scripts/lint.mjs` and `npm run typecheck:dashboard` at each commit, as
  the repository's hooks require. The whole shell suite is not a local gate;
  CI runs it on publication.
- Install `node_modules` here with `env -u NODE_ENV -u npm_config_local_prefix
  npm ci` before focused checks; the fresh run needs none.

## Preparation review

Refinement of this plan was not needed: each slice owns one proof loop, the
two conditional slices name their input and replacement, and no slice
prepares beyond the next Behavior. The decisive premise that a fresh run
reproduces the slow first read was observed once during planning and did not
reproduce at the head of a run whose later part ran far past the load bound;
it stands at one reproduction in two fresh runs, slice 1's proof does not
depend on it, and slice 3 is the early probe that bounds slices 3 and 4. The plan-slices premise cannot be settled by reading and is
bounded by slice 2's event-first check and loaded repeats, whose result
decides slice 5.
