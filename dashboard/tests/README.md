# Dashboard tests

Run `npm run test:dashboard` from the repository root. One Playwright run and
shard selection covers integrated browser journeys, **Dashboard Frontend Test**
(`../frontend-tests/`) and **Dashboard Backend Test** (`../backend-tests/`).
See [journey writing](writing-journeys.md) for waits, clocks, commands and fake
GitHub answers; [native-host fixtures](native-host-fixtures.md) for synthetic
hosts; the per-run [proof record](proof-record.md), the caller-owned
transcript CI's proof fragments are written from; and
[CI shards](shards.md) for allocation, recorded times and deadlines.

See [local resource use](../../tests/local-test-resources.md) for admission
across worktrees, worker settings, cleanup and machine sleep on macOS.

## Three roots: integrated journeys, frontend-only, and boundary tests

A **browser journey** proves one representative, integrated user journey in
the real page: an observable precondition, the user's trigger, and the state
change it causes. Journeys live in the ten [feature folders](feature-groups.md) and run under
`dashboardTest.ts` or a fixture module built on it, each against its own
built-preview server, which the `page` fixture opens.

A **frontend-only test** proves DOM geometry or UI recovery, formatting,
polling, or refusal feedback against synthetic backend answers. Those specs live
in `../frontend-tests/` (**Dashboard Frontend Test**), import `pageTest.ts` or
`support/frontendApp.ts`, and never start `dashboardServer`, fake hosts, or
`FakeGitHub`. See [frontend-tests README](../frontend-tests/README.md).

A **boundary test** proves the detailed variants, failure cases and contract
details of one behavior at a stable public boundary of the dashboard server
-- its HTTP endpoints, WebSocket upgrades, the files it keeps under HOME, the
commands it installs -- or of a module read in-process, without a browser.
Its collaborators are the real ones; only the external boundaries are
replaced: GitHub through the synthetic `gh`, the agent hosts through the
synthetic `claude`, `codex` and `cursor`, and GitHub's avatar host. Boundary
tests live in the sibling `../backend-tests/` and normally use `startDashboardServer({ mode:
"boundary" })` or `test.use({ serverMode: "boundary" })` on `dashboardTest.ts`.
`node <run-bundle>/boundaryServer.mjs` mounts Vite's local boundaries
(`../server/localBoundaries.ts`) on plain HTTP without Vite or a build. It uses
the preview's production project environment, or the dev server's through
`developmentBoundary` (`support/dashboardServer.ts`).
`../backend-tests/runtime/boundary-server.spec.ts` shows each environment's own project file
(`support/projectConfiguration.ts`) without Vite or a page.
Boundary and preview use the run's bundled `runnerMain.mjs`; dev and public
production keep source. `../backend-tests/runtime/serving-modes.spec.ts` proves both real Vite
servers mount the same boundaries and use those entries.

`../backend-tests/` holds every spec that opens no page, whatever it drives; a
frontend-only page spec belongs in `../frontend-tests/`; an integrated page
journey belongs here. All three roots are one suite, run and sharded together
(below).

## Where a check goes

Put a check where it is cheapest to prove, and prove it once:

- **A variant of how the server answers** -- a refusal, a failure case, a
  contract detail, a file the server keeps -- is a boundary test. A journey
  shows that the page does the thing once; the boundary tests own every
  variant.
