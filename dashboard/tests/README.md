# Dashboard tests

This directory holds the dashboard's one Playwright suite, run with
`npm run test:dashboard`, in two tiers.

## Two tiers: browser journeys and boundary tests

A **browser journey** proves one representative, integrated user journey in
the real page: an observable precondition, the user's trigger, and the state
change it causes. Journeys live directly in this directory and run under
`dashboardTest.ts` or a fixture module built on it, each against its own
built-preview server.

A **boundary test** proves the detailed variants, failure cases and contract
details of one behavior at a stable public boundary of the dashboard server
-- its HTTP endpoints, WebSocket upgrades, the files it keeps under HOME, the
commands it installs -- without a browser. Its collaborators are the real
ones; only the external boundaries are replaced: GitHub through the synthetic
`gh`, the agent hosts through the synthetic `claude`, `codex` and `cursor`,
and GitHub's avatar host. Boundary tests live in `boundary/` and start the
boundary server, with `startDashboardServer({ mode: "boundary" })` or
`test.use({ serverMode: "boundary" })` on the `dashboardTest.ts` fixtures:
`node --experimental-transform-types ../server/boundaryServer.ts`, the local
boundaries Vite mounts (`../server/localBoundaries.ts`) on a plain HTTP
server, with no Vite and no build. That server runs in the production
project environment, as the built preview does, unless the spec starts
`developmentBoundary` (`support/dashboardServer.ts`), the dev server's
environment; a spec that moved off a dev server keeps its environment that
way, and `boundary/boundary-server.spec.ts` shows each environment answering
from its own project file (`support/projectConfiguration.ts` names it). A boundary spec never opens a page; the same spec keeps
that server the Node entry alone, naming no Vite and serving no page.

Put a check where it is cheapest to prove: a journey shows that the page does
the thing once; the boundary tests own every variant of how the server
answers. Both tiers are one suite, run and sharded together (below). Today
`boundary/` holds every browserless spec: the `agent-completion-*`,
`agent-launch-*`, `agent-terminal-*` and `cursor-*` specs that drive the
launch boundary, its WebSocket terminal attachments and the Cursor runner
over HTTP, every browserless `authenticated-*` read spec, and the browserless
project, landing, proof-record, launch-record and pure-reading specs.

Common behavior is proved once. The dev server and the built preview mount
the same local boundaries, and `serving-modes.spec.ts` is the one spec that
proves it: it starts a real server of each, sends each boundary the same
request from both, and compares the answers (status, headers, body), with
Vite's own HMR socket, which only the dev server has, shown working beside
the terminal upgrade guard. No other spec repeats its tests under both
servers; a journey runs under the fixture's preview, and a journey about the
development project environment starts a dev server for that fact alone:
`project-add`'s and `project-configuration`'s empty development first start,
`project-remove`'s removal of development's last project, the machine file
`system-settings-openai` and `system-settings-terminal-theme` share across
both environments, and `frame-overview-look`'s frame with no project
configured, a state only development starts in.

Test support takes the repository root from
`support/repositoryRoot.ts`, not the working directory, so
`npx playwright test` from `dashboard/`, or with `--config
<repository>/dashboard/playwright.config.ts` from anywhere, gives the same
result; lint refuses a `process.cwd()` call in test code. Every run builds the
app once, into its own temporary directory that it removes at the end, so two
runs from one checkout never rebuild each other's assets and the production
build in `dashboard/dist` is left alone; each page journey
(`dashboardTest.ts`) then serves that build from its own preview server with
a synthetic `gh` on its PATH (`fixtures/fake-gh`)
that answers from the test's own fake GitHub (`support/fakeGitHub.ts`,
published through `publishedOrigin.ts` or
`committedOrigin.ts`), which can also fail, hold, or rate-limit an
answer. The same fake stands in for GitHub's avatar host, from which the
server fetches credited humans' avatars (`avatarAnswers.ts`). Only GitHub's
answers are replaced; the
local read boundary, the `gh` invocation, reading, the shared backlog
interpretation, and the page are the real ones, and a browser request to
GitHub itself fails the test. The read boundary's own specs
(`boundary/authenticated-read-*.spec.ts`, `boundary/authenticated-avatar.spec.ts`)
start the boundary server; `authenticated-project-overview.spec.ts` and the
other page journeys start their own built-preview servers. Every server
binds a port the operating system
chooses, so the suite can run beside another checkout's suite on the same
machine, and a server that cannot start fails its test with its own output
(`support/dashboardServer.ts`). Nothing here ever calls the real `gh` CLI or
contacts GitHub. Select one journey with, for example,
`npm run test:dashboard -- --grep 'published overview'` or
`npm run test:dashboard -- --grep 'authenticated project overview'`.

