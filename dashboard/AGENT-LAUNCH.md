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
(“Preparing execution…”, “Starting execution in Claude Code…”) and “Local
startup in progress; this story's actions are unavailable until it settles.”,
then “Waiting for published story state” once the outcome settled. Only that
progress shows an indicator, which moves unless reduced motion is requested.
Local startup never moves the story or shows Taken, Preparing or an owner.
Story Starts stay unavailable until the page first reads this machine's
attempts.

A publishing start reconciles when the shown revision is its accepted
publication or, by the authenticated comparison in
[GitHub requests](GITHUB-REQUESTS.md), contains it, and its native outcome has
settled. A refusal that published nothing, or a start that publishes nothing,
waits for a published read asked after its outcome. An older or unrelated
snapshot never clears protection. A published start whose session was refused
reconciles to its Taken card with the kept start's continuation.

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

`src/hostDescription.ts` describes each known host's display name, skill sigil,
model offerings and labels, untrusted-answer hint and branch namespace once.
Shared server and browser consumers read those facts; native commands and
transport remain private. `server/launchHosts.ts` selects the matching registered
public boundary; an unavailable host never uses another host's implementation.
Attach and Mark as done availability is projected from that boundary's actual
optional `attach` and `stop` operations in the machine-sessions answer. Browser
controls also honor session state and workspace access; server admission retains
its own missing-operation checks. Cursor has a known branch namespace but no
delivered runtime or launch choice.

Common workflow, records, actions and presentation do not call another host's
private helpers. Some shared session wording and alert policy still branch on
host name, as described below. Identity is host plus the opaque native conversation ID
throughout stores, merging, page keys, focus and action lookup. Equal IDs in different hosts stay separate. Claude
additionally retains its native attach/stop alias; Codex needs no fabricated
alias. Predecessor actions without host address Claude only.

Each dashboard server refuses an overlapping matching launch for every host,
including ad hoc and workflows without an installed start. Matching uses project,
host, workflow and story identity, or the exact instruction for ad hoc sessions,
including blank text. Changing a story's title, instruction, model, options or
policy does not bypass the gate; distinct subjects remain independent. The gate
lasts until the launch attempt settles, including reconciliation and recording.
HTTP caller detachment does not release it. Native work continuing after startup
does not hold it; installed-start and retained-evidence protections still apply
when another launch is requested. Separate servers or machines do not share this
in-flight gate.

A host's optional `LaunchHost.creationEvidence` operation declares that native
creation needs durable evidence and supplies its native inspection arguments
and unreadable-evidence advice. Common admission refuses unreadable or matching
unresolved creation evidence before workflow or native startup for such a host.
Codex declares this requirement; Claude does not, so unreadable evidence still
admits Claude to native launch. This does not guarantee that its result can be
saved. Unreadable evidence invents no endpoint, workspace or inspection command.

The stored creation record remains workspace/endpoint and launch request without
a session ID. GET projects that evidence through its own host boundary into a
recovery view naming the host and its inspection arguments; the launch refusal
and common page format those arguments with shared shell quoting. The Codex
module derives the history picker from saved endpoint/workspace, including for
predecessor records with no stored recovery. Absent inspection support is shown
as unavailable. Shared recovery never supplies another host's command, and
reading a recovery view does not rewrite the stored record.

Session records are a discriminated union on `host`. Each variant keeps
`sessionId` and `name`; Claude requires its native `shortId`, while Codex may
carry a continuation with workspace, endpoint, resume arguments, and an optional
notice. A parsed session carries only its host's fields. Host modules narrow
to their own variant; shared presentation reads continuation by field presence.
Predecessor Codex records without continuation still load, observe as unknown,
refuse terminal attachment, and retain the missing-endpoint diagnostic when
marked done. Stored records need no migration.

Claude runs `claude --bg --name '<project> · <kind> · <title>'` in the project or
established workspace. Its prompt is `/<skill> <identity> <flags>`, the installed
handoff when present, then optional instruction, separated by blank lines.
It confirms through `claude agents --json --all`; an unreadable/unconfirmed
answer is uncertain. Missing CLI, refusal and untrusted folder are explained
without exposing raw stderr; timeout never establishes absence.

