# Dashboard tests

Run the dashboard's single Playwright suite from the repository root with
`npm run test:dashboard`. Its two tiers share one run and shard selection.
See [journey writing](writing-journeys.md) for waits, clocks, commands and fake
GitHub answers; [native-host fixtures](native-host-fixtures.md) for synthetic
hosts; [proof records](proof-record.md); and [CI shards](shards.md) for allocation,
recorded times and deadlines.

## Two tiers: browser journeys and boundary tests

A **browser journey** proves one representative, integrated user journey in
the real page: an observable precondition, the user's trigger, and the state
change it causes. Journeys live directly in this directory and run under
`dashboardTest.ts` or a fixture module built on it, each against its own
built-preview server, which the `page` fixture opens.

A **boundary test** proves the detailed variants, failure cases and contract
details of one behavior at a stable public boundary of the dashboard server
-- its HTTP endpoints, WebSocket upgrades, the files it keeps under HOME, the
commands it installs -- or of a module read in-process, without a browser.
Its collaborators are the real ones; only the external boundaries are
replaced: GitHub through the synthetic `gh`, the agent hosts through the
synthetic `claude`, `codex` and `cursor`, and GitHub's avatar host. Boundary
tests live in `boundary/` and normally use `startDashboardServer({ mode:
"boundary" })` or `test.use({ serverMode: "boundary" })` on `dashboardTest.ts`.
`node <run-bundle>/boundaryServer.mjs` mounts Vite's local boundaries
(`../server/localBoundaries.ts`) on plain HTTP without Vite or a build. It uses
the preview's production project environment, or the dev server's through
`developmentBoundary` (`support/dashboardServer.ts`).
`boundary/boundary-server.spec.ts` shows each environment's own project file
(`support/projectConfiguration.ts`) without Vite or a page.
Boundary and preview use the run's bundled `runnerMain.mjs`; dev and public
production keep source. `boundary/serving-modes.spec.ts` proves both real Vite
servers mount the same boundaries and use those entries.

`boundary/` holds every spec that opens no page, whatever it drives; a spec
that opens a page is a journey, however small, and a journey never repeats a
variant the boundary tier can answer. Both tiers are one suite, run and
sharded together (below).

## Where a check goes

Put a check where it is cheapest to prove, and prove it once:

- **A variant of how the server answers** -- a refusal, a failure case, a
  contract detail, a file the server keeps -- is a boundary test. A journey
  shows that the page does the thing once; the boundary tests own every
  variant.
- **A journey runs under the fixture's built preview.** The dev server and
  the preview mount the same local boundaries, and `boundary/serving-modes.spec.ts`
  is the one spec that proves it: it starts a real server of each, sends
  each boundary the same request from both, and compares the answers
  (status, headers, body), with Vite's own HMR socket, which only the dev
  server has, shown working beside the terminal upgrade guard. No other spec
  repeats its tests under both servers. A journey starts a dev server only
  for a fact of the development project environment: `project-add`'s and
  `project-configuration`'s empty development first start,
  `project-remove`'s removal of development's last project, the machine file
  `system-settings-openai` and `system-settings-terminal-theme` share across
  both environments, and `frame-board-look`'s frame with no project
  configured, a state only development starts in.
