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
the story is not assessed as ready, with “Not assessed as ready”; refinement
remains available while Preparing, with “Being prepared”. Each Start leads with
a decorative icon, a play glyph for execution and a pencil for refinement,
whether noted or disabled. A noted Start has a dashed edge; its note is its
accessible description and appears on the card only in the Start's tooltip, on
hover and on keyboard focus, and its dialog says “This story is …”.
A failed or uncertain launch answer stays visible beside the Start. While a
card lists an open session for its story, every Start on that card is disabled
and described by why: the story has an open session to mark done or delete
before another can start. Taken cards
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

The same instruction field offers Record and Stop recording. Configure general
OpenAI access in System settings → OpenAI first; no environment-key fallback
is used. Missing-key guidance opens those settings and returns to the same
launch draft. Permission, recording and transcription have visible status.
Stop releases the microphone before sending one completed clip to the local
server, which uses its saved key with `gpt-transcribe`. Audio is transient and
never enters launch records. Clips are bounded to 24,000,000 bytes and requests
wait at most 60 seconds.

Each successful transcript appends once, preserving existing text. While
dictation is pending, field edits and Start are unavailable; Cancel and Escape
remain usable and release capture or abort the request. Closing discards that
draft and ignores late results. Failures leave typed startup available and
retry is explicit. Dictation never creates an assignment, workspace or native
session. Review or edit the text before pressing Start; only that final field
text follows the existing launch path. Cancellation cannot reverse a provider
charge already incurred.

The combined instruction remains limited to 4,000 characters, including the
blank line between existing text and each transcript. Exactly fitting text
appends normally. An over-length result keeps the original instruction and
shows the complete editable transcript. Shorten it and choose Add transcript,
or choose Discard transcript to keep only the original. Start and Record wait
for that choice; Cancel or Escape closes the launch and clears both transient
drafts. No words are truncated.

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
goes as `--model` on that first terminal client only, never into the stored
resume command, and the choice applies to this session only. A blank ad hoc
Cursor start with a chosen model is refused, because no Cursor run would apply
it. Cursor's Reasoning effort selector stays visible: Default and Auto disable
it with a hint to choose a specific model; models with listed effort variants
enable their supported choices. Models without variants keep it disabled with
an explanation. Returning to a model without selectable effort clears any prior
effort. Default omits `--model`. Switching
hosts and fresh openings clear both selections; no authentication, trust, approval,
sandbox or permission setting is overridden by the dashboard.
Requested model/options lines describe requests, never the effective model.

## Startup handoff and reconciliation

See [startup handoff and reconciliation](AGENT-LAUNCH-STARTUP.md) for durable
launch attempts, machine worker observation, card protection and recovery.

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

## Embedded terminals and local record actions

See [terminal attachment and local record actions](AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions)
for admission, reconnecting, Mark as done and Delete record.

## Story review

See [story review](AGENT-LAUNCH-REVIEW.md) for what Review changes compares,
its snapshot and Refresh, and how it shares the side panel.

## Retained Codex results without their workspace

See [retained Codex results](AGENT-LAUNCH-TERMINALS.md#retained-codex-results-without-their-workspace)
for read-only final reports and workspace limitations.

## Explicit completion and retained attention messages

See [explicit completion and retained attention messages](AGENT-LAUNCH-COMPLETION.md)
for the reporting channel, attention messages, and local Done.
