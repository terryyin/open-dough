# Dashboard browser tests

This directory holds the dashboard's one Playwright suite, run with
`npm run test:dashboard`. Test support takes the repository root from
`support/repositoryRoot.ts`, not the working directory, so
`npx playwright test` from `dashboard/`, or with `--config
<repository>/dashboard/playwright.config.ts` from anywhere, gives the same
result and builds only into `dashboard/dist`; lint refuses a `process.cwd()`
call in test code. Every run builds the app once;
each page journey (`dashboardTest.ts`) then serves that build from its own
preview server with a synthetic `gh` on its PATH (`fixtures/fake-gh`)
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
reads: `NODE_ENV`, `PATH`, every `npm_*` key, `INIT_CWD`, `FAKE_CLAUDE_DIR`,
and the spec marker `DOUGH_SPEC_PASSTHROUGH` (`claudeLaunchEnvironments`, and
`claudeAttachEnvironments` for each attach); `support/launchEnvironment.ts`
starts a server as a deployment's `npm run` start does and checks that record.
Its `claude stop <id>` lists that session stopped. Run as `claude attach` in the
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

A passing run prints nothing (`support/quietReporter.ts`). A failing
spec is shown with its error, output, and retained trace; a passing spec that
writes output, or output from the run itself such as global setup, fails the
run and is shown. Keep specs and their helpers silent.

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
