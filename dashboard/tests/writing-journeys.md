# Writing a browser journey

How a journey of the dashboard suite waits, keeps time, and ends what it
starts. The [README](README.md) owns the strategy: which tier a check
belongs to, what is real and what is replaced, and how the suite runs and is
measured; this guide holds the rules a journey's own code follows. The
[native-host fixture guide](native-host-fixtures.md) describes the synthetic
hosts a launch, listing or terminal journey drives.

## A check's bound starts after the answer it depends on

The [README](README.md#synchronization) states the rule; the test timeout
stays the only bound on the answer itself. Every page a test's context opens
notes its own requests from before its scripts run (`pageRequestNoting.ts`,
installed by `support/pageTest.ts`), and the waits in `pageRequestNotes.ts`
end on those notes:

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
- A window resize is followed by the page's own rearrangement: the
  side-panel journeys resize with `resizeUntilArranged`
  (`sidePanelWidthPage.ts`), which waits for the "Panel divider" separator of
  the new width, before measuring or touching anything.

Every answer of the local read boundary carries a `Server-Timing` header
(`../server/readTiming.ts`): `admission` (waiting for a turn at GitHub), `gh`
(spawn to answer, with the number of calls), `rest`, and `total`, in whole
milliseconds. A failing run's kept `trace.zip` holds it in the `*.network`
records of each `/__authenticated-read` answer, which shows where a slow
read spent its time; the browser's time beyond `total` was spent outside the
handler. To record traces of a passing run, add `--trace on --reporter=dot`.
The run's global setup (`support/globalSetup.ts`) runs the synthetic `gh`,
`claude`, and `terminal-notifier` once before any worker starts, because macOS
assesses a new executable on its first run and a fresh checkout's first
reads would otherwise wait on it.

## Time the product waits is stepped, not waited out

The automatic-freshness journeys (`auto-refresh*.spec.ts`) pause the
page's clock and step it with the helpers in `autoRefreshJourney.ts`, so
the 15-second pace, the 30-second target, hidden-page pauses, and a rate
limit's directed wait are observed in page time; they read the fake GitHub's
`gh` call log to prove what was and was not asked. A journey that watches a
session's state pace pauses the clock the same way
(`pausePageClockAt` in `dashboardTest.ts`) and passes each read with
`watchRecordReads(page).passOnePace` (`sessionStatePace.ts`), instead of waiting
the pace out. Under a paused clock the terminal draws only as page time passes,
so a journey reading terminal text lets whole paces pass with `passOnePace`:
any partial step moves the next read off its pace. Assert that no `gh` call
was made only after real network turns (`checksAskedWhilePassing`, or
`expect.poll`), and give each scenario its own revisions: the boundary answers
a repeated pinned revision from memory without calling `gh`.

A server's shared-observation reuse window, such as the revision-check
listing's `checkReuseMs`, runs on the server's clock, not the page's. A
journey that sets `observationClock` with `test.use` moves that clock past the
window with `dashboard.advanceObservationClock` instead of waiting it out
(`observation/shared-observer-check-reuse.spec.ts`).

## Commands, servers and shared preconditions

A command started with `dashboardCommand` (`support/dashboardCommand.ts`) is
stopped by signalling its group and waiting for its own exit, so the
production watcher finishes removing its deployment checkouts; a directly
spawned server is ended by `endGroup` (`support/processGroup.ts`), which
kills the group 5 seconds after its signal. Follow the repository's
[test automation rules](../../AGENTS.md#test-automation) for timeouts. An override
inside a test takes effect after fixture setup. The full-source fixture's copy
and `git add` take about 2 seconds alone and 13 to 20 when eight workers build it
at once. The production journeys (`production-watcher*.spec.ts`) build that
fixture and start the real watcher once per serial file in `beforeAll`. Each
test steps the shared watcher to its next state and asserts the delta it observes
(`support/productionWatcher.ts`: reported activations, replacements and skips,
recorded builds, or successful Git reads recorded through fixture-local Trace2
events). Routine checks remain quiet; the tests never use a fixed wait.
`afterAll` stops the watcher and cleans the fixture up.
In a serial file a failing test skips the file's later tests, and a test
that ends the watcher hands the next one a restart at current main. A
precondition that every test only reads is shared wider: the launch
journeys' published origin (`launchJourney.ts`) is the worker-scoped
`launchJourney` fixture of `support/pageTest.ts`, published once per worker
rather than in a `beforeAll`, which `fullyParallel` runs once per worker per
file.

Every process a test starts that can run `gh` asks it through a GitHub
request owner of that test's own: `startDashboardServer` and
`publishedMainFixture` give one, and a test wiring `gh` itself takes
`installFakeGh`, `fakeGhEnv` and `endFakeGh` (`support/fakeGh.ts`). The run's
global setup gives every process a request owner root that admits no owner,
so a process given none of those is answered by no owner — another test's or
this machine's real one included — and the run then fails at its end with
`A test asked GitHub without a request owner of its own`.

## What the fake GitHub answers by itself

A path's published history (`pathHistoryAnswers.ts`) lists as many commits as
a commit list asks for (`per_page`). A published agent profile no history or
commit time names was added once, by a commit of its own, so every journey's
Taken and Preparing cards credit a human without a failed read; a fixture that
wants a missing addition or an unpublished history says so. Which commit added
a profile is walked at the boundary
(`../backend-tests/observation/authenticated-read-profile-addition.spec.ts`, its refusals in
`../backend-tests/observation/authenticated-read-profile-addition-refusal.spec.ts`); the credited human and avatar
on cards and the roster are `stories/agent-roster-avatar.spec.ts`; how a slow or
stalled addition read delays only its own profile's clock and human is
`observation/profile-addition-latency.spec.ts`; the roster itself is
`stories/agent-roster.spec.ts`, whose locators live in `dashboardPage.ts`.

## Process cleanup

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
left alone. `../backend-tests/observation/run-processes.spec.ts` proves each of the three, and
after a local run `pgrep -lf "$PWD"` from this checkout finds nothing of it.
