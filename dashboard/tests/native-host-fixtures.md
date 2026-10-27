# Native-host fixtures and journeys

The [README](README.md) owns the strategy: which tier a check belongs to,
what is real and what is replaced, and how the suite runs; [writing a
journey](writing-journeys.md) holds the rules a journey's code follows. These
fixtures drive native-host launch, listing and terminal boundaries without
calling the real hosts.

The launch boundary specs (`agent-launch-boundary.spec.ts`,
`agent-launch-refusal.spec.ts`, `agent-launch-records.spec.ts`, and
`agent-launch-session-listing.spec.ts`) and the page journeys
(`agent-launch-story-card.spec.ts`, `agent-launch-story-card-problems.spec.ts`,
`agent-launch-story-card-sessions.spec.ts`, `agent-launch-story-card-session-states.spec.ts`,
`agent-launch-recent-sessions.spec.ts`,
`agent-launch-session-state-pace.spec.ts`,
`agent-launch-attention.spec.ts`, `sessions-sidebar.spec.ts`,
`sessions-sidebar-reading.spec.ts`, `sessions-sidebar-row.spec.ts`, `sessions-sidebar-stays-as-left.spec.ts`,
`sessions-sidebar-keyboard.spec.ts`, `sessions-sidebar-navigation.spec.ts`,
and `sessions-sidebar-navigation-cases.spec.ts`, which name
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
terminal boundary's pseudo-terminal, it echoes each line entered, edits with
Backspace, clears the
line on Ctrl+U, renames its listed session on `/rename <name>`, reports its
size, detaches on Ctrl+Z, and records its pid, its lines, and what ended it
(`claudeAttaches`); `claudeAttachesSilent` makes it print nothing.
`claudeAttachPromptDelay(ms)` delays the bordered composer after the banner;
keys before the prompt are discarded.

Fixture close ends its server process group, then observes this server's recorded
Claude attachments no longer running before removing temporary fixture files.
The bounded exit check reports remaining PIDs on failure while other owned
services still close. Public attachment observations remain machine-wide; the
exit check selects only that server's attachments. Retained Cursor clients belong
to their runner, which is stopped by the owner of the machine directory.

The terminal boundary specs drive it over a raw socket
(`agent-terminal-boundary.spec.ts`; `agent-terminal-close.spec.ts` for the
server's close hook; `agent-terminal-reopen.spec.ts` for reopening a session
marked done; `agent-launch-done.spec.ts` for Mark as done's rename and stop,
and `agent-launch-done-refusal.spec.ts` for its refusals). The page
journeys behind the terminal are `agent-terminal.spec.ts` (opening, one
at a time, Close), `agent-terminal-touch.spec.ts` (coordinate touch focus,
native Backspace/Enter input, reduced-height fitting, touch scrollback,
rotation and Close/reopen identity), `agent-terminal-lifetime.spec.ts` (project switch, lost
connection and Reconnect, ended terminal), `agent-terminal-done.spec.ts`
(Mark as done from the panel: asking first, closing, status, refusal),
`agent-terminal-done-question.spec.ts` (its question decided by the session as
the page reads it now), `agent-terminal-done-report.spec.ts` (on sessions that
reported), and
`agent-terminal-done-reopen.spec.ts` (reopening a session marked done from its
Recently done entry);
`agent-launch-story-card-done.spec.ts` marks a card's session done from its entry.
`agent-launch-done-question.spec.ts` covers the question Mark as done asks on a
card, and `agent-launch-done-question-follows.spec.ts` an open question
following the session's reading, on a card and in the panel.
`agent-terminal-delete.spec.ts` deletes the record of the session the terminal
shows.
A server that must find no `claude` gets a PATH holding only the fake `gh`
and Node. Nothing here ever calls the real
`claude`. The story-card-sessions journey (`agent-launch-story-card-sessions.spec.ts`)
reaches Preparing, including a refinement launched on the Preparing card, and
walks on through the Take and completion; the attention journey
(`agent-launch-attention.spec.ts`) walks the same board counting the sessions
that need attention. Each card concern has one owner:
`agent-launch-story-card.spec.ts` the Start actions, their dialogs, what a launch
sends, and the keyboard on the newest entry; `agent-launch-story-card-sessions.spec.ts`
which sessions a card lists, newest first, in each column;
`agent-launch-story-card-open-session.spec.ts` that those Starts stay unavailable
while an open session remains, return after Mark as done or Delete record, and
a dialog opened beforehand is refused; `agent-launch-story-card-session-states.spec.ts`
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
`agent-launch-story-card-delete.spec.ts` and `agent-launch-story-card-delete-problems.spec.ts`
(a card entry, and what refusals and failures leave), and
`agent-launch-recent-delete.spec.ts` and
`agent-launch-recent-delete-unavailable.spec.ts` (a Recently done entry).

