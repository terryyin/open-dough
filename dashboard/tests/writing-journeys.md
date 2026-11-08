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

Reuse windows, such as `checkReuseMs`, and launch waits run on server time
(`support/serverTimeControls.ts`). A journey setting `observationClock` moves
that clock past a window with `dashboard.advanceObservationClock`; one whose
answer depends on a launch wait ending sets `launchWaitEnd`, observes the kept
state that answer reports (record, held client or trust prompt), then calls
`dashboard.endLaunchWait` (`sessions/cursor-session-recovery-wait.spec.ts`).

### Authenticated-read backend clocks

For revision streams and revision-check timeouts, use the in-process HTTP
fixture and scope the controlled timers to the request. Observe the held
GitHub call before advancing its deadline. For a stream, observe the server
disconnect or the clean response end, then step the cadence and check that
the canceled timer fires no callback and GitHub receives no call. For a
cooldown, step the private request owner's clock and check the upstream call
count on each side of the advance. Keep process startup and teardown on real
timers.

## Commands, servers and shared preconditions

A command started with `dashboardCommand` (`support/dashboardCommand.ts`) is
stopped by signalling its group and waiting for its own exit, so the
production watcher finishes removing its deployment checkouts; a directly
spawned server is ended by `endGroup` (`support/processGroup.ts`), which
kills the group 5 seconds after its signal. Follow the repository's
[test automation rules](../../AGENTS.md#test-automation) for timeouts. An override
inside a test takes effect after fixture setup. The full-source fixture adds
its copy in one pack: copy, `git add` and first push take about 2 seconds alone
and 3 when four build it at once. The production journeys (`production-watcher*.spec.ts`)
build that fixture once per serial file in `beforeAll`. The lifecycle and
update files' hooks also start the real watcher, and their first tests observe
its first activation where they assert it, so those hooks hold only the
preparation and its development install. The failure file starts the watcher
in its first test and again in each test that follows a scenario ending it.
Each test steps the watcher to its next state and asserts the delta it observes
(`support/productionWatcher.ts`: reported activations, replacements and skips,
recorded builds, or successful Git reads recorded through fixture-local Trace2
events). Routine checks remain quiet; the tests never use a fixed wait.
A wait on a deployment step polls with `timeout: 0`, so the test timeout
alone bounds it, as it bounds any answer.
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

## Fluent phases in the Side panel content journeys

Three Side panel content journeys across two specs are written as phases over
fluent page objects. `sidePanelPages(page).phase(title, write)` in
`sidePanelPages.ts` builds the phase's page-object set and hands `write` its
Board, Side panel, Story review, Final report, Panel divider, perspective
choice, Intent, Terminal and Sessions sidebar objects. Each method writes one
named cue without touching the page and returns the object the reader
reaches next, taken from that set rather than constructed: a Story card's
`reviewChanges()` returns the phase's Story review, and the Story review's
`close()` returns the phase's Side panel. The phase then runs those cues in
order, each as its own `test.step` located at the spec line that wrote it,
and stops at the first failure. `support/cueSheet.ts` is the runner. Every
object extends the base in `fluentPageObject.ts`. `storyCardPages.ts`,
`sidePanelFramePages.ts`, `storyReviewPages.ts`, `finalReportPages.ts` and
`terminalPages.ts` own their parts' scoped locators, so a shared control
such as the Story card's `Review changes` has one locator; they import the
base at run time and name the set only with `import type`, and only
`sidePanelPages.ts` imports every class. A new hand-off is a method on the
object the reader leaves that returns `this.pages.<object>`; a new object is
a module of its own and a member of the set. A cue must not read a value it
needs later. Measured widths and rooms, review read counts, transport holds
(`holdReviewOf`), native attach evidence and kept records are read in the
spec between phases.

### What the pilot earned

Keep fluent phases in these three journeys. The strongest case is shared
controls across several content hand-offs, where one locator edit and named
cues make the journeys easier to maintain and diagnose. This is an exploratory
comparison of the recorded procedural baseline, original pilot and landed
revision. [ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md),
[original pilot evaluation](https://github.com/terryyin/open-dough/blob/e0d4735e14ff40c64151d878d504af9aeab1515c/.planning/slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md#pilot-evaluation),
[revised evaluation](https://github.com/terryyin/open-dough/blob/5217098d1bd32ad7f317d3f995a4f6807fd821b4/.planning/slice-plans/516-adjust-fluent-side-panel-page-objects/PLAN.md#revised-design-evaluation).

| Journey | What the fluent spec makes visible | Revised list run |
| --- | --- | --- |
| [Story review and Final report replacement](navigation/side-panel-content-replacement.spec.ts#L66) | Phases show that the held response cannot overwrite the other story's review, that reviews and reports replace each other, and that the Panel divider works by mouse and keyboard. | Passed, 5.3 s |
| [Story review and Final report retention](navigation/side-panel-content-replacement.spec.ts#L182) | The review keeps its chosen file and diff across Board and Intent, and the Final report keeps its session's text. The request log between phases shows Intent's separate comparison. | Passed, 4.1 s |
| [Story review and Terminal replacement](navigation/side-panel-content-switching.spec.ts#L40) | The phases follow the swaps beside a usable Board. The native attach count and kept record between phases show reattachment to the same session. | Passed, 4.4 s |

The [procedural runs](https://github.com/terryyin/open-dough/blob/e0d4735e14ff40c64151d878d504af9aeab1515c/.planning/slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md#decisive-premises)
passed all three cases. The original pilot replaced 5
procedural steps with 13 phases across the replacement spec and 6 with 12 in
the switching spec, where raw `expect` calls fell from 74 to 7, all at native,
record or request boundaries. Spec lengths went from 248 and 236 lines to
250 and 239 and stayed there in the revision. The names and order of the
revised phase and cue tree matched the original pilot after masking the
per-run Terminal session ID in the JSON output. Individual journeys took
3.9–4.8 s in the procedural run and 4.2–4.7 s in the original pilot. Treat
these samples and the revised times above as run context.

The original rename experiment changed the Story card's `Review changes`
label and passed with one pilot locator edit versus three procedural edit
sites. Restoring the old locator while keeping the new label caused the
expected failure. A source check in the revised pilot still found a single
owner in `StoryCard`. The original evaluation found 40 uses in 28 test files
outside the pilot, so the measured edit saving is local to these specs.

In the revised controlled failure, the reporter named the test, phase and
cue, with expected `Story Z` and received `Story A`. Later cues and phases
stopped. The code frame still pointed into `storyReviewPages.ts`, so use the
cue title or trace to find the spec call. The replacement spec passed after
the expected value was restored.

The original navigation between the Side panel and its contents kept them in
one module and left the contents without a route to the Board or Terminal.
The phase's object set lets them live in separate modules. The largest
page-object module fell from 246 to 173 lines, while the runner and page
objects grew from 709 to 761 lines. The growth comes from module headers
and imports, two set members, and named methods that make the expectation
explicit at nine formerly boolean call sites in the switching spec. A scratch
hand-off from the Final report to the Board passed type-check and both
replacement cases with five helper lines and two spec lines. That one
reverted change shows the cost of adding one route through the set.

Stop with these three journeys. Reopen the question when an existing
procedural journey has a documented shared-control edit across specs or
recurring content hand-offs that are hard to follow. Use that journey's
current edit sites, step trace and failure output as the baseline for a
separate trial, weighing any gain against the helper code it adds. Trials
and conversions are follow-up work. The developer decides wider adoption.

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
