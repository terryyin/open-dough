# Dashboard agent launch

The [story dashboard](README.md) starts work on this machine through the same
launch dialog and local boundary for Claude Code and Codex. Origin alone decides
story membership, preparation and completion; a launch record is local evidence.

| Workflow   | Action           | Installed skill          |
| ---------- | ---------------- | ------------------------ |
| Execution  | Start execution  | `dough-execute-plan`     |
| Refinement | Start refinement | `dough-story-refinement` |
| Ad hoc     | Start session    | No story or skill        |

Backlog cards offer execution then refinement. Execution remains available when
not marked Ready for execution, with that note; refinement remains available
while Preparing, with “Being prepared”. Taken cards offer only a kept execution
start with no session. The project row offers Start session independently of the
published read, including when it failed. Projects use `~/git/<project id>`.

The modal names story/host/instruction, focuses the optional instruction, and
sends nothing on Cancel/Escape. Start commits the request at once and closes the
modal when the local service has accepted it, before the start or session ends;
[startup handoff](#startup-handoff-and-reconciliation) follows it from there.

Host initially selects Claude Code and offers Claude Code or Codex. Model opens
on Default. Claude also offers
Fable, Opus and Sonnet; a selection sends its `--model` alias before the prompt.
Codex offers only its configured default and refuses a forged Claude model
selection. Switching hosts clears the model; no authentication, trust, approval,
sandbox, permission or reasoning setting is overridden by the dashboard.
Requested model/options lines describe requests, never the effective model.

## Startup handoff and reconciliation

Start sends the exact request to `POST /__agent-launch/accept`. The service
(`server/launchAttemptOwner.ts`) saves it as an attempt in
`~/.open-dough/dashboard/launch-attempts.json` before any start or native call
and answers with the attempt; a request it cannot save starts nothing. The
attempt runs without its caller and keeps its publication receipt and outcome
for `GET /__agent-launch`; `GET /__agent-launch/changed` waits for an owned
attempt to change so pages reread without polling hosts. While a story's attempt
is unresolved, another request for that story, from any workflow, is refused;
an unreadable attempt file refuses every launch.

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

A lost answer, an attempt no running server owns, or an outcome that may or may
not have published says “Startup needs reconciliation” statically on the card,
which stays protected, and in the Startup recovery region beside the project's
actions, which also says when this machine's attempts could not be read. Recheck
reads this machine's evidence and the published state again. Continue posts to
`POST /__agent-launch/continue`, which runs the same kept request under the same
attempt and the existing [start recovery](LAUNCH-START.md#mechanical-start-and-recovery)
and native rules, or answers why not; it never creates a replacement attempt.
Restart, reload, project switch and a second page recover from that file; a
removed story keeps its recovery there. An ad hoc start shows its progress
beside Start session and its recovery in the same region, never a card.

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
evidence, and Codex continuation.

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