- **A layout rule is proved once per CSS branch**, in the journey whose
  state change is observed at that width (`dashboard-header.spec.ts` runs
  one journey per container branch of `banner.css`; `side-panel-width*.spec.ts`
  prove the panel's query from each side once), and a font case only where
  a font reproduces a wrap. A presentation-only check, one with no state
  change of its own, joins the journey whose state change shows it or moves
  down a tier to the cheapest proof of the rule; a matrix of widths or fonts
  over one static layout is not written.
- **Siblings share read-only preconditions and assert deltas.** Publish inputs
  no test writes once per worker (`launchJourney`'s origin); use one fixture per
  serial file for state tests step through (`production-watcher*.spec.ts`'s watcher).
  [Journey writing](writing-journeys.md) explains both. Assert the common shape
  once (`agent-launch-story-card.spec.ts`, "every Backlog card offers Start
  execution ..."); siblings assert differences so a regression fails one named
  test. Servers and fake GitHub stay per test: siblings vary `projectFolders`,
  `launchTimeoutMs`, viewport and usually launch or mark done.

Fresh installed-start origins are packed once per run from current working-tree
skills (`support/startOriginPreparation.ts`): one Claude and one Codex/Cursor
layout. Tests receive private byte copies and native clones with independent
objects, refs, config, indexes and HOME; preparation stays read-only and global
teardown removes it. Without global setup, nested runs prepare only their
requested layout and remove it after initialization. Eager setup costs time
even without starts, avoiding repeated skill copying, indexing and initial
commits. Servers, browser contexts and fake-service state stay private.

## Synchronization

A wait ends on an observed event: a shown fact, a recorded state, an
answered request, a held request reaching its handler, a watcher's own
output line. No test sleeps, waits out a deadline, or retries in the hope
that the event has happened by then; only a check that something does not
happen waits out a window, because no event marks an absence. A check's
bound starts after the answer it depends on: an `expect` waits 5 seconds,
and under load a `gh` start or a server's own work can take longer, so a
journey first waits in the page for the request to be answered or to fail
(`openUntilRead`, `expectSettledPage`, `markDone`) and only then checks what
the page shows. Time the product intentionally waits -- the 15-second
refresh pace, a rate limit's directed wait, a session's state pace -- is
stepped under a paused page clock or proved at the boundary. The action that
starts asynchronous work owns the wait for its answer. A dashboard failure
on unchanged code, including under load, is a defect of the test or the
product to find and fix, never a reason to rerun until green; the suite
keeps `retries: 0`. [Writing a journey](writing-journeys.md) names the
helpers and the event each one waits for.

## What is real and what is replaced

Each run bundles its Vite configuration, boundary server and Cursor runner
into its own directory under `node_modules`, preserving source-relative
`import.meta` paths. Preview and boundary servers load it; dev serves source.
It also builds the app once in a temporary directory. Success, failure or
graceful interruption removes both directories; concurrent runs never
rebuild or remove each other's files, and `dashboard/dist` stays untouched.
Each journey (`dashboardTest.ts`) serves that build from its own preview
server with a synthetic `gh` on PATH (`fixtures/fake-gh`), answering from
the test's own fake GitHub (`support/fakeGitHub.ts`, published through
`publishedOrigin.ts` or `committedOrigin.ts`), which can also fail, hold, or
rate-limit an answer. The same fake stands in for GitHub's avatar host, from
which the server fetches credited humans' avatars (`avatarAnswers.ts`). Only
GitHub's answers are replaced; the local read boundary, the `gh` invocation,
reading, the shared backlog interpretation, and the page are the real ones,
and a browser request to GitHub itself fails the test that made it. Nothing
here ever calls the real `gh` CLI or contacts GitHub: every process a test
starts that can run `gh` asks it through a GitHub request owner of that
test's own, and a run in which a process asked without one fails at its end
naming that. Every server binds a port the operating system chooses, so the
suite can run beside another checkout's suite on the same machine, and a
server that cannot start fails its test with its own output
(`support/dashboardServer.ts`). Test support takes the repository root from
`support/repositoryRoot.ts`, never the working directory (lint refuses
`process.cwd()` in test code), so `--config <repository>/dashboard/playwright.config.ts`
gives the same result from anywhere.

The configuration sets `NODE_DISABLE_COMPILE_CACHE=1` before global setup and
workers start; builds, servers and deployment descendants inherit it, even
when `NODE_COMPILE_CACHE` names an existing cache, leave that cache's entries
intact and add no persistent compile cache to reclaim after a failure. The
calling Node/npm process can still cache its own startup before the
configuration loads, and dashboard commands outside the suite keep their own
policy. `boundary/compile-cache.spec.ts` makes real enable/import/flush
attempts, preserves seeded cache hashes through repetition, overlap, failure
and signals, and checks an outside-policy child really can write cache; only
that API probe is skipped on supported Node versions without the API.

## Adding a test

A **boundary test** goes in `boundary/<behavior>.spec.ts`. It imports `test`
from `../dashboardTest.ts` with `test.use({ serverMode: "boundary" })`, or
from `../support/pageTest.ts` and starts `startDashboardServer({ mode:
"boundary" })` (or `developmentBoundary`) itself; it sends its requests with
`support/rawHttp.ts` or the terminal clients and asserts the answer, the
file or command. Only `boundary/serving-modes.spec.ts` needs a build.
A spec starting no server still takes `test` from `pageTest.ts`, as lint requires.

A **browser journey** goes in this directory as `<journey>.spec.ts`. It
imports `test` from `./dashboardTest.ts` or the fixture module of its
family (`responsiveStart.ts`, `support/preparationPage.ts`,
`support/voiceTest.ts`, `support/codexLaunch.ts`), takes `page`, `dashboard`
and `github` (and `launchJourney` for the Taken backlog), opens with
`openUntilRead(page)`, acts as the user, and asserts the state change; a
sibling of an existing journey joins that file and asserts its delta. A
worker-scoped fixture, or a `launchOptions` value, is declared once, in
`support/pageTest.ts`, whose header says why a second home splits the
workers.

Discovery and sharding follow the file: `support/testFiles.mjs` finds every
`*.spec.ts` under `tests/` recursively and CI's split ([dashboard
shards](shards.md)) deals whole files by the seconds `longest-first` records
for them, so a new file needs no registration; unrecorded there, it is dealt
after the recorded files at their median duration until that list is next
refreshed from a hosted run, and the preview in [dashboard shards](shards.md)
shows where it lands before a push.
`tests/support/dashboard-test-files.test.mjs` protects discovery of new specs
and their assignment to exactly one shard.

## Running the suite

Run from the repository root; `npm run test:dashboard -- boundary/` or
`-- --grep 'published Board'` selects files or tests, and `npx playwright
test` from `tests/` finds no configuration, so it would run without the
build, the quiet reporter and the run's identity. Local runs use Playwright's
default worker count, CI runs every core.

CI runs the suite as shard jobs, each running the whole spec files
`OPEN_DOUGH_DASHBOARD_SPLIT=i/n` deals it by recorded duration, keeping its
spec files' seconds through
`OPEN_DOUGH_DASHBOARD_TIMES` as artifact `dashboard-times-<shard>`, the source
`longest-first` is refreshed from, and running under
`OPEN_DOUGH_DASHBOARD_DEADLINE_MS`; [dashboard shards](shards.md) holds the
split with its preview and refresh, the times file and the deadline. With
the variables unset, `npm run test:dashboard` runs the whole suite, unbounded,
and writes no times file.

A passing run prints nothing (`support/quietReporter.ts`) and leaves no
output directory. A failing spec is shown with its error, output, and
retained trace; a passing spec that writes output, or output from the run
itself such as global setup, fails the run and is shown. Keep specs and
their helpers silent. A failed run keeps what it showed, as `report.txt`,
beside its traces and other retained files in `dashboard/test-results/<start time>/`,
named by its last line, `Kept: <directory>`. A later run never removes an
earlier run's directory; remove kept runs yourself once read.
`bash scripts/dashboard-repeat.sh <repetitions> [--load] [--fresh] [spec…]`
runs the suite, or the named specs, that many times one after another at the
local worker count (`--load` runs one busy burner per online core during each
run; `--fresh` runs the first repetition in a new worktree of `HEAD` after
its own `npm ci`), prints each run's exit status, seconds, load average
before and after, failing locations and kept directory, and exits 0 only
when every run passed.

## Measuring a run

To retain the selection and results of a strict run as JSON, name
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD`; the [proof record guide](proof-record.md)
says what the record holds and how to assess it with the command exit, and
`--list` records the selection alone. Each attempt's `durationMs` is the
test's own time: a worker fixture's publication, a serial file's `beforeAll`
and `afterAll`, and the time between tests are not in it, so a change to
shared setup shows in wall time and in the gaps between one test's end and
the next's start on the same worker, not in the summed durations. A measured
run omits `--reporter`: `--reporter=list` replaces the quiet reporter and
no record is written. Record the load average before and after, and compare
runs taken under different loads relatively. The separate shard timing artifact
adds each executed `beforeAll`/`afterAll` hook once to those test durations, so
allocation includes the serial files' shared setup and teardown without
counting per-test fixtures twice. [Dashboard shards](shards.md) describes the
early dispatch of serial production chains beside ordinary checks.

## No process outlives its run

Nothing a run starts survives it: not the servers, synthetic hosts and
request owners a test starts, nor the children the product starts for them,
such as detached Cursor runners and the production watcher's deployments.
Each worker ends what descends from it when it exits
(`support/processGroup.ts`). Whoever owns a machine HOME stops its Cursor
runner before removing it: `startDashboardServer` for a machine of its own,
`publishedMainFixture`'s `cleanup` for the production journeys, and a test
that passes its own `machine` calls `stopCursorRunner` itself. The run's own
teardown is the backstop: global setup gives the run an identity,
`OPEN_DOUGH_DASHBOARD_RUN_ID`, that every process of the run inherits, and
once the workers have exited the teardown ends every process still carrying
it and fails the run naming each (`support/globalSetup.ts`,
`support/runProcesses.ts`). A named process is a leak to stop where it
starts, never a reason to widen the sweep; processes of other runs, other
checkouts and this machine's own dashboard carry no such identity and are
left alone. `boundary/run-processes.spec.ts` proves each of the three, and
after a local run `pgrep -lf "$PWD"` from this checkout finds nothing of it.
