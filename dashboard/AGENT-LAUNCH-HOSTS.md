# Dashboard native hosts and durable evidence

`src/hostDescription.ts` describes each known host's display name, skill sigil,
model offerings and labels, untrusted-answer hint, optional native-check advice,
and branch namespace once.
Shared server and browser consumers read those facts; native commands and
transport remain private. `server/launchHosts.ts` selects the matching registered
public boundary; an unavailable host never uses another host's implementation.
Attach and Mark as done availability is projected from that boundary's actual
optional `attach` and `stop` operations in the machine-sessions answer. Browser
controls also honor session state and workspace access; server admission retains
its own missing-operation checks. Cursor's module launches with `create-chat`,
then `cursor-agent --workspace` and `--resume` in the established workspace,
and stores that id, workspace, and resume command, with no alias or endpoint.
The launch does not pass `-w`, `--worktree`, `--trust`, `--force`, or `--yolo`.
Attach is supplied: the embedded terminal runs that stored command. A visible
cursor and the text `Add a follow-up` admit it. That attach result declares
keep, so a detached terminal leaves the client running and a later open joins
the same process instead of starting another, while the screen is working,
waiting for an answer, or unrecognized. A detached client whose screen stays
idle — `→ Add a follow-up` with no `ctrl+c to stop`, `Working`, `Running`,
or `Clarifying Questions` — is hung up after 0.203
seconds, and the next open starts a new client. Stop is not supplied, so
Mark as done stays absent.
A client still running when the launch wait ends is the launched session.
That process is kept, keyed by session, until it exits. While it runs, attach
answers with a wait: the terminal writes "Cursor is still working on this
session's launch prompt. The terminal opens when it finishes." and drops
input, then starts the terminal client through the ordinary readiness path
after the process exits. That exit does not confirm the first input.
Default omits `--model`. Skills are read from `.agents/skills`, and the prompt
sigil is `/`.

Common workflow, records, actions and presentation do not call another host's
private helpers. Shared wording reads the host description, and alerts consume native
observation meaning. Identity is host plus the opaque native conversation ID
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
notice. Cursor requires a continuation with workspace and resume arguments, and
has no alias or endpoint. A parsed session carries only its host's fields. Host modules narrow
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
A guarded same-origin `GET /__agent-launch/host-options?source=&host=codex`
uses the registered host to read every `model/list` page. It returns picker
names, descriptions and supported effort data, and optionally the configured
model when `context=project` identifies ad hoc startup in its known folder;
story discovery reads no parent-folder configuration. It returns no raw
configuration or credentials; no catalog is persisted. Launch admission and native creation
recheck explicit models and supported pairs, while untouched defaults need no
catalog read. Explicit effort is checked against configuration read with the
actual launch workspace, or against native creation’s effective model when no
configured model is known.
`thread/start` receives the actual workspace and an explicit `model` only when
selected, and `config.model_reasoning_effort` only when effort was selected.
Native effective model and effort must confirm explicit choices before any
blank/nonblank input intent is saved or submitted. Neither setting writes
configuration, changes continuation arguments, or adds an effort agent profile
fact. Its returned `thread.id` is the
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

An explicit creation model must match the native response before initial input.
The durable identity is kept even if that check fails, with the explanation that
no first input was sent. Blank startup still materializes without a model turn.
Requested model IDs remain readable in records and kept starts when the catalog
changes; predecessor records without a model retain configured-default behavior.
Claude aliases continue to be admitted only from Claude’s static offerings.
Model and effort independently inherit Codex settings when omitted.
