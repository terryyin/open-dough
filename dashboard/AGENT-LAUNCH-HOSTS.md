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
its own missing-operation checks. Cursor's module launches with `create-chat`, then one kept terminal client, `cursor-agent --workspace` and
`--resume` in the established workspace, and stores that id, workspace, and resume command, with no alias or
endpoint. The launch does not pass `-w`, `--worktree`, `--trust`, `--force`, or `--yolo`. Cursor can request
workspace trust for a fresh isolated worktree. Opening its terminal shows the held prompt; the developer answers
there before the first instruction can be delivered. The instruction is written into that client when its
server-side screen shows the text `Add a follow-up` or `Plan, search, build anything`, even when the terminal
cursor is hidden and no synchronized-update frame has arrived. A long or multiline instruction that Cursor shows
as a paste chip is submitted with a later Enter, and the record says the first input was accepted only then. A
screen that is not ready does not receive the instruction, the record stays uncertain, and the developer can
still type. When that same client later becomes ready, it receives the instruction. The client exiting does not
accept the instruction. Continue of that unconfirmed launch starts no other conversation while the runner still
holds the client, or when the runner cannot be reached. When the runner is up and no longer holds the client, or
is not running, Continue creates a new chat in the recorded configuration scope, submits the same first prompt,
and does not resume the exited session id. A missing or unreadable recorded scope refuses that Continue and
starts nothing. The launch attempt settles once the client is running and the first screen has been judged, or
when the shared launch wait (`DOUGH_LAUNCH_TIMEOUT_MS`, default 30s) ends while keep is still open — including a
screen that never becomes ready, and a paste chip whose Enter was submitted but never answered by a later paint
or exit. That wait expiry answers `uncertain` with reason `timed-out`. When the runner's current read of that
same client shows its workspace trust prompt and the first input is still uncertain, the launch answer, Startup
recovery, and session entry say Cursor is waiting for workspace trust and that the developer answers the prompt
in this session's terminal to deliver the first input. The record retains that explanation until input is
confirmed. The runner read starts nothing; an unavailable read or an older runner without trust evidence keeps
the existing timeout wording. Other wait expiries say Cursor did not show it took the instruction in time, that
the session remains kept, and how to continue from the recorded resume. The expiry does not invent or revoke
first-input state, and it does not kill the client. Acceptance of a later ready screen is still recorded after
Start returns. A Cursor that settles before the bound returns `launched` as before. Opening the terminal joins
that client and shows its output. There is no launch-wait notice and no second `cursor-agent`. A blank ad hoc
start still creates the session, submits nothing, and starts the client when opened. Attach is supplied: a later
open with no client already kept runs the stored command. The text `Add a follow-up` or `Plan, search, build
anything` admits it even when the terminal cursor is hidden. That attach result declares keep, so a detached
terminal leaves the client running and a later open joins the same process instead of starting another. The
follow-up prompt — `→ Add a follow-up` or `→ Plan, search, build anything` — keeps that process after the launch
instruction has been entered, as does a working, waiting, or unrecognized screen. Stop is not supplied, so Mark
as done stays absent. An unfinished Cursor session the runner does not hold — including when the runner is not
running or cannot be reached — offers Recover on the session entry. Observation never starts the runner or an
agent. Recover resumes the recorded `cursor-agent` continuation in the recorded worktree through the runner
(which may start), racing that keep against the same shared launch wait. When keep has not settled by that
bound, Recover answers `failed` with the same unconfirmed-delivery explanation, leaves the client kept, and does
not hang it up. When the keep settles in ordinary time and the resulting screen is the idle composer and first
input is already confirmed, it types one continuation naming the recorded workflow, identity, worktree, and
branch, plus the reporting command when present, and tells the agent to continue from the worktree's state
without opening another assignment; it does not paste the original first prompt. Working, waiting, unconfirmed
first input, and blank not-requested type nothing. When resume exits with the cannot-load sentence (`Cursor
could not load this chat.` — provisional until native cursor-agent emits an observed sentence), Recover starts
one replacement chat in the same workspace on the same launch record, updates the stored session id before
instructing that agent, and sends the original prompt plus the continuation facts (blank not-requested sends
only the continuation facts). Missing workspace, workspace trust, an unreachable runner, or any other exit
explains the reason, leaves no agent running, and starts no replacement. Held, done, and completed sessions
offer no Recover. Cursor's Model menu lists `cursor-agent models` after "Default (your Cursor setting)". Listed
ids that encode effort are projected into base models with per-model Reasoning effort choices derived only from
that listing. Reasoning effort stays visible for Cursor: Default and Auto disable it with a hint to choose a
specific model; selecting a model with listed efforts enables it. A listed id with no separable variants keeps
it disabled with an explanation. Returning to a model without selectable effort clears a prior effort so it
cannot prevent startup. An unreadable list is explained with
Retry, and Default stays startable. Launch admission rechecks a chosen base id and effort pair against that
projection and refuses a stale or unsupported composition before `create-chat`. An explicit model and effort
compose to the matching listed id, sent as `--model <id>` on that first terminal client only; the stored resume
command never carries it, and opening again does not send it. Default omits `--model` and sends no effort. A
chosen model runs in a session-scoped Cursor configuration cloned from the developer's current configuration
(under the dashboard machine home, its `chats` linked to the shared Cursor chats) and recorded on the launch
record; every process that runs the session inherits that scope, so Cursor's model persistence lands in the
scope and never in the shared configuration, and deleting the launch record removes the scope. The dialog says
the choice applies to this session only. A blank ad hoc start with a chosen model is refused before
`create-chat`, because no Cursor run would apply it; an images-only start is not blank
(`src/unattachedSession.ts` counts images as input) and is admitted with that model. Skills are read from `.agents/skills`, and the prompt sigil
is `/`. Its first prompt uses the same developer part as Claude and Codex (typed text plus any
attached-images path list from `developerPart`).

