# Dashboard browser tests

This directory holds the dashboard's one Playwright suite, run from the
repository root with `npm run test:dashboard`. Every run builds the app once;
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
`agent-launch-recent-sessions.spec.ts`, and
`agent-launch-recent-session-states.spec.ts`, which name their folders and launch
wait through the `projectFolders` and `launchTimeoutMs` options of
`dashboardTest.ts`) drive a synthetic `claude`
(`fixtures/fake-claude`, `support/fakeClaude.ts`) that every server puts first
on its PATH, in a temporary HOME holding only the project folders a test
chooses; a spec that restarts servers on the same machine state passes a
`machine` directory it owns. A per-server scenario (`claudeScenario`) decides
whether it launches, refuses, finds the folder untrusted, hangs, or reports a
session its listing does not show. It lists what it launched as
`claude agents --json --all` does; `claudeSessionBecomes` makes a session
working, idle, finished, or stopped, or forgets it, and `claudeListingFails`
makes the listing fail. It records every call's argv and working directory
(`claudeCalls`, or `claudeLaunchCalls` for the `--bg` launches alone), and
`claude stop <id>` lists that session stopped. Run as `claude attach` in the
terminal boundary's pseudo-terminal, it echoes each line entered, clears the
line on Ctrl+U, renames its listed session on `/rename <name>`, reports its
size, detaches on Ctrl+Z, and records its pid, its lines, and what ended it
(`claudeAttaches`). The terminal boundary specs drive it over a raw socket
(`agent-terminal-boundary.spec.ts`; `agent-terminal-close.spec.ts` for the
server's close hook; `agent-launch-done.spec.ts` for Mark as done's rename and
stop, and `agent-launch-done-refusal.spec.ts` for its refusals). The page
journeys behind the terminal panel are `agent-terminal.spec.ts` (opening, one
at a time, Close), `agent-terminal-lifetime.spec.ts` (project switch, lost
connection and Reconnect, ended terminal), and `agent-terminal-done.spec.ts`
(Mark as done's focus, status, and Done entry);
`agent-launch-card-done.spec.ts` marks a card's session done from its entry.
A server that must find no `claude` gets a PATH holding only the fake `gh`
and Node. Nothing here ever calls the real
`claude`. Only the card-sessions journey (`agent-launch-card-sessions.spec.ts`)
walks on from Preparing through the Take and completion.

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