- **A journey runs under the fixture's built preview.** The dev server and
  the preview mount the same local boundaries, and `../backend-tests/runtime/serving-modes.spec.ts`
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
  state change is observed at that width (`navigation/dashboard-header.spec.ts` and
  `navigation/dashboard-header-compact.spec.ts` run one journey per container branch of
  `banner.css`; `navigation/side-panel-width*.spec.ts`
  prove the panel's query from each side once), and a font case only where
  a font reproduces a wrap. A presentation-only check, one with no state
  change of its own, joins the journey whose state change shows it or moves
  down a tier to the cheapest proof of the rule; a matrix of widths or fonts
  over one static layout is not written. **Touch journeys use one device**
  unless the other reaches an asserted CSS branch or arrangement the first
  does not (for example `story-review-touch` keeps tablet portrait for the
  side-by-side review body); phone portrait plus in-test rotation already
  crosses the shared width and ≤480 px height branches.

- **Siblings share read-only preconditions and assert deltas.** Publish inputs
  no test writes once per worker (`launchJourney`'s origin); use one fixture per
  serial file for state tests step through (`production-watcher*.spec.ts`'s watcher).
  [Journey writing](writing-journeys.md) explains both. Assert the common shape
  once (`launches/agent-launch-story-card.spec.ts`, "every Backlog card offers Start
  execution ..."); siblings assert differences so a regression fails one named
  test. Servers and fake GitHub stay per test: siblings vary `projectFolders`,
  `launchTimeoutMs`, viewport and usually launch or mark done.

An installed start names the MakeMe repository description its origin starts
with, at the `startOrigin` call or in its origin fixture's option, which a spec
overrides with `test.use`; with none, the origin holds an empty valid backlog.
The harness adds `.gitignore` and the installed skills to the description's
first commit. The runner packs the default and the shared queued description
once per requested layout, Claude or Codex/Cursor, from current working-tree
skills (`support/startOriginPreparation.ts`). A description sharing their
first revision starts from that origin, its checkout pushing the later ones;
another is materialized privately on that installation, once per process.
Tests clone private copies with independent objects, refs, config, indexes and
HOME. Nested configurations can inherit the outer runner's artifacts. Without
an owner, a start prepares only its layout and removes that preparation after
initialization. An explicit prepared-origin fixture path takes precedence.

## Synchronization

Follow the repository's [test automation rules](../../AGENTS.md#test-automation).
A wait ends on an observed event: a shown fact, a recorded state, an
answered request, a held request reaching its handler, a watcher's own
output line. To check that nothing happens within a window, advance a
controlled clock and inspect the resulting state or request log. A check's
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

Preview and boundary request one Vite config, boundary server and Cursor
runner bundle under `node_modules`, with source-relative `import.meta` paths.
Dev serves source. Static frontend and shared preview request the same
app build. Requests share the completed result or producer error. Teardown
settles in-flight preparations and removes the run's own directories,
leaving other runs and `dashboard/dist` alone.
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
naming that. The machine-local Cursor runner stays real by default; the
stand-in opt-in for proofs that omit Cursor operations is in
[native-host fixtures](native-host-fixtures.md#cursor-runner-stand-in). Every
server binds a port the operating system chooses, so the suite can run
beside another checkout's suite on the same machine, and a server that
cannot start fails its test with its own output
(`support/dashboardServer.ts`). Test support takes the repository root from
`support/repositoryRoot.ts`, never the working directory (lint refuses
`process.cwd()` in test code), so
`--config <repository>/dashboard/playwright.config.ts` gives the same result
from anywhere.

The configuration sets `NODE_DISABLE_COMPILE_CACHE=1` before global setup and
workers start so builds, servers and deployment descendants inherit it and add
no persistent compile cache after failure; the calling Node/npm process and
commands outside the suite keep their own policy.
`../backend-tests/runtime/compile-cache.spec.ts` proves enable/import/flush,
seeded-hash preservation, and outside-policy writes (API probe skipped when
unsupported).

## Adding a test

Use [MakeMe](../../tests/README.md#test-data-architecture) for domain data across
all three dashboard test roots. Keep dashboard harness fixtures in this tree.

A **boundary test** goes in `../backend-tests/<feature>/<behavior>.spec.ts`
under one [backend feature group](feature-groups.md#backend-feature-groups). It
imports `test` from `../tests/dashboardTest.ts` with `test.use({ serverMode:
"boundary" })`, or from `../tests/support/pageTest.ts` and starts
`startDashboardServer({ mode: "boundary" })` (or `developmentBoundary`) itself;
it sends its requests with `support/rawHttp.ts` or the terminal clients and
asserts the answer, the file or command. Only
`../backend-tests/runtime/serving-modes.spec.ts` needs a build. A spec starting
no server still takes `test` from `pageTest.ts`, as lint requires.

A **browser journey** goes in `<feature>/<journey>.spec.ts`, with exactly one
[feature owner](feature-groups.md). It imports `test` from `../dashboardTest.ts`
or its family fixture (`../responsiveStart.ts`, `../support/preparationPage.ts`,
`../support/voiceTest.ts`, `../support/codexLaunch.ts`), takes `page`, `dashboard`
and `github` (and `launchJourney` for the Taken backlog), opens with
`openUntilRead(page)`, acts as the user, and asserts the state change; a
sibling of an existing journey joins that file and asserts its delta. A
worker-scoped fixture, or a `launchOptions` value, is declared once, in
`support/pageTest.ts`, whose header says why a second home splits the
workers.
A fixture module declares its option defaults on its fixtures (overrides in
its `test.extend`), not with a module-level `test.use`: a module is evaluated
once per worker, so such a call applies only to the first spec file that
loads it there.

Discovery and sharding follow the file: `support/testFiles.mjs` finds every
`*.spec.ts` under `dashboard/tests/` and `dashboard/backend-tests/` recursively and CI's split ([dashboard
shards](shards.md)) deals whole files by the seconds `../longest-first` records
for them, so a new file needs no registration; unrecorded there, it is dealt
after the recorded files at their median duration until that list is next
refreshed from a hosted run, and the preview in [dashboard shards](shards.md)
shows where it lands before a push.
`tests/support/dashboard-test-files.test.mjs` protects discovery of new specs
and their assignment to exactly one shard.

## Running the suite

Run from the repository root; `npm run test:dashboard -- tests/intent/`,
`npm run test:dashboard -- backend-tests/` or
`-- --grep 'published Board'` selects files or tests, and `npx playwright
test` from `tests/` finds no configuration, so it would run without the
build, the quiet reporter and the run's identity. Local runs default to two
workers, CI runs every core.

CI runs the suite as shard jobs, each running the whole spec files
`OPEN_DOUGH_DASHBOARD_SPLIT=i/n` deals it by recorded duration, keeping its
spec files' seconds through
`OPEN_DOUGH_DASHBOARD_TIMES` as artifact `dashboard-times-<shard>`, the source
`dashboard/longest-first` is refreshed from, and running under
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

## Measuring and process cleanup

Retain a strict JSON selection with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD`; see
[proof record](proof-record.md). Pass no `--reporter`. Worker and run process
ownership is in [process cleanup](writing-journeys.md#process-cleanup).