The shared Playwright configuration sets `NODE_DISABLE_COMPILE_CACHE=1`
before global setup and workers start. Builds, dev/preview servers and fresh
deployment descendants inherit it, including when `NODE_COMPILE_CACHE` names
an existing cache. They leave those entries intact and add no persistent
compile cache to reclaim after failure or interruption. The calling Node/npm
process can still cache its own startup before the configuration loads;
ordinary dashboard commands outside the suite keep their existing policy.
`boundary/compile-cache.spec.ts` makes real enable/import/flush attempts, preserves
seeded cache hashes through repetition, overlap, failure and signals, and
checks an outside-policy child really can write cache. Only that API probe is
skipped on supported Node versions without the compile-cache API. Process and
other fixture cleanup retains its existing contract, including the hard-kill
limitation described below.

The [native-host fixture guide](native-host-fixtures.md) describes the synthetic
Claude, Codex and Cursor hosts, their environment observations, and the launch,
listing and terminal journeys that consume them.

CI sets `OPEN_DOUGH_DASHBOARD_SPLIT=i/n` to select share `i` of `n` whole
spec files. `longest-first` orders known files by recorded hosted duration;
unlisted specs follow sorted, and that order is dealt round-robin across
shares. CI currently uses twelve shares and runs the dashboard type-check once
in the last share, whose recorded browser load is smallest. Stale and repeated
list entries are ignored. With the variable unset,
`npm run test:dashboard` keeps running the whole suite. The partition check
in `tests/support/dashboard-test-files.test.mjs` protects discovery of new specs
and assignment without duplicates or omissions.

Independent proof subprocesses choose their own selection. Their harness
(`support/proofRecordRun.ts`) removes the inherited
`OPEN_DOUGH_DASHBOARD_SPLIT` before launching them.

CI also records `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`, the epoch 320 seconds after
the shard job starts, and the config turns what remains of it into Playwright's
`globalTimeout` (`support/suiteDeadline.mjs`). The build counts against it. A
shard that cannot finish by then fails naming the deadline (`Timed out
waiting`), still within the job's 6 minutes, and its kept report holds the
completed failures' traces and error context and lists unfinished tests as
skipped. Local runs without the variable are unbounded. Like the shell
suite's `tests/time-budget`, the 320 seconds and the job's `timeout-minutes`
are a reviewed ceiling: a shard that reaches the deadline is made faster or
rebalanced, not given more time.

A passing run prints nothing (`support/quietReporter.ts`) and leaves no
output directory. A failing
spec is shown with its error, output, and retained trace; a passing spec that
writes output, or output from the run itself such as global setup, fails the
run and is shown. Keep specs and their helpers silent. A failed run keeps what
it showed, as `report.txt`, beside its traces and other retained files in
`dashboard/test-results/<start time>/`, and its last line, `Kept: <directory>`,
names that directory. A later run never removes an earlier run's directory;
remove kept runs yourself once read.

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

