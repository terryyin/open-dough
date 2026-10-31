# Dictate text into the current session terminal

**Identity:** SEED-200#session-terminal-voice-input
**Source:** [Refined story](../../seeds/SEED-200-session-terminal-voice-input.md#session-terminal-voice-input)
**Source review:** [Independent source review](source-review.md)

## Goal and scope

A developer uses the open session's compact microphone control, stops
recording, and receives text in that terminal's current input without an Enter
or copy step. Existing typed text remains editable. Closing or replacing the
view cancels capture and late results. If the attachment cannot accept a
completed transcript, the current view retains it for explicit Insert after
reconnect or Discard (Terry's selected recovery).

The source owns all promises and exclusions. This plan adds no provider,
transcription service, credential path, launch action, durable transcript store,
delivery receipt, automatic replay, or mobile-layout redesign. SEED-199 is
concurrent header/layout work, not a prerequisite. Reconcile against the
header it delivers without changing either story's promises.

## Design and reuse

See [supporting execution evidence](execution-evidence.md#design-and-reuse).

## Outside-in proof

New spec names below are planned proof, not existing passing evidence. Use
the established real browser → local boundary → synthetic provider and native
PTY route. Extend existing voice/terminal fixture support only where needed;
do not replace recording, transcript delivery, input, or cancellation with a
stand-in for the product behavior being proved.

| Source promise / example                                                                                                                   | Owner      | Observable proof                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone microphone before Mark as done, compact header, touch and Close reachable (1, 2)                                                     | Slice 1    | New `session-terminal-voice.spec.ts`: one phone touch journey records/stops, measures visible controls and terminal input room at reduced height, and closes normally; use the delivered SEED-199 arrangement when present                                                                                                                                                                                                      |
| Desktop keyboard control, feedback, existing input, focus, exactly one insertion, edit then explicit Enter (1, 2)                          | Slice 1    | Same spec's desktop journey: type prefix, record a real clip, observe one transcript input frame and the native composer, assert no submitted native line before Enter, edit, then assert the final native line after Enter; keyboard starts/stops the named control. Extend the existing Cursor terminal-page journey to assert that its microphone remains reachable, without repeating the voice flow; current Cursor capability includes local Mark as done, and Terminal renders microphone independently of that conditional |
| No Enter/control actions; launch separators and 4,000-character limit stay destination-specific (3)                                        | Slice 1    | Focused variants at the text-normalization boundary, plus a browser transcript containing a line break/control and a result longer than 4,000 characters reaching the native input without an automatic submit; existing launch voice/overflow proof remains green                                                                                                                                                              |
| Missing key, permission refusal, unavailable recording, empty speech, failed transcription; safe guidance, typing and explicit retry (4)   | Slice 1    | New `session-terminal-voice-lifecycle.spec.ts` reaches terminal feedback with the existing failure fixtures; prove a representative failed provider request then successful explicit retry and typed input. Reuse the existing launch failure/boundary variants for unchanged shared classifications; do not duplicate the provider matrix                                                                                      |
| Close, switching A→B, Mark as done that closes, pending permission, active capture, held request, already completed late result (5)        | Slice 1    | Same new lifecycle spec: observe stopped tracks/abort, then grant/deliver late and inspect B/reopened A plus input frames. Cover Close/reopen, switch, and successful Done through their actual page actions, without claiming unmount alone proves all three                                                                                                                                                                   |
| Unavailable attachment retains full transcript, cannot overwrite it; explicit same-session Insert after reconnect; no automatic replay (6) | Slice 2    | New `session-terminal-voice-recovery.spec.ts`: hold the completed local response, disconnect the terminal while keeping the panel, release it, assert full retained text and no frame, reconnect with no automatic frame, then Insert once; verify normal editing/submission and that a later reconnect does not resend                                                                                                         |
| Discard sends nothing, and closing/switching clears retained text (6)                                                                      | Slice 2    | Same recovery spec: Discard re-enables capture without sending; retained text is absent in B and a reopened A. An unavailable Insert attempt retains the text for recovery                                                                                                                                                                                                                                                      |
| Maintained session behavior and preserved launch behavior                                                                                  | Each slice | Update `dashboard/AGENT-LAUNCH-TERMINALS.md`; link from the existing launch dictation section if needed. Run the affected launch, terminal, and aggregate-status consumers below                                                                                                                                                                                                                                                |

## Ordered slices

### 1. Dictate into the current terminal without submitting

Type: Behavior
Status: done

Behavior: an open terminal contains editable input → the developer records
and stops from its header → one safe transcript enters through the existing
input path, focus returns there, and only the developer's later Enter submits.
The same operation owns recording feedback, failures, and cancellation when
its view ends, so a late result cannot enter another view.

Implement the shared-hook adapter, insertion operation, compact control,
feedback, normalization, and view-bound cleanup together. Preserve ordinary
typing while busy and reuse existing settings/error guidance. Follow the
actual current header after reconciling concurrent SEED-199 work. Retain any
result an attachment cannot accept and show it with an explanation and
Discard; block another capture until it is settled so no text is overwritten.

Proof: own examples 1–5 and the safe interim retention above. Add the two
new normal/lifecycle specs and narrow normalization variants. Reuse
`observeMicrophone`, the synthetic provider's held response, native attachment
records, and `noteTerminalTraffic`; their observers must not supply the
insertion or cleanup being asserted. Inspect and run consumers of a changed
hook, sender contract, status container, or header rather than limiting proof
to direct imports.

Interim behavior: the complete unsent result can be read or discarded but has
no Insert-after-reconnect action until slice 2. Name that limitation in the
temporary feedback and documentation; it preserves the text without
automatically delivering or promising recovery not yet implemented. Slice 2
replaces this interim state. All cancellation and no-wrong-session safeguards
are required in this slice, not deferred until recovery.

Focused command from the repository root (after creating the new specs):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-terminal-voice.spec.ts session-terminal-voice-lifecycle.spec.ts session-instruction-voice.spec.ts session-instruction-voice-lifecycle.spec.ts session-instruction-voice-overflow.spec.ts agent-terminal.spec.ts agent-terminal-lifetime.spec.ts --workers=1
```

Sizing: one recording-to-input operation and its lifecycle; no preparatory
Structure slice or provider/server implementation is expected. Include
implementation, focused proof, and slice-local refactoring. If investigation
reveals a new transport protocol or a different story promise is required,
stop and reassess that premise rather than growing this slice.

### 2. Insert a retained transcript deliberately after reconnect

Type: Behavior
Status: planned

Behavior: a completed transcript could not be offered to the current
attachment → the developer reconnects → the complete text remains pending
until Insert or Discard. Insert offers it once to this session and returns
focus; failure to offer keeps it recoverable. Discard sends nothing. Closing
or replacing the view clears it. A transcript already offered is never
automatically resent after reconnect.

Complete the retained-result adapter and replace slice 1's interim guidance
with explicit Insert and Discard. Keep its state independent of attachment
retry, with one result settled before another recording; add no persistence,
queue, acknowledgment protocol, or hidden retry. Reuse the same normalization
and live-sender operation as ordinary completion. Update maintained terminal
documentation to the final behavior.

Proof: own example 6 through `session-terminal-voice-recovery.spec.ts`, with
actual terminal disconnection/reconnection and a completed response held only
at its delivery boundary. The provider and completed-response holds already
exist; observe terminal frames and the native composer rather than mocking a
successful insertion. Keep the no-submit, session-isolation and existing
terminal-lifetime assertions from slice 1.

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-terminal-voice-recovery.spec.ts session-terminal-voice.spec.ts session-terminal-voice-lifecycle.spec.ts agent-terminal-lifetime.spec.ts --workers=1
```

Sizing: one recoverable pending-result transition and proof loop, using the
sender and capture adapter delivered in slice 1. No separate UI, test-only,
or persistence slice is needed.

## Verification and delivery constraints

Use the installed execution workflow when execution is explicitly requested;
this preparation grants none. Its required post-change refactoring, proof,
agent commit, delivery, and retrospective gates still apply. No numeric slice
target was supplied; boundedness is judged by the single operation/proof loops
above, not an invented time limit.

Use `dashboard/tests/README.md` for the real preview and external-boundary
fixture rules. New detailed provider/transport variants belong at their
existing boundary, while page interaction and lifecycle belong in journeys.
Check changed consumers through the installed consumer trace. In particular,
inspect `agent-terminal-lifetime`'s whole-status assertions, touch/header
consumers, Codex/Cursor terminal callers of the shared attachment, and every
launch consumer if the shared recorder changes. Add only the affected consumer
proof beyond the commands above. Run dashboard typecheck and changed-file
format/lint checks. Hosted CI remains the execution workflow's duty; its
configuration alone does not require every suite locally.

Local proof resource basis: this checkout's three-test baseline took 34.9s.
The shared 16-core, 48-GiB host had load 22.33/26.61/26.87 and 48% free-memory
headroom at the lifecycle-prefix observation. Other sessions were running
tests. Use one worker for this bounded preparation/execution selection;
reconsider concurrency before an expanded run or after contention failures.
Do not stop another session's processes.

## Decisive premises and observations

See [supporting execution evidence](execution-evidence.md#decisive-premises-and-observations).

## Current decisions and plan review

- Terry selected retention on 2026-10-31; no product decision remains open.
- One shared capture/transcription owner, with distinct launch-field and
  session-terminal destination rules. No general adapter framework is needed.
- Sender acceptance means one local offer, never confirmed native delivery;
  do not automatically replay an uncertain offer.
- Slice-plan refinement was not needed: two bounded Behavior slices follow
  the same operation, proof ownership is explicit, and slice 2 replaces the
  named safe interim behavior rather than adding another representation.
- No remaining slice-specific concern was identified in this preparation;
  the final readiness record is bound to this plan and its refined source.

## Execution context

- Established execution: `SEED-200#session-terminal-voice-input`, publisher
  `dashboard-territory.local-open-dough`, agent `d.kanai-chan`.
- Mode: Story Branch; owned/reused execution checkout
  `/Users/terryyin/git/open-dough/.worktrees/dictate-text-into-the-session-terminal-from-its`,
  branch `codex/dictate-text-into-the-session-terminal-from-its`. Default integration
  checkout: `/Users/terryyin/git/open-dough`; authorized remote/trunk: `origin/main`.
- Starting revision: `c1e02872a5627aaa6319c1b7d79c82cf3d335823`. Claim published
  on `origin/main`: `d3a51816132a8daf82d80384b04b1ff5f4124c61`; initial candidate
  and previously published execution base are that same SHA. Claim CI is unobserved.
- Checkout setup: locked `npm ci` and `npm run typecheck:dashboard` passed.
  Selective formatter: `npm run format`; pre-commit is check-only staged lint
  plus dashboard typecheck when scripts are staged.
- Replanning: preserve existing planned-work authority; no numeric slice limit
  supplied. Reassess an expanded transport or changed promise before continuing.
- CI: GitHub Actions `ci.yml` (verified active workflow ID 351271804, name CI),
  push coverage of `terryyin/open-dough`, target
  `codex/dictate-text-into-the-session-terminal-from-its`. Codex coordinator
  `seed200-kanai`; observer `/tmp/dough-ci-501/watch-M6Cudd`, PID 8917,
  stream session 90318, yielded cell `g20:11`, checkout as above.
- First selected slice: 1; story-obligation listing accepted with no entries.
  Use one worker for focused browser proof on the shared host; reconsider current
  contention before heavy verification, preserving other sessions' processes.

## Story obligations

### G1. Keyboard access from native input
Reported: slice 1 — "acceptance discovery: xterm consumes Tab/Shift+Tab; focusing a header button in test setup would not establish the source's keyboard journey from terminal focus."
Story clause: "keep it usable with touch and keyboard at narrow and desktop widths"
Disposition: proved by slice 1: session-terminal-voice.spec.ts actual native input → Alt+F10 → Session actions → Tab → named microphone/Stop Enter/Space; input aria-describedby and existing native Tab/Escape assertions

### G2. Interim retained result cannot yet insert
Reported: slice 1 — "acceptance discovery: interim feedback retains full text with Discard but explicitly says insertion after reconnect is not available yet."
Story clause: "offer explicit Insert after reconnect plus Discard"
Disposition: interim until slices 2

### G3. Phone journey must retain edit and submit proof
Reported: slice 1 — "acceptance discovery: the initial phone journey records/stops and measures layout, but only the desktop journey observes existing native input, focus, no submit, editing, and explicit Enter."
Story clause: "Edit it, then press Enter → the session receives the edited instruction"
Disposition: proved by slice 1: session-terminal-voice.spec.ts phone journey observes touch-focused Review prefix, one offered transcript, native focus/no submitted line, Backspace/edit, then exact edited native line after Enter

## Execution decisions

- Keyboard investigation: existing xterm consumes native Tab/Shift+Tab; existing
  page shortcuts either retain terminal focus or close the view. Add a local
  Alt+F10 path to session actions, followed by ordinary Tab navigation, as the
  minimum implementation of keyboard access. Preserve native Tab and Escape;
  prove the complete path from native input and document discovery/help. This
  selects a routine interaction within the source promise, not a source change.

## Slice 1 accepted evidence

See [supporting execution evidence](execution-evidence.md#slice-1-accepted-evidence).