Codex discovers/starts the vendor's shared daemon with `codex app-server daemon start`
from the machine's home directory and connects to its Unix socket. It outlives retired worktrees.
At dev and preview server startup, retained catalog Codex sessions trigger the
same idempotent command once, bounded to ten seconds, before passive observation
and attachment admission. The saved endpoints and identities stay unchanged;
startup never resumes a conversation or sends input. Missing/refusing Codex
leaves the dashboard usable with existing unknown observation and recovery.
`thread/start` receives only the workspace; its returned `thread.id` is the
conversation ID, never the initialization/session ID. The common store awaits
durable identity before `turn/start`. First input contains `$<skill> <identity> <flags>`,
the installed handoff, optional instruction and native skill input identifying
the workspace's `.agents/skills/<skill>/SKILL.md`; ad hoc sends only optional text.

Creation refusal submits no input, keeps preparation and reports a validated, bounded
native error message without dumping error data. A daemon whose working directory was
removed needs a restart; the dashboard never restarts it automatically. Before creation,
the launch document keeps workspace/endpoint. Without a trusted ID, cards/Recent show
a native history picker; Start requires reconciliation.
Known input is awaiting before submission, uncertain before acknowledgment,
confirmed by acceptance or matching saved intent in native history. Start reads/
resumes the saved ID, verifies CWD and preserves original preparation/text.
Empty, unrelated, unreadable or mismatched history never proves input rejected.
Only durable no-submission/explicit-refusal evidence permits the saved input in
that conversation. Store failure prevents submission and explains continuation.
Confirmation clears pending acceptance explanations, including legacy stale uncertainty.
Connection loss retains the command with a separate continuation notice. Neither fact
claims live/story state; predecessor Claude records remain confirmed.
Codex records retain the exact native continuation arguments, endpoint and
workspace. Cards/Recent show a shell-quoted command:
`codex resume --remote <native Unix endpoint> --cd <recorded workspace> <thread ID>`.
Use it in an ordinary terminal to read, answer questions and handle configured
approval in the same native conversation, including while a turn is active.
The browser never executes a shell command. Native configuration/authentication
remain those of the installed Codex CLI and shared daemon.
Launch outlives HTTP callers/page closure; Codex retains its connection until native completion or connection failure.
It accounts for terminal/error events racing durable acknowledgment, retains
recovery on background failure, and disposes the failed connection. It never
answers native approval/input requests or interrupts the native turn. Server
shutdown detaches dashboard connections, leaving the vendor daemon and saved
conversation alive. Later lifecycle updates cannot recreate a deleted record.

Codex supports recorded-conversation observation, embedded CLI interaction and
Mark as done through the shared session controls. Missing saved endpoints remain
unknown; they never fall back to Claude. Blank ad hoc startup persists the native
conversation before releasing its creator, with no artificial empty model turn.
Its record says no instruction was submitted; the CLI accepts the first instruction
in that same conversation after page/server restart. Uncertain persistence keeps
the original blank intent for conservative recovery without another thread.

For refinement, Codex desktop can also open the original conversation to follow its
active first turn, then answer its completed question in that same conversation.
There is no separate handoff action: the existing launch client releases its
connection when the native turn completes. Starting input during an active turn
remains subject to Codex's native rules.

## History, observation and navigation

Machine records, native-state observation, alerts and the Sessions sidebar are
described in [session history, observation and navigation](AGENT-LAUNCH-HISTORY.md).
These remain local evidence, independent of published story facts.

## Embedded terminals and local record actions

See [terminal attachment and local record actions](AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions)
for admission, reconnecting, Mark as done and Delete record.

## Retained Codex results without their workspace

See [retained Codex results](AGENT-LAUNCH-TERMINALS.md#retained-codex-results-without-their-workspace)
for read-only final reports and workspace limitations.