To retain the selection and results of the same strict run as JSON, name
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD`; the [proof record guide](proof-record.md)
says what the record holds and how to assess it with the command exit.

A dashboard failure on unchanged code is a defect to find and fix, never a
reason to rerun until green; the suite keeps `retries: 0`. Repeat the run and
read the kept evidence:

```sh
bash scripts/dashboard-repeat.sh 3 --load agent-terminal
```

`scripts/dashboard-repeat.sh <repetitions> [--load] [--fresh] [spec…]` runs
the suite (or the named specs) that many times, one after another, at the
local worker count. `--load` runs one busy burner per online core during each
run; `--fresh` runs the first repetition in a new worktree of `HEAD` after its
own `npm ci`. For each run it prints the exit status, seconds, load average
before and after, each failing location, and the kept directory, and it exits
0 only when every run passed. A run under other load can still fail where an
idle one passes; such a failure is a defect of the same kind.

A check's bound starts after the answer it depends on. An `expect` waits 5
seconds, and under load GitHub's answer, a `gh` start, or a server's own work
can take longer, so a journey first waits in the page for the request to be
answered or to fail, and only then checks what the page shows; the test
timeout stays the only bound on the answer itself. Every page a test's
context opens notes its own requests from before its scripts run
(`pageRequestNoting.ts`, installed by `support/pageTest.ts`), and the waits
in `pageRequestNotes.ts` end on those notes:

- After `page.goto` or `page.reload()`, open with `openUntilRead(page)` or
  `reloadUntilRead(page)` when the next step checks something the page
  read. They wait until the project list and the published-work read are
  answered (`untilPublishedWorkRead`). `expectMembership`,
  `expectSettledPage`, `expectProblemAndNoSnapshot` (`dashboardPage.ts`) and
  `expectNoSidewaysScrollAndWholeText` (`pageLayout.ts`) wait the same way
  themselves, so a journey whose first check is one of them opens plainly.
  A journey that holds the published-work read on purpose also opens
  plainly and waits on what it holds.
- `expectSettledPage` checks "Reading preparation…" is gone only after every
  read the page sent is answered (`untilPageReadsAnswered`); a spec checking
  another reading label does so after it. A label still shown then is a
  rendering fact to investigate, never a reason for a longer bound.
- When the page says a read failed for good ("Reload the page to read
  again."), `expectMembership` and `expectSettledPage` compare once and fail
  at once, naming what they expected.
- Mark as done is pressed through `markDone` or `markDoneAnyway`
  (`support/markDone.ts`), which wait for the mark's answer
  (`untilDoneMarkAnswered`); a journey holding that answer presses with
  `sendDoneMarkAnyway`. Give another page action the same kind of wait when
  a check on its result proves to outrun its answer.
- A page a spec makes with `browser.newPage()` or its own context notes
  nothing unless the spec installs the noting (`noteRequestsInEveryPage`);
  the waits return at once on such a page.

A command started with `dashboardCommand` (`support/dashboardCommand.ts`) is
stopped by signalling its group and waiting for its own exit, so the
production watcher finishes removing its deployment checkouts; a directly
spawned server is ended by `endGroup` (`support/processGroup.ts`), which
kills the group 5 seconds after its signal. A test that builds the
full-source fixture (`publishedMainFixture(true)`) declares its own
`test.setTimeout`: the copy and `git add` take about 2 seconds alone and 13
to 20 when eight workers build it at once. The production journeys
(`production-watcher*.spec.ts`) build that fixture and start the real
watcher once per file, in `beforeAll` of a serial file, and each test steps
the shared watcher to its next state and asserts the delta it observes in
the watcher's own output (`support/productionWatcher.ts`: an activation or
replacement, a settled skip, a check after an activation, recorded builds), never a fixed
wait; `afterAll` stops the watcher and cleans the fixture up. A precondition
that every test only reads is shared wider: the launch journeys' published
origin (`launchJourney.ts`) is the worker-scoped `launchJourney` fixture of
`dashboardTest.ts`, published once per worker rather than in a `beforeAll`,
which `fullyParallel` runs once per worker per file.

Every process a test starts that can run `gh` asks it through a GitHub
request owner of that test's own: `startDashboardServer` and
`publishedMainFixture` give one, and a test wiring `gh` itself takes
`installFakeGh`, `fakeGhEnv` and `endFakeGh` (`support/fakeGh.ts`). The run's
global setup gives every process a request owner root that admits no owner,
so a process given none of those is answered by no owner — another test's or
this machine's real one included — and the run then fails at its end with
`A test asked GitHub without a request owner of its own`.

Every answer of the local read boundary carries a `Server-Timing` header
(`../server/readTiming.ts`): `admission` (waiting for a turn at GitHub), `gh`
(spawn to answer, with the number of calls), `rest`, and `total`, in whole
milliseconds. A failing run's kept `trace.zip` holds it in the `*.network`
records of each `/__authenticated-read` answer, which shows where a slow
read spent its time; the browser's time beyond `total` was spent outside the
handler. To record traces of a passing run, add `--trace on --reporter=dot`.
The run's global setup (`support/globalSetup.ts`) runs the synthetic `gh`,
`claude`, and `osascript` once before any worker starts, because macOS
assesses a new executable on its first run and a fresh checkout's first
reads would otherwise wait on it.

The automatic-freshness journeys (`auto-refresh*.spec.ts`) pause the
page's clock and step it with the helpers in `autoRefreshJourney.ts`, so
the 15-second pace, the 30-second target, hidden-page pauses, and a rate
limit's directed wait are observed in page time; they read the fake GitHub's
`gh` call log to prove what was and was not asked. Assert that no `gh` call
was made only after real network turns (`checksAskedWhilePassing`, or
`expect.poll`), and give each scenario its own revisions: the boundary answers
a repeated pinned revision from memory without calling `gh`.

A path's published history (`pathHistoryAnswers.ts`) lists as many commits as
a commit list asks for (`per_page`). A published agent profile no history or
commit time names was added once, by a commit of its own, so every journey's
Taken and Preparing cards credit a human without a failed read; a fixture that
wants a missing addition or an unpublished history says so. Which commit added
a profile is walked at the boundary
(`boundary/authenticated-read-profile-addition.spec.ts`, its refusals in
`boundary/authenticated-read-profile-addition-refusal.spec.ts`); the credited human and avatar
on cards and the roster are `agent-roster-avatar.spec.ts`; how a slow or
stalled addition read delays only its own profile's clock and human is
`profile-addition-latency.spec.ts`; the roster itself is
`agent-roster.spec.ts`, whose locators live in `dashboardPage.ts`.
