# Dashboard agent launch

The [story dashboard](README.md) starts work on this machine through the same
launch dialog and local boundary for Claude Code, Codex, and Cursor. Origin alone decides
story membership, preparation and completion; a launch record is local evidence.

| Workflow   | Action           | Installed skill          |
| ---------- | ---------------- | ------------------------ |
| Execution  | Start execution  | `dough-execute-plan`     |
| Refinement | Start refinement | `dough-story-refinement` |
| Ad hoc     | Start session    | No story or skill        |

Backlog cards offer execution then refinement. Execution remains available when
not marked Ready for execution, with that note; refinement remains available
while Preparing, with “Being prepared”. While a card lists an open session for
its story, every Start on that card is disabled and described by why: the story
has an open session to mark done or delete before another can start. Taken cards
offer only a kept execution start with no session, and that Start is disabled
the same way while an open session remains. The project row offers Start session
independently of the published read, including when it failed. Projects use the local checkout folder in their environment's saved configuration
(`~/.open-dough/dashboard/projects-production.json` for built preview,
`projects-development.json` for the dev server). The initial production projects
keep their existing `~/git/<project id>` folders and ids, so their retained launch
records remain visible. Project configuration is separate from the shared session
and launch stores; starting with an empty list does not delete those records.

The modal names story/host/instruction, focuses the optional instruction, and
sends nothing on Cancel/Escape. Start commits the request at once and closes the
modal when the local service has accepted it, before the start or session ends;
[startup handoff](#startup-handoff-and-reconciliation) follows it from there.

Host initially selects Claude Code and offers Claude Code, Codex, or Cursor.
Model opens on Default. Claude also offers
Fable, Opus and Sonnet; a selection sends its `--model` alias before the prompt.
Codex reads the installed host’s model catalog when a new-session dialog opens,
including all returned pages, and offers “Use Codex setting” beside the discovered
models and descriptions. This shared interaction covers Start session, Start
execution and Start refinement. An explicit model ID goes to native creation and
the launch record; story preparation receives that model before creating the
session. Blank ad hoc creation sends no artificial prompt. Catalog choices are
transient: the dashboard keeps no cross-launch preference and writes no
configuration. Discovery
failure explains the unavailable choices and offers retry; the configured-setting
path remains usable. Explicit choices are revalidated before creation, and a
contradictory creation response keeps the conversation identity without sending
first input or claiming the selection ran. Reasoning effort offers the host’s
supported values and descriptions, independently of Model. Both settings default
to “Use Codex setting”; an incompatible explicit effort stays selected with linked
feedback until corrected. Blank sessions receive the selected pair without input.
Explicit effort goes only to native creation’s `config.model_reasoning_effort`,
never to agent assignment or configuration writes. Ad hoc choices can resolve the
configured model in the project folder; story starts delegate defaults until their
workspace is established. Launch validates against that actual workspace and
checks native effective model/effort before saving any sendable input evidence.
Unknown configured custom models remain usable with untouched defaults.
Configured defaults are never inferred from catalog recommendations. Cursor
lists `cursor-agent models` after “Default (your Cursor setting)”, with the same
unreadable-list Retry and the same recheck before `create-chat`. A chosen id
goes as `--model` on the prompted launch run only, never into the stored resume
command, and the dialog says that Cursor also saves it as its own model
setting. A blank ad hoc Cursor start with a chosen model is refused, because no
Cursor run would apply it. Cursor offers no reasoning effort, and Default omits
`--model`. Switching
hosts and fresh openings clear both selections; no authentication, trust, approval,
sandbox or permission setting is overridden by the dashboard.
Requested model/options lines describe requests, never the effective model.

## Startup handoff and reconciliation

Start sends the exact request to `POST /__agent-launch/accept`. The service
(`server/launchAttemptOwner.ts`) saves it as an attempt in
`~/.open-dough/dashboard/launch-attempts.json` before any start or native call
and answers with the attempt; a request it cannot save starts nothing. The
attempt runs without its caller and keeps its publication receipt and outcome
for `GET /__agent-launch`; `GET /__agent-launch/changed` waits for an owned
attempt to change so pages reread without polling hosts. While a story's attempt
is unresolved (running, or in need of reconciliation as below), another request
for that story, from any workflow, is refused, and only that attempt's
continuation resumes it; the page protects the story by the same rule
(`unresolvedAttempt` in `src/launchOutcome.ts`). While a story already has an
open launch record on this machine (any host, not marked done), another
request for that story is refused with reason `session-open` until the
session is marked done or its record deleted; a continuation is refused the
same way unless every open record of the story is that attempt's own launch
(`sameLaunch`) or its launched session. An
unreadable attempt file or launch-record file refuses every story launch.

From submission, the dialog says “Starting…” with Cancel, Start and every choice
unavailable, ignores Escape, and says “Startup is underway and can no longer be
cancelled here.” Acceptance closes it; a refusal stays beside the action, and a
lost answer is uncertain, never accepted. Until the start reconciles, the
story's whole card frame is protected wherever origin lists it: no action
button runs, including alternate launches, Inspect story and card session
actions, while facts and source links stay readable and other cards, Refresh,
navigation, the Sessions sidebar and the terminal work. Its dashed edge joins
the selection and “Shown in terminal” marks. Its status says the start phase
(“Preparing execution…” / “Preparing refinement…”, then “Starting execution
in <host>…” / “Starting refinement in <host>…”, using the actual running
start’s host) and “Local startup in progress; this story's actions are
unavailable until it settles.”,
then “Waiting for published story state” once the outcome settled. Only that
progress shows an indicator, which moves unless reduced motion is requested.
Local startup never moves the story or shows Taken, Preparing or an owner.
When no running phase is reported, the installed skill's start-establishment
capability determines Preparing versus Starting; Starting names the recorded
host for execution and refinement. These sentences come directly from workflow
and host facts.
Story Starts stay unavailable until the page first reads this machine's
attempts.

A publishing start reconciles when the shown revision is its accepted
publication or, by the authenticated comparison in
[GitHub requests](GITHUB-REQUESTS.md), contains it, and its native outcome has
settled, whether or not the shown snapshot still lists its story. A refusal
that published nothing, or a start that publishes nothing, waits for a
published read asked after its outcome. An older or unrelated snapshot never
clears protection. A published start whose session was refused reconciles to
its Taken card with the kept start's continuation. A reconciled start stays so
on this machine: the page notes it with its attempt through
`POST /__agent-launch/reconciled`, which refuses an attempt that is unsettled or
needs reconciliation, so later pages, reloads, project switches and restarts
show the story's actions, and no recovery item, without asking GitHub again.

A lost answer, an attempt no running server owns, or an outcome whose session or
publication may or may not exist says “Startup needs reconciliation” statically
on the card, which stays protected, and in the Startup recovery region beside the
project's actions, which also says when this machine's attempts could not be
read. Recheck
reads this machine's evidence and the published state again. For a story
attempt whose launch is uncertain after its start settled
(publication known), and whose host boundary offers a session listing
(`hostOperations.launchedSessions`), Recheck first posts to `POST /__agent-launch/verify`,
which first reads this machine's launch records (`server/launchVerification.ts`).
A record of the same project, story and workflow launched since the attempt
was accepted confirms its session: the latest such record settles the attempt
as launched without reading a session listing or writing another launch record,
even if the kept start is gone or the session is no longer listed. Otherwise
verification reads `claude agents` once. Exactly one
listed session with the launch's name (`<project> · <kind> · <title>`),
started in its start folder (the project folder or the kept start's
workspace) at or after the attempt was accepted, and held by no other launch
record, is recorded as the attempt's launched session, with a launch record as
confirmation keeps one; a readable listing with no such session settles it as
not launched (`not-listed`). Either outcome is kept with the attempt, so it is
no longer unresolved. An unreadable listing or more than one such session
leaves it unresolved and the answer says why; Continue stays available. Recheck
never launches a session. Starts whose host offers no listing (including Codex)
and ad hoc starts reread evidence and published state without native verification.
Continue posts to
`POST /__agent-launch/continue`, which runs the same kept request under the same
attempt and the existing [start recovery](LAUNCH-START.md#mechanical-start-and-recovery)
and native rules, or answers why not; it never creates a replacement attempt.
A launch answer is shown there as it was formed, beside the card's Start or Start
session too: it says what is known and what to check, and leaves the action to
the control beside it, so an unresolved attempt's answer never directs to Start.
Restart, reload, project switch and a second page recover from that file; a
removed story keeps its recovery there. An ad hoc start shows its progress
beside Start session and its recovery in the same region, never a card.

Where Continue is eligible, story and ad hoc recovery use their host description's
optional native-check advice. Claude Code says “Check `claude agents` before
continuing: continuing starts its session again unless its kept evidence resumes
it.” Codex says “Check the dashboard history and native Codex conversations before
continuing; a recorded conversation is resumed, never submitted again.” Inline
commands retain code formatting. Without advice, the paragraph and Continue's
advice description reference are absent; the entry and its eligible controls
remain. Advice presence does not establish a launch or continuation capability.

At handoff the keyboard goes to what says the startup: the story's card, which
its status describes, or Start session's progress, never the unavailable action.
Every unavailable card action is described by the card's status; a Start
waiting for this machine's first read is described by why. A settled launch
presents its session on the card, or in the terminal for Start session, and
moves the keyboard there only while it still rests where handoff left it. A
polite “Startup announcements” log says each story's move to in progress,
waiting, needs reconciliation and reconciled once, however many reads find it
unchanged.

## Installed options

See [installed launch options](AGENT-LAUNCH-OPTIONS.md) for host-qualified
refinement definitions, selection, validation and recovery. Execution and ad hoc
have no options.

## Start and session choices

How a story's start is established before its native session and recovered,
and what the dialog's Session choices select, are in
[launch start](LAUNCH-START.md).

## Native hosts and durable evidence

See [native hosts and durable evidence](AGENT-LAUNCH-HOSTS.md) for the registered
host boundary, host-qualified identity, native startup and saved creation/input
evidence, and Codex and Cursor continuation.

## History, observation and navigation

Machine records, native-state observation, alerts and the Sessions sidebar are
described in [session history, observation and navigation](AGENT-LAUNCH-HISTORY.md).
These remain local evidence, independent of published story facts.

Each native adapter distinguishes an explicit unfamiliar status from an
incomplete observation. Unrecognized Claude Code states and Codex thread,
active-flag or latest-turn statuses remain unsettled and add no attention;
entering that reading can raise an alert. Unreadable metadata, missing Codex
active flags and failed latest-turn reads stay quiet. Shared readings use the
recorded host's unknown-observation wording and native explanation; the alert
loop consumes the adapter's meaning rather than checking the host name.
Startup baseline, deduplication, re-entry and done suppression remain shared.

## Embedded terminals and local record actions

See [terminal attachment and local record actions](AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions)
for admission, reconnecting, Mark as done and Delete record.

## Retained Codex results without their workspace

See [retained Codex results](AGENT-LAUNCH-TERMINALS.md#retained-codex-results-without-their-workspace)
for read-only final reports and workspace limitations.

## Explicit completion and retained attention messages

A prompted dashboard launch carries an explicit reporting channel for its project,
host and accepted launch reference when the installed execution skill supplies
`scripts/dashboard-completion.mjs`. All three native input builders carry the same
context; a blank session remains without an instruction. Native permission settings
still apply to the reporting command.

The installed command accepts `--outcome completed` with a reminder or
`--outcome unfinished` with the exact issue and next action, plus
`--message-file <path>` containing the agent's exact attention response. Land and
Wrap Up append `--outcome completed` without a message file only after their
operations and final wording settle. This final operation stores completion evidence
and local Done together before acknowledging the recorded session. Neither a marker,
silence, native turn completion nor process exit can set Done. Unfinished work requires
a useful nonempty message and stays open. Claude can report before its native ID is known:
that receipt says `pending-native-session`, names only the accepted launch, and
binds to its native session, with local Done for a quiet completion, when that launch
is confirmed. It never selects the
newest session for a story. Optional `--session` must match the confirmed native ID.

Messages are rendered as text on every shared session entry and remain open until
**Mark as done**. They survive a story's published stage change, dashboard restart,
and workspace disappearance, and stay readable in Recent sessions after Done.
**Read attention message** opens the retained text without changing native activity.
Quiet completion offers no attention message or empty explicit report. Passive native
final-report access remains independent, where the host supplies it.
Native terminal access remains independently available where the host supports it.
The reporting command is prepared from the installed files outside the workspace
so that workspace retirement cannot remove its executable or dependency. Session
Done remains local disposition; it does not complete the product story.

Reporting never renames, detaches, or stops its sender. Terminal attachment lifecycle
retains attachment ownership; completion reporting schedules no delayed disposal.
Native Working remains visible separately, and a receipt claims no native shutdown
or cosmetic rename. Direct Land/Wrap Up without supplied context makes no dashboard
contact. Other workflows receive the channel without gaining automatic completion.
