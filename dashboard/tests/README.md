# Dashboard browser tests

This directory holds the dashboard's one Playwright suite, run with
`npm run test:dashboard`. Test support takes the repository root from
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
GitHub itself fails the test. The boundary specs
(`authenticated-read-*.spec.ts`, `authenticated-avatar.spec.ts`) and
`authenticated-project-overview.spec.ts` also start their own dev and
built-preview servers. Every server binds a port the operating system
chooses, so the suite can run beside another checkout's suite on the same
machine, and a server that cannot start fails its test with its own output
(`support/dashboardServer.ts`). Nothing here ever calls the real `gh` CLI or
contacts GitHub. Select one journey with, for example,
`npm run test:dashboard -- --grep 'published overview'` or
`npm run test:dashboard -- --grep 'authenticated project overview'`.

The launch boundary specs (`agent-launch-boundary.spec.ts`,
`agent-launch-refusal.spec.ts`, `agent-launch-records.spec.ts`, and
`agent-launch-session-listing.spec.ts`) and the page journeys
(`agent-launch-card.spec.ts`, `agent-launch-card-problems.spec.ts`,
`agent-launch-card-sessions.spec.ts`, `agent-launch-card-session-states.spec.ts`,
`agent-launch-recent-sessions.spec.ts`,
`agent-launch-session-state-pace.spec.ts`,
`agent-launch-attention-clearing.spec.ts`,
`agent-launch-attention.spec.ts`, `session-sidebar.spec.ts`,
`session-sidebar-reading.spec.ts`, `session-sidebar-row.spec.ts`, `session-sidebar-stays-as-left.spec.ts`,
`session-sidebar-keyboard.spec.ts`, `session-sidebar-navigation.spec.ts`,
and `session-sidebar-navigation-cases.spec.ts`, which name
their folders and launch wait through the `projectFolders` and `launchTimeoutMs` options of
`dashboardTest.ts`) drive a synthetic `claude`
(`fixtures/fake-claude`, `support/fakeClaude.ts`) that every server puts first
on its PATH, in a temporary HOME holding only the project folders a test
chooses; a spec that restarts servers on the same machine state passes a
`machine` directory it owns. A per-server scenario (`claudeScenario`) decides
whether it launches, refuses, finds the folder untrusted, hangs, or reports a
session its listing does not show. It lists what it launched as
`claude agents --json --all` does; `claudeSessionBecomes` lists a session
as Claude Code does when it is working busy (`working`) or idle between steps
(`working-idle`), blocked on the developer (`blocked`, with a `waitingFor`
reason when the test gives one), done with its process running (`done-live`)
or exited (`done-exited`), `failed`, or `stopped`, replacing its whole state,
status, and reason, or forgets it (`forgotten`), and `claudeListingFails`
makes the listing fail. It records every call's argv and working directory
(`claudeCalls`, or `claudeLaunchCalls` for the `--bg` launches alone), and
the part of the environment it started with that the launch environment rule
reads (`fixtures/fake-host-environment.cjs`): `NODE_ENV`, `PATH`, every
`npm_*` key, `INIT_CWD`, the spec marker `DOUGH_SPEC_PASSTHROUGH`, and its
`FAKE_CLAUDE_DIR` wiring (`claudeLaunchEnvironments`, and
`claudeAttachEnvironments` for each attach); `support/launchEnvironment.ts`
starts a server as a deployment's `npm run` start does and checks that record.
The synthetic `codex` (`fixtures/fake-codex`, `support/fakeCodex.ts`) records
the same keys, with its `FAKE_CODEX_SOCKET` and `FAKE_CODEX_TERMINAL_ROOT`
wiring, for each invocation in its own log named by `FAKE_CODEX_ENV_LOG`
(`codexEnvironments` in `support/codexObservation.ts`, for the daemon start or
`resume`), so its daemon-start log (`daemonStarts`) keeps only the working
directory. The synthetic `cursor-agent` (`fixtures/fake-cursor`,
`support/fakeCursor.ts`) records the same keys, with its `FAKE_CURSOR_LOG` and
`FAKE_CURSOR_ATTACH_DIR` wiring, as `env` on each launch and attach record
(`calls`, `attaches`); `cursor-runner-environment.spec.ts` starts a Cursor
runner with the start-up additions itself, as an earlier deployment did. The fake `claude stop <id>` lists that session stopped. Run as `claude attach` in the
terminal boundary's pseudo-terminal, it echoes each line entered, clears the
line on Ctrl+U, renames its listed session on `/rename <name>`, reports its
size, detaches on Ctrl+Z, and records its pid, its lines, and what ended it
(`claudeAttaches`); `claudeAttachesSilent` makes it print nothing.
`claudeAttachPromptDelay(ms)` delays the bordered composer after the banner;
keys before the prompt are discarded. The
terminal boundary specs drive it over a raw socket
(`agent-terminal-boundary.spec.ts`; `agent-terminal-close.spec.ts` for the
server's close hook; `agent-terminal-reopen.spec.ts` for reopening a session
marked done; `agent-launch-done.spec.ts` for Mark as done's rename and stop,
and `agent-launch-done-refusal.spec.ts` for its refusals). The page
journeys behind the terminal panel are `agent-terminal.spec.ts` (opening, one
at a time, Close), `agent-terminal-lifetime.spec.ts` (project switch, lost
connection and Reconnect, ended terminal), `agent-terminal-done.spec.ts`
(Mark as done from the panel: asking first, closing, status, refusal),
`agent-terminal-done-question.spec.ts` (its question decided by the session as
the page reads it now), `agent-terminal-done-report.spec.ts` (on sessions that
reported), and
`agent-terminal-done-reopen.spec.ts` (reopening a session marked done from its
Recently done entry);
`agent-launch-card-done.spec.ts` marks a card's session done from its entry.
`agent-launch-done-question.spec.ts` covers the question Mark as done asks on a
card, and `agent-launch-done-question-follows.spec.ts` an open question
following the session's reading, on a card and in the panel.
`agent-terminal-delete.spec.ts` deletes the record of the session the terminal
shows.
A server that must find no `claude` gets a PATH holding only the fake `gh`
and Node. Nothing here ever calls the real
`claude`. The card-sessions journey (`agent-launch-card-sessions.spec.ts`)
reaches Preparing, including a refinement launched on the Preparing card, and
walks on through the Take and completion; the attention journey
(`agent-launch-attention.spec.ts`) walks the same stages counting the sessions
that need attention. Each card concern has one owner:
`agent-launch-card.spec.ts` the Start actions, their dialogs, what a launch
sends, and the keyboard on the newest entry; `agent-launch-card-sessions.spec.ts`
which sessions a card lists, newest first, in each stage;
`agent-launch-card-open-session.spec.ts` that those Starts stay unavailable
while an open session remains, return after Mark as done or Delete record, and
a dialog opened beforehand is refused; `agent-launch-card-session-states.spec.ts`
that an entry stays on its card in every state, without Open terminal when
unavailable and with it when unknown, and survives a restarted server, a
reload, and a project switch; `agent-launch-session-state-pace.spec.ts` what
each native state shows on its active card entry within one read pace, with
no Recently done duplicate; and `agent-launch-attention.spec.ts` how many of a
card's sessions need attention.
The ad hoc session started from Start session is walked by
`agent-launch-ad-hoc-boundary.spec.ts` (the boundary: label, arguments,
refusals, the record), `agent-launch-ad-hoc.spec.ts` (the button, dialog, and
where the session is listed), `agent-launch-ad-hoc-terminal.spec.ts` (the
terminal opening at once and the keyboard), `agent-launch-ad-hoc-problems.spec.ts`
(failed and uncertain launches), and `agent-launch-ad-hoc-sessions.spec.ts`
(the sidebar, Mark as done, reloading, "Needs input", and Delete record).
The Model choice is walked by `agent-launch-model.spec.ts` (every launch
dialog, Default at each opening, `--model` reaching `claude`),
`agent-launch-model-boundary.spec.ts` (the boundary: the alias before the
instruction, a model outside the table refused, the refusal naming the model),
and `agent-launch-model-entries.spec.ts` ("Model: <Name> (requested)" on a
card, Recently done, and the sidebar, and nothing for Default).
Delete record is walked by `agent-launch-delete.spec.ts` (the boundary),
`agent-launch-card-delete.spec.ts` and `agent-launch-card-delete-problems.spec.ts`
(a card entry, and what refusals and failures leave), and
`agent-launch-recent-delete.spec.ts` and
`agent-launch-recent-delete-unavailable.spec.ts` (a Recently done entry).

CI sets `OPEN_DOUGH_DASHBOARD_SPLIT=i/n` to select share `i` of `n` whole
spec files. `longest-first` orders known files by recorded hosted duration;
unlisted specs follow sorted, and that order is dealt round-robin across
shares. CI currently uses nine shares and runs the dashboard type-check once
in the last share, whose recorded browser load is smallest. Stale and repeated
list entries are ignored. With the variable unset,
`npm run test:dashboard` keeps running the whole suite. The partition check
in `tests/support/dashboard-test-files.test.mjs` protects discovery of new specs
and assignment without duplicates or omissions.

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
remove kept runs yourself once read. Every worker, when it exits, ends each
process its tests started, passing, failing, or timed out
(`support/processGroup.ts`), so a run does not leave servers or runners to
load the next; only a worker killed outright runs no such cleanup.

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
to 20 when eight workers build it at once.

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
(`authenticated-read-profile-addition.spec.ts`); the credited human and avatar
on cards and the roster are `agent-roster-avatar.spec.ts`; how a slow or
stalled addition read delays only its own profile's clock and human is
`profile-addition-latency.spec.ts`; the roster itself is
`agent-roster.spec.ts`, whose locators live in `dashboardPage.ts`.
