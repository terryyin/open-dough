# Unify and streamline the dashboard E2E test strategy

**Identity:** SEED-136#unify-and-streamline-dashboard-e2e
**Source:** [selected story](../../seeds/SEED-136-dashboard-test-efficiency.md#unify-and-streamline-dashboard-e2e)

## Goal and scope

Apply one documented two-tier strategy, browser journeys and boundary tests,
to the whole existing dashboard suite so that the same behavior is proved by
fewer browser journeys and less repeated setup, with a measured runtime at
most half the baseline the story records: summed hosted browser-suite step
time ≤ 1,244 s at twelve shards, a local full run ≤ 380 s at 8 workers, and
fewer than 900 selected browser-tier tests. Publish the strategy in
`dashboard/tests/README.md` and map every removed or relocated case to the
test that now proves it.

Included: a boundary-tier server launcher without Vite; relocation of the 158
browserless spec files; one proof that dev and preview serve the same local
boundaries; shared setup and delta assertions across the browser families
that publish an origin per file; presentation-only checks folded into the
journey that shows them or moved down; the production-watcher journeys'
repeated builds; the measurement and proof map.

Excluded: CI job layout, caching, shards, and `longest-first` rebalancing
(SEED-136#restore-ci-under-three-minutes); the shell suite and native host
checks; new feature coverage; a component test harness unless a relocated
check needs one; any test with weaker assertions, retries, or more workers.

Assumptions: Playwright stays the one runner; the hosted "after" measurement
is read from the CI runs this story's publication triggers, at the existing
twelve shards; the local "after" run uses the same machine class and worker
count as the baseline, compared relatively when the machine is loaded.

## Design and existing solutions

- **Playwright as the runner for both tiers** (reuse). 60 of 150 support
  files import `@playwright/test`; the quiet reporter, proof record, suite
  deadline, process-group cleanup, and file-level shard split all hang off
  the one configuration. A `node --test` tier under `npm test` would need a
  second copy of the fakes or a decoupling of 60 files; excluded for this
  story. A boundary test differs from a journey by what it starts, not by
  its runner.
- **Local boundaries mount without Vite** (change). `localBoundaryPlugin`
  hands each boundary's install function a Connect-style `middlewares.use`
  and the HTTP server (for WebSocket upgrades). A small entry,
  `dashboard/server/boundaryServer.ts`, mounts the same install functions on
  a plain `node:http` server and prints its address like Vite does, so
  `startDashboardServer({ mode: "boundary" })` reuses `startOnOwnAddress`,
  `fakeGhEnv`, the synthetic hosts, and `processGroup` unchanged. One child
  process per test keeps the suite's environment isolation (22 `HOME` and
  `homedir()` reads and module-level configuration state in the server),
  which an in-process mount would have to re-prove; in-process mounting is
  considered and deferred.
- **Node runs the server's TypeScript directly** (decision). Strip-only
  type loading fails on `doneMarks.ts:52` (a parameter property);
  `node --experimental-transform-types` loads both plugins. The boundary
  entry runs under that flag with the experimental warning disabled. CI and
  `.node-version` pin Node 24.21; the `engines` range drops `^20.19.0`,
  which lacks the flag, in slice 1. Terry may object to that narrowing.
- **One mount proof for two serving modes** (change). 23 files repeat their
  tests under dev and preview Vite servers; the strategy keeps one spec that
  proves both modes mount the same boundaries and answers the same request.
- **Shared journey setup** (change). 41 browser files publish their own
  origin with production backlog commands in `beforeAll`; the strategy shares
  one origin and preview server per file through the existing
  `publishLaunchJourney` and `dashboardTest` fixtures, asserting the common
  card shape once.
- **Strategy home** (reuse). `dashboard/tests/README.md` is the suite's
  maintained contract; the strategy is feature-local documentation, not an
  ADR or North Star topic. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  applies (fast feedback, one representation, PFE); no conflict.

## Preparation observations and decisive premises

Observed 2026-10-17 in this preparation workspace at `88f6d3f8`, Node 24.21.0,
after `npm ci`; scratch files lived in the job's temporary directory and the
workspace was left unchanged.

| Premise | Consuming observation and result | Consequence / remaining owner |
| --- | --- | --- |
| The local boundaries mount on a plain HTTP server without Vite | `authenticatedReadPlugin().configureServer({ middlewares, httpServer })` with a four-line `use` chain on `node:http`, `HOME` a scratch directory: ready in 14 ms; `GET <diagnostics endpoint>` answered 404 `{"error":"Unknown catalog source."}` from the real handler; `closeServer()` returned. | Settled for the read boundary. Slice 1 mounts both boundaries and proves the launch boundary's WebSocket upgrade through a relocated terminal spec in slice 3. |
| Node loads the server's TypeScript | `import("./dashboard/server/agentLaunchPlugin.ts")` under default stripping fails `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` at `doneMarks.ts:52`; under `--experimental-transform-types` both `agentLaunchPlugin` and `authenticatedReadPlugin` load. | The boundary entry runs under that flag; `engines` narrows in slice 1. |
| Which specs never open a page | 158 files contain no `page` token; they import `pageTest.ts` and drive `startDashboardServer` with `rawHttp.ts` or the terminal clients. 447 declarations, 676 selected tests, 1,252 s of the local run's 5,165 s summed test time. | Slices 1–3 relocate exactly these files; a file found to open a page stays a journey. |
| Relocation shortens the browserless families | Hypothesis. Their 676 tests average 1.85 s with servers started per `describe`; how much is Vite boot is unmeasured. | Slice 1 records the relocated family's summed test time and wall time before and after from proof records; a saving under 30 % keeps relocation for build independence and re-plans the measured target with Terry. |
| Browserless specs do not need the production build | Preview-mode browserless specs pass `prebuilt: builtDashboardDir`; the boundary entry serves no assets. `globalSetup` still builds once per run for the journeys. | Build time stays a browser-tier cost; its placement is the next story's. |
| Shard discovery follows moved files | `testFiles.mjs` reads `tests/` with `recursive: true`; `tests/support/dashboard-test-files.test.mjs` protects discovery; stale `longest-first` entries are ignored. | Relocated files move to `dashboard/tests/boundary/` and stay sharded; `longest-first` is not edited here. |
| The launch boundary starts a Cursor runner at install | `installAgentLaunchMiddleware` returns `ready: ensureCursorRunner()`; tests control it through `HOME` and `PATH` fakes (`cursorRunnerHosts.ts`). | The boundary entry keeps the per-test child process and environment; no in-process mount. |
| Production-watcher journeys build real production | `production-watcher*.spec.ts` set `test.setTimeout(360_000)`; `support/productionWatcher.ts` polls builds for up to 180 s; 7 tests took 516 s locally, 74 s each. | Slice 6 shares one watcher and its builds per file and asserts deltas. |
| Hosted and local baselines | Run 38838738715: twelve shards, suite steps 162–240 s, 2,488 s summed, 4 min 28 s wall. Local: 759 s wall at 8 workers, 1,631 passed, 5,165 s summed, median 1.7 s. | Targets in the story; slice 9 compares at the same shard count and worker count. |

## Outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Boundary tests run without a browser or Vite boot per test | 1: relocated `agent-completion-*` boundary specs pass with `mode: "boundary"`; no Vite process appears in their server output; proof record shows their summed time before and after. |
| Relocated boundary variants (key example 1) | 2, 3: every browserless file runs from `dashboard/tests/boundary/`; a scratch change to one refusal message fails exactly its boundary tests. |
| Dev and preview mount the same boundary | 4: one spec answers the same launch request under real dev and preview servers; the 23 mode loops are gone. |
| No leaked processes (key example "Leaked runner") | 5: an inner Playwright run whose worker is killed mid-test leaves no process under its temp root; the production journeys stop their runners; the whole run's teardown sweep is the backstop. |
| Synchronization and real time (key example 4) | 6: production-watcher journeys wait on the watcher's own output events for one shared build; their summed time falls below a third of 516 s. |
| Consolidated siblings (key example 2) | 7: `agent-launch-card-*` and the other origin-publishing journeys share one origin and server per file; `publishLaunchJourney` calls per run fall from 41; a scratch regression in one card behavior fails one named test. |
| Presentation-only check (key example 3) | 8: `dashboard-header` viewport and font checks become one journey plus the cheapest layout proof; nothing deleted without a named replacement proof. |
| Published strategy; every retained test still runs | 1 drafts, 9 finalizes `dashboard/tests/README.md`; `npm run test:dashboard` and the twelve CI shards run both tiers green. |
| Measured result and proof map (key example 5) | 9: local run at 8 workers ≤ 380 s; hosted run's summed suite steps ≤ 1,244 s; fewer than 900 selected browser-tier tests; the map of removed or relocated cases recorded below. |
| Rejection constraints: no weaker assertions, no retries, no more workers | Every slice: `retries: 0` and worker settings unchanged in the config diff; removed assertions named in the proof map with their replacement. |

## Ordered slices

### 1. Boundary tier proves one family without Vite
Type: Behavior
Status: done
Proof: The six browserless `agent-completion-*` specs, moved to
`dashboard/tests/boundary/`, pass with `startDashboardServer({ mode:
"boundary" })`, whose child is `node --experimental-transform-types
dashboard/server/boundaryServer.ts`; their server output names no Vite; a
proof record of those files before and after shows their summed test time and
wall time; the whole suite stays green; `engines` reads `^22.13.0 || >=24`;
the README gains the two-tier strategy section.

Behavior: a developer runs the relocated family → it starts the local
boundaries on a plain HTTP server per test → the same requests get the same
answers faster, with no production build or Vite boot required by those tests.

Accepted proof (2026-10-17, at the slice 1 commit): the six relocated specs plus
`boundary/boundary-server.spec.ts` pass in boundary mode (`npm run --silent
test:dashboard -- boundary/`, 12 tests); `boundary-server.spec.ts` observes
the child's command line is the Node entry, its output names no Vite, `outDir`
is undefined and `GET /` is 404; a scratch change to one refusal message in
`server/hosts/codex/launch.ts` failed exactly `agent-completion-attempt-loss`'s
two tests; `npm run typecheck:dashboard`, `npm test -- tests/support/dashboard-test-files.test.mjs`
and the whole dashboard suite (1,632 selected, all passed) are green on the
final formatted state. Measurement, relative under load: summed test time
116.6 s before (load 14–26) against 97.8 s after (load 6–9), wall 24 s against
18 s, both including the run's one production build.

### 2. Read, project, proof-record and landing boundary specs relocate
Type: Behavior
Status: done
Proof: The 28 `authenticated-read-*` browserless files and the ~56 other
browserless files outside `agent-launch-*`, `agent-terminal-*` and
`cursor-*` run from `dashboard/tests/boundary/` in boundary mode; a scratch
edit to one read refusal fails only its boundary tests; `npm run
test:dashboard` is green.

Behavior: pre: these specs each boot Vite → trigger: relocation → result: the
same boundary behavior is proved per request without a browser or Vite.

Accepted proof (2026-10-17, at the slice 2 commit): `npm run --silent
test:dashboard -- boundary/` passes 368 tests in 98 files (the 91 relocated
files, the six `agent-completion-*` files and `boundary-server.spec.ts`),
each in the project environment it had; a listing of the 77 inventoried files
before relocation selected 264 tests and the same files select 258 after,
the six dropped loop iterations named in the proof map; a scratch change of
the read boundary's non-GET refusal status (405 to 406) failed exactly
`boundary/authenticated-read-refusal.spec.ts` "refuses a non-GET method
before launching gh" and `boundary/authenticated-read-diagnostics.spec.ts`
"refuses unknown sources, disallowed origins, and non-GET before any GitHub
call" among 376 selected; `boundary/boundary-server.spec.ts` "each project
environment answers the project list from its own configuration file"
observes the environment switch; typecheck, the discovery check and the whole
dashboard suite (1,627 selected, all passed) are green on the final state.

### 3. Launch, terminal and Cursor boundary specs relocate
Type: Behavior
Status: done
Proof: The 58 browserless `agent-launch-*`, 10 `agent-terminal-*` and the
browserless `cursor-*` files run in boundary mode, including the WebSocket
terminal attachments and the Cursor runner lifecycle; the mode loops in these
files are reduced to one serving mode pending slice 4; suite green.

Behavior: pre: launch and terminal boundary tests run twice under Vite →
trigger: relocation → result: each runs once at the boundary with the
synthetic hosts, terminal upgrades included.

Accepted proof (2026-10-17, at the slice 3 commit): the 80 relocated files
select 345 tests after against 457 before, the 111-test difference being the
dropped dev iterations named in the proof map plus the one HMR test moved to
`agent-terminal-hmr.spec.ts`; `boundary/` now selects 713 tests in 182 files;
terminal WebSocket upgrades and the Cursor runner lifecycle at the boundary
server are observed by `boundary/agent-terminal-boundary.spec.ts` ("attaches a
same-origin socket to the recorded session and passes output, input, and
size", the "closes the socket on ..." and "refuses an upgrade ..." tests),
`boundary/agent-terminal-codex.spec.ts`, `boundary/agent-terminal-reopen.spec.ts`,
`boundary/agent-terminal-close.spec.ts`, `boundary/agent-terminal-cursor-runner.spec.ts`
(8 tests: runner started at install, outside the server's process group,
shared by two development-environment servers, ended by `stopCursorRunner`)
and `boundary/agent-terminal-cursor*.spec.ts` (37 tests passed together at
four workers); a scratch change of the launch boundary's non-GET refusal
status failed exactly `boundary/agent-launch-refusal.spec.ts` "refuses POST
before starting claude" among 65 selected; typecheck and the discovery check
are green. The whole dashboard suite could not be shown green on this machine
during the slice: three runs at load averages of 45–257 from other work
passed 1,390–1,435 of 1,516 with the rest page-visibility and test timeouts
spread over untouched journeys; every file this slice changed passed in
focused runs at load 10–30, and the hosted twelve-shard run of the published
revision is the suite verdict. On the final formatted state the whole suite
passed 1,485 of 1,516 at a load average of 40 (wall 2,673 s against the
slice 2 state's 941 s); the 21 files that failed passed 45 of 54 at four
workers and 18 of 19 at two workers, the preparation journeys that pass
through the changed `support/preparationPage.ts` among the passes; the one
left, `boundary/project-add-boundary.spec.ts` "Add validation ends gh on
deadline", is untouched since slice 2's green run and passes one run in two
alone at load 28 (its 500 ms read deadline expires before `gh` is spawned
under load): a pre-existing load-sensitive check, recorded in Learnings.

### 4. Both serving modes mount the same boundaries, proved once
Type: Behavior
Status: done
Proof: One spec starts a real dev server and a real preview server, sends the
same launch and read requests to each, and gets the same answers; no other
spec loops over serving modes (`grep` for the mode loop finds only this spec);
the test count attributable to mode repetition is gone from the proof record.

Behavior: pre: dev and preview equivalence is re-proved in 23 files → trigger:
the strategy's "prove common behavior once" → result: one proof owns it.

Accepted proof (2026-10-17, at the slice 4 commit): `dashboard/tests/serving-modes.spec.ts`
starts a real dev server and a real preview server and compares status,
caching header and body of the same request at the launch boundary (refusal
and listing), the authenticated read boundary (published read and
foreign-Origin refusal), the project configuration boundary (each from its
own environment's file) and the terminal upgrade guard, plus the dev-only HMR
socket; a scratch change making `configurePreviewServer` skip one boundary
failed exactly the project-configuration test; `grep -rn '\["dev",
"preview"\]' dashboard/tests` finds only that spec; the four page journeys
that looped and their replacements select 18 tests against 20 before, the
difference named in the proof map; the 18 passed together at four workers;
typecheck and the discovery check are green. The whole suite ran under load
averages of 6–133 (1,409 of 1,514 passed, the rest timeouts in untouched
journeys); on the final formatted state at four workers the whole suite passed
1,488 of 1,514 (wall 3,742 s, load 10 rising to 80), the 26 failures all
timeouts in `story-review-*` and preparation journeys, none of their 16 files
in this slice's change; the hosted twelve-shard run of the published revision
is the suite verdict. One Cursor runner was still alive after that run and
ended by hand: the leak slice 5 removes.

### 5. No test process outlives its run
Type: Behavior
Status: done
Proof: Every process a dashboard test run starts, directly or through the
product it drives (Vite and boundary servers, synthetic hosts, detached Cursor
runners, Codex and request-owner children, the production watcher's
deployments), is ended when the run ends, including after Playwright
force-kills a worker: a spec runs an inner Playwright (`support/innerPlaywright.ts`)
whose test leaves a detached runner and a teardown that hangs past its
timeout, then asserts that no process rooted in the inner run's temp root
survives the inner run's end; `production-watcher*.spec.ts` and
`production-cursor-runner.spec.ts` stop their fixture HOME's runner in their
own cleanup; after a whole local run, a check over the run's temp root finds
no process; the README's strategy states the rule and where the sweep lives.

Behavior: pre: a timed-out journey's worker is killed and its detached runners
and fake-host clients idle on for hours → trigger: a run-scoped temp root and
the run's own teardown sweep → result: nothing the run started survives the
run; the machine is as it was.

Design: the configuration gives every worker a `TMPDIR` under the run's own
directory (beside the run stamp), so every temp HOME and machine lives under
one root the run owns; `globalSetup`'s returned teardown ends every process
whose command line or working directory is under that root (SIGTERM, then
SIGKILL after a bound), then removes it. Fixtures that know a detached
runner's HOME stop it themselves first (`stopCursorRunner`), so the sweep is
the backstop, not the mechanism; a leftover the sweep had to end fails the
run and names it, so the leak is fixed at its source. Added 2026-10-17 as
Terry's acceptance criterion after five orphaned runners and clients from
timed-out journeys were found on the development machine.

Accepted proof (2026-10-18, at the slice 5 commit): `support/globalSetup.ts`
gives the run `OPEN_DOUGH_DASHBOARD_RUN_ID` before any worker starts and its
teardown ends and names every process still carrying it
(`support/runProcesses.ts`: macOS `ps -E`, Linux `/proc/<pid>/environ`;
settle, SIGTERM, SIGKILL), failing the run; `publishedMainFixture.cleanup`
stops its HOME's Cursor runner; `boundary/run-processes.spec.ts` "a run's own
teardown ends a process its workers could not reach and fails naming it" runs
an inner Playwright under the suite's global setup whose test leaves a
detached, already-orphaned child and holds its teardown past a 3 s timeout,
and observes the inner run exit non-zero naming that pid, the pid dead and no
process of the inner identity left; a scratch fixture cleanup that abandoned
its root made `production-deployment.spec.ts` end with the sweep naming the
detached runner (the exact leak class observed), and the restored fixture
passed; `production-watcher-refusals` and `boundary/agent-terminal-cursor-runner`
(9 tests) left only the machine's own dashboard runner; typecheck and the
discovery check green; a whole run at four workers (load 4–11) passed 1,514
of 1,515 with nothing of the run surviving (the one failure,
`accessible-overview-touch.spec.ts` "an open session's disabled Start reason
is readable without hover", a `toBeInViewport({ ratio: 1 })` on a
visually-hidden paragraph that passed 3 of 3 alone, is untouched by this
slice and recorded for slice 8). On the final formatted state a whole run at
four workers passed 1,515 of 1,515 (wall 1,227 s, load 4–8, summed test time
4,163 s against the baseline's 5,165 s at eight workers) and left no process
of the run.

### 6. Production-watcher journeys share one build
Type: Behavior
Status: done
Proof: `production-watcher*.spec.ts` and `production-cursor-runner.spec.ts`
start one watcher per file and step its states from its own output events;
their summed test time in a proof record is below 172 s (a third of 516 s);
each failure scenario still fails on a scratch regression of the watcher.

Behavior: pre: seven journeys each build production from scratch → trigger:
shared watcher with delta assertions → result: the same exclusions, updates,
failures and recovery are proved on one build chain.

Accepted proof (2026-10-18, at the slice 6 commit): the eight production
files became five; `production-watcher.spec.ts` (5 serial tests, lifecycle and
Cursor runner), `production-watcher-updates.spec.ts` (4: updates, exclusions,
qualification recovery, SIGTERM in a build) and
`production-watcher-failures.spec.ts` (5) each start one fixture and one
watcher in `beforeAll`, await the first activation there, step the watcher
from its own output and stop everything in `afterAll`; real deployments fell
from 26 to 17 and fixture copies from 7 to 4. Measured on one machine state
at two workers (load 4–7): the former files 172.2 s summed, the consolidated
files 107.7 s (135 s counting `beforeAll` spans); in the four-worker whole run
130.2 s (166.5 s with hooks) against 293 s in the slice 5 run, both under the
172 s target. Scratch regressions: `productionQualification.mjs` always
qualifying failed exactly the updates file's exclusions test; a wrong
restoration directory in `scripts/watch-dashboard.mjs` failed exactly the
failures file's restoration test. Typecheck and discovery green; a whole run
at four workers (load 3–7, wall 1,025 s, summed 3,456 s) passed 1,521 of
1,522 with nothing of the run surviving, the one failure the intermittent
`session-result-touch` journey recorded in Learnings for slice 8.

### 7. Origin-publishing journeys share setup and assert deltas
Type: Behavior
Status: planned
Proof: The 41 files calling `publishLaunchJourney` in `beforeAll` share one
origin and preview server per file through the existing fixtures, with the
card's common shape asserted in one named test; single-test files of the same
journey merge where they share preconditions; `publishLaunchJourney` is
called at most once per remaining file; a scratch regression in a card
behavior fails exactly one test; the `agent-launch-*` browser family's
summed test time falls measurably from 1,483 s minus its relocated share.

Behavior: pre: siblings each publish an origin and re-assert common shape →
trigger: consolidation → result: one setup, one common proof, delta
assertions, same regression protection.

### 8. Presentation checks join their journeys
Type: Behavior
Status: planned
Proof: `dashboard-header.spec.ts`'s viewport and font matrix and the
`responsive-session-*`, `dashboard-columns-*` and `side-panel-*` checks are
each either one journey with a state change or a single cheapest layout proof;
the proof map names the replacement of every removed case; suite green.

Behavior: pre: static layout is asserted repeatedly across widths and fonts →
trigger: review under the strategy → result: the layout rule is proved once
where it is cheapest and the user journey keeps its state change.

### 9. Strategy published with measured result and proof map
Type: Behavior
Status: planned
Proof: `dashboard/tests/README.md` states the two tiers, placement rules,
synchronization rule, and how to add a test to each; a local full run at 8
workers finishes ≤ 380 s with every selected test passing; the hosted run of
the published revision shows summed browser-suite step time ≤ 1,244 s at
twelve shards; the proof record lists fewer than 900 browser-tier selections;
the proof map below lists every removed or relocated case.

Behavior: pre: baseline recorded → trigger: campaign complete → result: a
developer reads one strategy and sees the measured, mapped reduction.

## Current decisions

- Playwright is the runner for both tiers; boundary specs live in
  `dashboard/tests/boundary/` and keep the `.spec.ts` suffix so discovery and
  sharding are unchanged.
- The boundary server child runs under `node --experimental-transform-types
  --disable-warning=ExperimentalWarning`; `engines` becomes
  `^22.13.0 || >=24` in slice 1.
- `retries: 0`, worker counts, and shard counts stay as they are; no
  `longest-first` edit in this story.
- The proof map is recorded in this plan under `## Proof map`, one line per
  removed or relocated case with its replacement proof, as slices complete.
- The boundary server (`dashboard/server/boundaryServer.ts`) mounts the one
  list `dashboard/server/localBoundaries.ts`, which `vite.config.mts` also maps
  to its plugins, in the production project environment. A relocated spec
  that needs the development environment (the dev-mode `authenticated-read-*`
  files) needs an explicit environment switch on that entry, decided in
  slice 2.
- While Terry's machine is shared with other work, local whole-suite proof
  runs use `--workers 4` (half the local default) to spare memory; the
  configuration's worker counts are unchanged, and the slice 9 measurement
  runs at the default 8 workers when the machine is quiet.
- About a dozen settings journeys (`system-settings-openai*`,
  `system-settings-project-management*`, `terminal-theme-boundary`,
  `project-remove`, `system-settings-openai-unusable-credential`) still start
  a Vite dev server with no development-environment fact to show; slice 8
  (presentation and settings review) or slice 9 brings them under the
  "preview unless the fact is development's" rule and records each in the
  proof map. `longest-first` carries one stale entry after slice 4's rename
  (`openai-configuration-boundary.spec.ts`), ignored by discovery.
- Slice 5's whole run surfaced one intermittent viewport assertion:
  `accessible-overview-touch.spec.ts` "an open session's disabled Start
  reason is readable without hover" saw `toBeInViewport({ ratio: 1 })` at
  ratio 0 on a `visually-hidden` reason paragraph after
  `scrollIntoViewIfNeeded`, the same assertion family as the slice 3 CI
  repair in `agent-terminal-touch.spec.ts`; slice 8 (presentation checks)
  owns making it deterministic or replacing it with the cheapest layout
  proof, never a lower ratio. Playwright 1.63 kills a worker outright only
  after five minutes without a heartbeat; the leak class is a process whose
  parent is already gone when a timed-out teardown abandons the cleanup that
  would stop it.
- `dashboard/tests/README.md` is 262 lines after slice 5's section (the
  threshold is 250; plan 286 slice 2 accepted the same overrun, ODF-152).
  Slice 9 finalizes the README and takes the cohesive split: the
  journey-writing rules from "A check's bound starts..." onward are the
  natural seam for a second guide beside `proof-record.md` and
  `native-host-fixtures.md`.
- Server modules are named by boundary, not by Vite plugin:
  `launchBoundary.ts`, `projectConfigurationBoundary.ts`,
  `openAIConfigurationBoundary.ts`, `terminalThemeBoundary.ts`,
  `instructionTranscriptionBoundary.ts`; the test launcher is
  `tests/support/serverAddress.ts`. The preparation observations above cite
  the names they had when observed.

## Execution context

- Mode: Story Branch; workspace
  `.worktrees/unify-and-streamline-the-dashboard-e2e-test-stra`, branch
  `claude/unify-and-streamline-the-dashboard-e2e-test-stra`, remote `origin`,
  trunk `main`; agent `bas-chan`.
- Published revisions: claim `7d4c704d` on `main` (starting revision
  `297ff978`); slice increments are published to the remote execution branch
  and listed here as they are accepted.
- Slice 1: `789b7ca9` accepted on `refs/heads/claude/unify-and-streamline-the-dashboard-e2e-test-stra`
  (suffix base `7d4c704d`); observer `/tmp/dough-ci-501/watch-d2776J`.
- Slice 2: `0df843f7` accepted on the same target (suffix base `789b7ca9`),
  observer reused; CI green for both.
- Slice 3: `6a77028e` accepted (suffix base `0df843f7`); CI run 39027197944
  failed in dashboard shard 2/12 on `agent-terminal-touch.spec.ts` (phone case,
  `toBeInViewport({ ratio: 1 })` at ratio 0.97). Repair `76a57055` accepted
  (suffix base `6a77028e`) after the slice 4 writer was paused and its work
  stashed and restored (`ci-repair-stash.mjs`, entry `1a837b08`); the repair
  makes the header-scroll predicate require the session id fully inside the
  scrolling header and the window, the condition the assertion checks. CI green
  for the repair; observer `/tmp/dough-ci-501/watch-07Crdw` from then on.

## Story obligations

### G1. Boundary server runs only the production project environment
Reported: slice 1 — "The entry supports only the production environment; dev-only browserless specs (and slice 4's dev/preview equivalence) need an environment switch or stay on Vite."
Story clause: "the browserless specs leave the browser suite and keep their behavior at the boundary tier, without a browser or a Vite boot per test"
Disposition: proved by slice 4: `dashboard/tests/serving-modes.spec.ts` ("the launch boundary refuses the same request and lists the same sessions in both", "the authenticated read boundary answers the same published read and the same refusal in both", "the project configuration boundary answers the same list in both, each from its own environment's file", "the terminal upgrade guard refuses the same upgrade in both", "the upgrade guard leaves Vite's own HMR socket working, which only the dev server has"), with slice 2's `--environment` switch observed by `boundary/boundary-server.spec.ts` and every former dev start on the development-environment boundary server (slices 2–3)

### G2. Terminal WebSocket upgrades wired but not yet exercised at the boundary tier
Reported: slice 1 — "WebSocket terminal upgrades are wired (real `http.Server` passed to `installAgentLaunchMiddleware`) but first exercised by a relocated terminal spec in slice 3, as planned."
Story clause: "Every retained test still runs locally and in hosted CI through the existing commands and jobs"
Disposition: proved by slice 3: `dashboard/tests/boundary/agent-terminal-boundary.spec.ts` "attaches a same-origin socket to the recorded session and passes output, input, and size" and its close/refusal tests, `boundary/agent-terminal-codex.spec.ts`, `boundary/agent-terminal-reopen.spec.ts` against the boundary server (37 terminal and Cursor tests passed at four workers, log in the execution record); the upgrade path reaches `installAgentLaunchMiddleware` through the real `http.Server` the boundary server hands it, with no change to `server/boundaryServer.ts`

### G3. Every run still builds production once, boundary-only selections included
Reported: slice 1 — "globalSetup still builds once per run even for boundary-only filtered runs (~6 s of the 18 s wall); build placement remains the next story's."
Story clause: "Choosing the CI job layout, caching, and parallelism belongs to the next story."
Disposition: excluded "Choosing the CI job layout, caching, and parallelism belongs to the next story."

## Proof map

One line per removed or relocated case: where it was, where its behavior is
proved now.

- `agent-completion-attempt-loss.spec.ts`, `-binding`, `-early-recovery`,
  `-identity`, `-input`, `-superseded` (11 tests): relocated unchanged to
  `dashboard/tests/boundary/` under `mode: "boundary"`; same titles and
  assertions against the launch boundary's HTTP surface.
- `dashboard/tests/boundary/boundary-server.spec.ts` (1 test, added): the
  boundary tier's server is the Node entry alone, naming no Vite and serving
  no page.
- `boundary/boundary-server.spec.ts` (1 test, added in slice 2): each
  project environment of the boundary server (`--environment development`
  or `production`) answers the project list from its own configuration
  file.
- `authenticated-avatar`, `authenticated-branch-read-boundary` and the 37
  browserless `authenticated-read-*` files (39 files, 199 tests): relocated
  to `dashboard/tests/boundary/` under `mode: "boundary"`, each in the
  project environment it had (`environment: "development"` where it started
  a dev server, production where it started a preview); the describe suffix
  "(dev launch mode)" reads "(development environment)"; assertions
  unchanged. Their shared modules `revisionCheckBoundary.ts` and
  `revisionReuseBoundary.ts` moved with them; `retainedAnswersJourney.ts`,
  `directedWait.ts` and `sharedRequestOwner.ts` stay and start the
  development-environment boundary server for them.
- `authenticated-read-diagnostics.spec.ts`, "preview launch mode mounts the
  same diagnostics route without asking GitHub" (1 test): kept as "the
  production environment mounts the same diagnostics route without asking
  GitHub" against the boundary server; its `outDir` assertion, which only
  named the preview build, is proved by `boundary-server.spec.ts` (`outDir`
  undefined, no build); the dev-against-preview mount equivalence it implied
  is slice 4's one proof.
- `project-add-boundary`, `project-add-validation`,
  `project-configuration-boundary`, `project-input`,
  `project-remove-boundary`, `openai-configuration-size`,
  `session-instruction-voice-boundary` (7 files, 25 tests): relocated to
  `boundary/` under `mode: "boundary"` in the production environment, with
  the mode loops below reduced to that one iteration.
- `project-add-boundary` "(dev)" iteration (1 test): the "(preview)"
  iteration, now the one boundary test, proves the Add boundary; that
  development keeps its own project file is proved by `project-add.spec.ts`
  "Add in empty development leaves the production list on the same machine
  unchanged".
- `project-configuration-boundary` "(dev)" iteration (1 test): the remaining
  boundary test plus `boundary-server.spec.ts` "each project environment
  answers the project list from its own configuration file".
- `project-remove-boundary` "(dev)" iteration (1 test): the remaining
  boundary test; the development file's removal is proved by
  `project-remove.spec.ts` on its dev server ("removing the last project
  leaves a persistent focused empty state").
- `openai-configuration-size` "(dev)" iteration (1 test): the remaining
  boundary test; the credential file is not per environment, and the serving
  modes' equivalence is slice 4's.
- `session-instruction-voice-boundary` "dev audio boundary refuses ..." and
  "dev disconnect and server shutdown abort held upstream work" (2 tests):
  the remaining production-environment boundary tests of the same titles
  without the mode prefix; serving-mode equivalence is slice 4's.
- `one-shot-landing-capture-*` (4), `one-shot-landing-recovery-*` (3),
  `story-branch-landing-*` (4) (11 files, 17 tests): relocated unchanged to
  `boundary/`; the fixture-based specs set `test.use({ serverMode:
  "boundary" })`, the others start `startBoundary`/`restartBoundary`
  (`support/launchDashboard.ts`) or `mode: "boundary"` receivers, production
  environment.
- `proof-record*` (5), `chosen-port`, `compile-cache`, `run-processes`,
  `production-publication-fixture`, `production-qualification` (10 files,
  30 tests): relocated unchanged to `boundary/`; they start no dashboard
  server.
- `accepted-attempt-settlement`, `claude-prompt`, `done-question-rule`,
  `execution-start-result`, `joined-sockets-replay`,
  `kept-client-screen-replay`, `launch-attempt-*` (3),
  `launch-observations`, `launch-record-session-rules`,
  `launch-workspace`, `preparation-start-result`,
  `session-alerts-unread-report`, `session-result-admission`,
  `session-result-codex`, `session-unread-rule`,
  `session-workspace-retirement-boundary`,
  `session-workspace-retirement-startup`, `shared-request-owner`,
  `start-store`, `story-review-diff`, `story-review-folders`,
  `story-review-workspace` (24 files, 84 tests): relocated unchanged to
  `boundary/`; those that start a server start the boundary server
  (`session-alerts-unread-report` and `session-result-admission` in the
  production environment, `shared-request-owner` in development).
- The 63 browserless `agent-launch-*`, 13 `agent-terminal-*` and 4
  `cursor-*` files (80 files; 457 selected tests before, 345 after, the
  difference named below): relocated to `boundary/` under `mode: "boundary"`,
  `test.use({ serverMode: "boundary" })` on the fixture chains, or
  `startBoundary` (`support/launchDashboard.ts`), in the production
  environment unless named below; titles and assertions unchanged. The
  modules `openStorySessionAcceptance.ts`, `ownRecordContinuation.ts`,
  `settledAttempt.ts` and `codexEffortBoundaryCases.ts`, imported only by
  them, moved with them. `support/preparationPage.ts` starts the
  `serverMode` server, so its page journeys keep the built preview.
- The dev iteration of the serving-mode loops in `agent-launch-ad-hoc-boundary`
  (9 tests), `agent-launch-boundary` (8), `agent-launch-codex-startup` (1),
  `agent-launch-environment` (1), `agent-launch-model-boundary` (17),
  `agent-launch-options-boundary` (12), `agent-launch-options-groups` (4),
  `agent-launch-refusal` (23), `agent-terminal-boundary` (16),
  `agent-terminal-codex` (3), `agent-terminal-cursor-idle` (4),
  `agent-terminal-cursor-launch-wait` (3), `agent-terminal-cursor-launch`
  (7), `agent-terminal-cursor-trust-join` (2) and `agent-terminal-cursor` (1)
  (111 tests): the remaining boundary test of the same title, without the
  "(dev launch mode)" / "(dev)" suffix, proves the behavior; none of these
  iterations observed the development project environment; serving-mode
  equivalence is slice 4's one proof.
- `agent-terminal-boundary` "leaves Vite's own HMR socket working" (the dev
  iteration's 1 further test): kept as `agent-terminal-hmr.spec.ts` in the
  journey directory on a real dev server, the only server with that socket;
  slice 4 may fold it into the equivalence spec.
- `agent-launch-cross-server-accept` and `agent-launch-records` (two servers
  on one machine, one dev and one preview): the pair is now a
  development-environment and a production-environment boundary server
  (`serverOn("development" | "production")`); no test dropped.
- `agent-terminal-cursor-runner` through `support/cursorRunnerHosts.ts`,
  `cursorRunnerLifetime.ts` and `cursorRunnerRestart.ts`: every dev start is
  `developmentBoundary` (`startCursorDashboard` takes a `CursorServer`,
  `support/keptCursorTurn.ts`); same eight titles.
- `agent-launch-acceptance-kept-first-cleanup` "after preview fails" reads
  "after server fails": the inner Playwright run perturbs the relocated
  kept-first spec's boundary server the same way.
- `agent-launch-uncertain-continuation` takes its origin fixture from
  `support/startOriginTest.ts` instead of `responsiveStart.ts` (the same
  `origin`/`machine` fixtures without the page helpers).
- `agent-launch-refusal` "refuses a launch request naming a foreign Host"
  (1 test, kept): Vite's host check answered it first, as plain text; at the
  boundary server the launch boundary's own guard (`server/localOrigin.ts`)
  answers, so the test now also asserts that JSON `error`, as the other
  refusals do.

- `dashboard/tests/serving-modes.spec.ts` (5 tests, added): the suite's one
  proof that the dev server and the built preview mount the same local
  boundaries. It starts a real server of each and sends both the same
  request, comparing status, `cache-control` and parsed body: the launch
  boundary's refusal of an unknown project and its machine-sessions listing,
  the authenticated read boundary's published read (same `gh` ref
  resolution first) and its foreign-Origin refusal, the project
  configuration list (each answered from its own environment's file, the
  other file absent), and the terminal upgrade guard's refusal; plus the
  dev-only HMR socket check below.
- `agent-terminal-hmr.spec.ts` "leaves Vite's own HMR socket working" (1
  test; file removed): `serving-modes.spec.ts` "the upgrade guard leaves
  Vite's own HMR socket working, which only the dev server has", the same
  assertion against that spec's dev server.
- `authenticated-project-overview.spec.ts` "(dev launch mode)" iteration (1
  test): the remaining journey, without the suffix, now on the `dashboard`
  fixture's preview server (`test.use({ extraEnv })` carries the credential
  marker) with its built-assets check unconditional; that the dev server
  answers the same read is `serving-modes.spec.ts` "the authenticated read
  boundary answers the same published read and the same refusal in both".
  `catalogProjectRecords.ts` `expectPinnedGhCalls` lost its `mode` parameter
  and the dev-StrictMode tolerance of a repeated ref resolution with it.
- `openai-configuration-boundary.spec.ts` "OpenAI configuration refuses
  foreign/malformed requests without changing private files or contacting a
  provider" "(dev)" and "(preview)" (2 tests): one test of that title in
  `boundary/openai-configuration-boundary.spec.ts` against the boundary
  server (`systemSettingsMachine().start("boundary")`), assertions
  unchanged; the page test stays in the journey file.
- `project-configuration.spec.ts` "(dev)" iterations of "saved projects
  retain order and default selection across restart", "an existing empty
  list stays empty" and "a malformed saved file is explained and left
  byte-identical" (3 tests): the former "(preview)" iterations, now without
  the suffix; "development first start is empty and refuses the formerly
  fixed project" keeps the development environment's own fact, and
  `serving-modes.spec.ts` "the project configuration boundary answers the
  same list in both, each from its own environment's file" the mount.
- `system-settings-terminal-theme.spec.ts` "terminal theme is chosen ...
  kept across reload, restart and preview ... (dev)" (1 test): the
  "(preview)" order remains as "... restart and the dev server ...": the
  theme file is one per machine, so one order shows the sharing, and the
  reverse order read the same file through the same boundary, which
  `serving-modes.spec.ts` proves both servers mount.

- `production-cursor-runner.spec.ts` "the production command starts one
  Cursor runner and leaves that client up across replacement and a restart"
  (1 test): merged into `production-watcher.spec.ts`, whose one fixture and
  watcher it shares: "the production command starts one Cursor runner
  outside the preview's process group, which a launched Cursor session uses"
  (groups, one runner, the launch, one attach, `create-chat`), with the
  runner's and client's survival asserted in "the next published main
  replaces production at the same URL and leaves the runner and its client
  in place" (terminal reattached), "stopping the watcher ends production and
  its checkouts, leaves development and the runner, ..." and "a restart
  serves current main as its baseline with the same runner, and SIGINT ends
  it" (address pid, separate groups, input after the restart, one attach,
  one call). The runner is read before the development server starts, so it
  is the production command's own, which the development server then shares.
- `production-watcher.spec.ts` "npm watcher serves published main beside
  hot-reloaded uncommitted development, enforces local boundaries, owns
  shutdown and restarts at current main" (1 test): the same assertions in
  five serial tests of that file on one build chain; the restart's baseline
  is the chain's documentation-only third commit, so the restarted page
  shows the second commit's title and the pinned banner source, and the
  "no rebuild of earlier commits" check names both earlier commits.
- `production-watcher-updates.spec.ts` "npm watcher replaces production with
  each newly published main commit at the same URL, ..." (1 test): the same
  title keeps A, B and C (held builds, pinned build, shared record and
  configuration, boundary reads, retirement after C); its ending is the
  file's last test "SIGTERM while a commit is in its real build ends that
  build, the served preview and every deployment checkout, and leaves shared
  records and configuration untouched", at the end of the whole chain, with
  the held build's ordinal taken from the recorded builds.
- `production-watcher-exclusions.spec.ts` (1 test): now
  `production-watcher-updates.spec.ts` "npm watcher skips excluded-only main
  ranges, builds accumulated and mixed ranges once at the latest commit, and
  follows the published CI policy over a different local workflow", stepping
  from the chain's served C instead of its own A; the excluded-only skip,
  the two-commit range built once (the intermediate commit absent from the
  output, one more "Preparing"), the policy change, the skip under the new
  policy and the documentation commit that now qualifies are unchanged; the
  build list is the chain's cumulative list; the stop and the empty
  deployments and inspections are the file's last test.
- `production-watcher-qualification-recovery.spec.ts` (1 test): now
  `production-watcher-updates.spec.ts` "npm watcher keeps its baseline
  through an unsupported published policy and failed builds, then compares
  from the next successful activation", stepping from the chain's served H;
  P, Q, R, S and T and their assertions unchanged; the fault gate is
  published with A for the whole chain.
- `production-watcher-failures.spec.ts` "failed builds and real preview
  activation keep or restore working production, retry the same commit,
  survive origin failure and stop checks" (1 test): the same file's "a
  failed build keeps working production and the same commit is retried
  until it builds", "a failed preview start restores the working commit and
  the same commit is retried until it serves" and "an unavailable origin
  keeps production and checks resume when it returns; SIGHUP ends the
  watcher without a failure", on one chain whose A publishes the fault gate.
  Removed: the 1.1 s sleep and `expect(watcher.output()).toBe(endedOutput)`
  after the hang-up: `watcher.exited` resolves on the command's close
  event, after which no output can arrive, so that comparison could not
  fail; the exit without a failure line, the dead preview, the refused URL
  and the empty deployments remain asserted.
- `production-watcher-failures.spec.ts` "failed restoration reports both
  causes, exits and cleans up; an unexpectedly ended preview ends the watcher
  with cleanup" (1 test): the same file's "a failed candidate whose
  restoration also fails reports both causes, exits and cleans up" (the
  restarted watcher serves C; D publishes the plain gate while both
  `fault-preview` and `fault-preview-c` are armed, so D's start and C's
  restoration both fail) and "an unexpectedly ended preview ends the watcher
  with cleanup", assertions unchanged.

## Learnings

- Slice 2 found 14 more browserless files than the `page`-token inventory
  (the token appeared only in comments or error strings):
  `authenticated-avatar`, `authenticated-branch-read-boundary`,
  `authenticated-read-boundary`, `-containment`, `-directed-wait`,
  `-profile-addition`, `-refusal`, `-revision-check-failures`,
  `-revision-reuse-history`, `-subprocess-lifecycle`,
  `-transient-eligibility`, `done-question-rule`, `run-processes`,
  `session-unread-rule`; all relocated. A code-level scan (comments and
  string literals stripped) is the test for slice 3's `agent-launch-*`,
  `agent-terminal-*` and `cursor-*` lists too, and it still needs a read of
  each hit: `plan-execution-complete-detail` and
  `openai-configuration-boundary` passed the scan but open a page.
  `openai-configuration-boundary.spec.ts` keeps a dev/preview loop beside
  its page test; slice 4 owns it.
- The boundary server takes `--environment development|production`
  (`startDashboardServer({ mode: "boundary", environment })`, production
  when unset); a development-environment boundary server gets
  `configureDevelopmentProjects` as a dev server does. Slice 3's
  `cursorRunnerHosts.ts` dev-mode start maps the same way.
- Slice 2's refactor pass named the dev server's environment at the boundary
  `developmentBoundary` (`support/dashboardServer.ts`), put the environment
  rules in `support/projectConfiguration.ts` (`projectEnvironmentOf`,
  `projectConfigurationFile`), moved the mode-to-launch selection into
  `support/serverAddress.ts` (`serverLaunch`), renamed
  `support/launchPreview.ts` to `launchDashboard.ts`, and split
  `authenticated-read-profile-addition-refusal.spec.ts` out of the
  profile-addition spec (7 tests moved, none changed). A blanket
  `./` to `../` comment rewrite breaks references between relocated
  siblings; slice 3 runs a path-resolver scan after relocating.

- Slice 1 measured the relocated `agent-completion-*` family at 97.8 s summed
  test time against the 116.6 s baseline (-16 %; wall 18 s against 24 s, the
  run's one production build included in both), on a less loaded machine
  (load 6-9 against 14-26). Vite boot was a small share of these tests; their
  time is their own real git, start and host work. Under the premise row
  "Relocation shortens the browserless families", relocation is kept for
  build independence and the measured target (local run <= 380 s) needs
  re-planning with Terry before slice 9 relies on relocation alone; slices
  6 and 7 carry the larger savings.
  Decision for Terry at the next checkpoint, not blocking slices 2–7: keep
  the ≤ 380 s local target and judge it after slices 5–6 (recommended: the
  watcher and origin-publishing families hold most of the summed time, and
  the measurement so far is a small, load-skewed sample), or revise the
  number now.
- The refactor pass gave the local boundaries one list
  (`server/localBoundaries.ts`) feeding both Vite and the boundary server,
  removed the per-boundary `*Plugin()` factories, and moved the proof-record
  guide out of the tests README into `dashboard/tests/proof-record.md`.
- Full `npm test` on the slice 1 final state failed once in
  `src/skills/dough-execute-plan/scripts/github-request-login-secrecy.test.mjs`
  (`machine.asked("alice").length` 3 instead of 4) under the whole suite's load
  (load average 16–24); the check passed three times alone, and neither it
  nor anything under `src/` is touched by this story. Disposition: unrelated
  load-sensitive count in that check, reported for the retrospective; not a
  dashboard defect.
- Full `npm test` on the slice 2 final state failed once in
  `tests/native-setup.sh` (expected "npm source stalled: acquisition deadline
  exceeded", got "acquisition deadline expired before launch") while the
  machine's load average was 60–105 from other work; the check passed alone
  5 s later at load 50, and nothing under `tests/`, `scripts/` or `src/` is
  in this story's change. Same disposition as above: load-sensitive timing in
  an unrelated check, reported for the retrospective. The secrecy check that
  failed after slice 1 passed this time.

- Slice 3's code-level scan found 80 browserless files in the
  `agent-launch-*`, `agent-terminal-*` and `cursor-*` families (eight more
  than the `page`-token inventory); the 7 `agent-launch-*` files and
  `cursor-sidebar-size-unkept` that the scan flagged all take the `page`
  fixture and stay journeys. After this slice the only serving-mode loop left
  beside a page test is `openai-configuration-boundary.spec.ts` (slice 4),
  and the only dev-server start outside a page journey is
  `agent-terminal-hmr.spec.ts` (one test). Slice 4's equivalence spec must
  cover the launch request, a read request, and a terminal upgrade under both
  real Vite servers, and may absorb the HMR check.
- Two relocated tests, `agent-launch-preparation-resume` "an interrupted
  precommit start recovers ..." (17 s alone) and `agent-launch-start-resume`
  "a stop that carries recovery ..." (24 s alone), run several real git
  starts inside Playwright's 30 s test timeout and exceeded it under a load
  average of 40-57 from other work on this machine; the whole boundary tier
  under that load timed out 44 tests across unchanged slice 1-2 files too.
  Their work and timeout are unchanged by relocation (the boundary start is
  the cheaper part); a longer per-test timeout for the git-heavy start specs
  is a candidate for the coordinator, not a weaker assertion.
- Slice 3's refactor pass made `CursorServer` the `{ mode: "boundary",
  environment? }` shape (no page journey used `startCursorDashboard`), put
  the fixture's server-mode rule in `dashboardTest.ts` (`fixtureServerMode`,
  shared with `support/preparationPage.ts`), merged the duplicated
  `test.use` calls the relocation left in 13 specs, and renamed the
  `dev`/`preview` server variables of the two-environment specs. Fifteen
  page journeys still spell `mode: "preview", prebuilt: builtDashboardDir`
  for restarts; slice 4's loop removal is the moment to look.
- Load-sensitive tests surfaced by the slice 3 runs (load averages 25–98
  from other work on this machine): `boundary/project-add-boundary.spec.ts`
  "Add validation ends gh on deadline" (500 ms read deadline can expire
  before `gh` spawns), `agent-launch-preparation-codex-retry.spec.ts` (four
  git-heavy starts near the 30 s test timeout), and the two start-resume
  specs named above. None is changed by this story; a test whose bound a
  loaded machine can exceed is a defect of the test (tests README), for the
  retrospective or a correction, not a weaker assertion here.
- Full `npm test` on the slice 3 final state failed in `tests/native-setup.sh`
  (again) and `tests/test-runner-budget.sh` ("the ci-over budget report is not
  exactly the two breaches") at a load average of 95–133; both passed together
  on an immediate rerun, and neither is touched by this story. Same
  disposition: load-sensitive timing in unrelated checks, for the
  retrospective.
- Slice 4's equivalence spec (`serving-modes.spec.ts`) runs both real Vite
  servers in one `beforeAll` and answers five tests in under 2 s after the
  starts; after it, `grep -rn '\["dev", "preview"\]' dashboard/tests` finds
  only that spec's `modes` constant. Page journeys that still start a dev
  server do so for the development project environment's own facts
  (`project-add`, `project-remove`, `system-settings-project-management*`,
  `system-settings-openai*`, `terminal-theme-boundary`, `project-configuration`
  "development first start", `frame-overview-look`, `unchanged-records-refresh`,
  `authenticated-read-owner-failures`), one start each, no loop; slice 8's
  README placement rule should say so. The journey file
  `openai-configuration-boundary.spec.ts` now holds only its page test; a
  rename (for example to the recovery it shows) is a slice 8 or 9 candidate.
  The fifteen `mode: "preview", prebuilt: builtDashboardDir` restarts noted
  after slice 3 were not reached by this loop removal and stay as they are.
- Slice 5 found the leak's mechanism is abandoned cleanup, not killed
  workers: Playwright 1.63 SIGKILLs a worker only after five minutes without
  a heartbeat (`PWTEST_CHILD_PROCESS_TIMEOUT`); a timed-out test or teardown
  otherwise ends the worker gracefully, so its `exit` cleanup
  (`support/processGroup.ts`) runs and ends every descendant. What it cannot
  reach is a process whose parent was already gone, such as the Cursor runner
  a stopped preview or killed server had detached, when the cleanup that
  would have stopped it (a production journey's `finally`, a machine-owning
  helper's `close()`) was abandoned by the timeout. A runner exits by itself
  within 500 ms of its `HOME/.open-dough/dashboard` directory being removed,
  so a cleanup that ran leaks nothing; an abandoned one left its runner for
  good. The run's identity is `OPEN_DOUGH_DASHBOARD_RUN_ID`, a fresh UUID
  `globalSetup` sets (`support/runProcesses.ts`), not the config's
  `OPEN_DOUGH_DASHBOARD_RUN_STAMP`: an inner Playwright run under the suite's
  global setup takes its own identity and never sweeps the outer run's
  processes, and two checkouts' runs in one second never share one. For
  slice 6: a watcher shared per file keeps one `publishedMainFixture.cleanup`
  in `afterAll`, which now stops the HOME's runner, and whatever a timed-out
  file leaves is ended and named by the run's teardown, failing the run. Five
  `dough-published-main-*` roots left in this machine's temp directory by
  earlier abandoned cleanups (2026-10-17, 17:06 and 21:0x) were not removed.
- Slice 6 measured the production journeys three ways on one machine state
  (load 4–7). The former eight files, run as scratch copies at two workers,
  summed 172.2 s of `durationMs` (293 s in the slice 5 four-worker run, 516 s
  in the story's eight-worker baseline: the number is mostly contention).
  The consolidated files at two workers summed 107.7 s for the same scope
  (-37 %), or 135 s counting each serial file's `beforeAll`, which a proof
  record's `durationMs` leaves out: a serial file's hook time shows only as
  the gap between its first test's `startedAt` and its second's. Slice 9's
  measurement must add those spans (or read wall time) for serial files,
  and the "third of 516 s" was a contention-inflated baseline: at equal
  conditions the saving is the removed work itself.
- Where the production journeys' time goes now: 17 real deployments
  (fetch, `npm ci`, Vite build, preview start, about 4.5 s each when the
  machine is quiet; 26 before) plus four fault-failed or held partial ones,
  four full-source fixture copies (seven before), two development installs
  and dev servers (three before), four settled skips (about 2.3 s each at
  the 500 ms check interval) and the held-build and repeated-check polls.
  Every remaining deployment is a scenario's own event (a replacement, a
  qualifying range, a recovery, a watcher life after a death); none is a
  repeated first activation. Two levers were left untouched as product or
  policy decisions: the fixture HOME's cold npm cache costs each file's
  first `npm ci` about 3.7 s more than a warm one and fetches from the
  network with `--fetch-retries=0` (a shared `npm_config_cache` in
  `fixture.env` would remove both, at the price of writing the developer's
  `~/.npm`), and a stub `build:dashboard` in the fixture commits would save
  about 2 s per deployment by no longer running Vite, which these journeys
  exist to run.
- Serial production files: a failing test skips the file's later tests
  (reported as skipped, not failed), and a test that ends the watcher
  (SIGHUP, a failed restoration, a killed preview) hands the next test a
  restart at current main, which costs one deployment each; the fault gate
  reads one cause file per commit variant, so a chain that mixes the plain
  and `-c` gates must arm both causes to make a restoration fail.
- The slice 6 whole run at four workers (load 3–7, wall 1,025 s, summed
  3,456 s, 1,522 selected, nothing of the run surviving) failed one test
  untouched by this slice: `session-result-touch.spec.ts` "short phone 240 ›
  reads the question and touches each full choice, retaining identity
  through resize and rotation" (`reportTouchPage.ts:102`, the report's
  content reported `visible: false, hit: false` after an ordinary touch); the
  file passed 4 of 4 alone afterwards. Like the `accessible-overview-touch`
  failure after slice 5, a presentation journey under load, recorded for
  slice 8; kept evidence in `dashboard/test-results/2026-10-17T16-45-12.898Z`.