Common workflow, records, actions and presentation do not call another host's private helpers. Shared wording
reads the host description, and alerts consume native observation meaning. Identity is host plus the opaque
native conversation ID throughout stores, merging, page keys, focus and action lookup. Equal IDs in different
hosts stay separate. Claude additionally retains its native attach/stop alias; Codex needs no fabricated alias.
Predecessor actions without host address Claude only.

Every process the dashboard starts for a session, on every host, runs in the
developer's shell environment (`server/developerShellEnvironment.ts`): the
dashboard's own environment without what its start added. That removes
`NODE_ENV`, every `npm_*` variable, `INIT_CWD`, and the `PATH` entries that end
in `node_modules/.bin` or npm's `@npmcli/run-script/lib/node-gyp-bin`, whatever
their values; everything else passes through unchanged. A session's `npm ci`
then installs the locked dev dependencies, and its project commands resolve to
the checkout's own tools rather than the dashboard deployment's. Claude applies
it to `claude --bg` and `claude attach`; Codex's daemon start and resume and
Cursor's runner and the `cursor-agent` processes it starts follow the same rule;
the runner applies it again at its own spawns, so a runner an earlier
deployment started also starts clean clients.
The dashboard's own helper processes (`git`, `gh`, the Open Dough notification
sender) are not sessions and keep its environment. The notification sender
receives a fixed inline browser callback with a safely quoted URL
argument. Safari/Chrome Automation consent lets a click reuse the matching
dashboard tab and foreground its window. The callback survives sender exit
without a checkout file or Node process. The server owns and aborts delivery
and diagnostic children on shutdown; a later clicked callback belongs to macOS.
No notification click runs an agent command.

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
handoff when present, then the developer's part (typed text and any attached-images
path list from `developerPart`), separated by blank lines.
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
A guarded same-origin `GET /__agent-launch/host-options?source=&host=` serves
any registered host whose boundary supplies `options`: Codex and Cursor, whose
catalog is described above. For Codex it reads every `model/list` page. It returns picker
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
the installed handoff, the developer's part (typed text and any attached-images
path list) and native skill input identifying
the workspace's `.agents/skills/<skill>/SKILL.md`. An ad hoc first input has no
skill line or skill input on any host: when its launch established a session
(`server/unattachedStart.ts`), it is the installed formatter's
"Established session" block, the reporting context, then the developer's part;
otherwise the developer's part and its reporting context, and nothing when that
part is blank (`server/unattachedInput.ts`, via `developerPart`).

Creation refusal submits no input, keeps preparation and reports a validated, bounded
native error message without dumping error data. A daemon whose working directory was
removed needs a restart; the dashboard never restarts it automatically. Before creation,
the launch document keeps workspace/endpoint. Without a trusted ID, cards/Recently done show
a native history picker; Start requires reconciliation.
Known input is awaiting before submission, uncertain before acknowledgment,
confirmed by acceptance or matching saved intent in native history. Start reads/
resumes the saved ID, verifies CWD and preserves original preparation/text.
Empty, unrelated, unreadable or mismatched history never proves input rejected.
Only durable no-submission/explicit-refusal evidence permits the saved input in
that conversation, including any Attached images path list already composed into
that saved instruction; the copied files under `launch-attachments/<attempt>/`
remain while the attempt is retained. Store failure prevents submission and
explains continuation. Confirmation clears pending acceptance explanations,
including legacy stale uncertainty.
Connection loss retains the command with a separate continuation notice. Neither fact
claims live/story state; predecessor Claude records remain confirmed.
Codex records retain the exact native continuation arguments, endpoint and
workspace. Cards/Recently done show a shell-quoted command:
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
