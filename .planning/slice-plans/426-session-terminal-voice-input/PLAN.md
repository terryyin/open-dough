# Dictate text into the current session terminal

**Identity:** SEED-200#session-terminal-voice-input
**Source:** [Refined story](../../seeds/SEED-200-session-terminal-voice-input.md#session-terminal-voice-input)

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

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
the session remains Side panel content; voice is local session input, not a
workflow or launch record. [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
keeps this feature-local design in its source and maintained terminal
documentation. No ADR conflict or new decision was found. The existing
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
supports compact, named, touch-reachable controls and textual feedback; no new
temporary architecture topic is warranted.

PFE found suitable current owners:

- Reuse `useInstructionRecording` and `/__instruction-transcription` directly.
  The hook owns capture, explicit Stop, supported audio, configuration checks,
  safe errors, resource release, cancellation, and successful-text delivery.
  Its callback already separates that work from the destination. Preserve
  `useLaunchInstruction` as the launch adapter with its separator, limit,
  overflow review, and settings-return draft. Do not copy it into the terminal.
- Extend `useAttachedTerminal` with a small insertion operation on its current
  live attachment, using xterm's input event and the existing socket message
  path. Check that this attachment can offer input and report an unsent result
  instead of silently dropping it. Focus the terminal after accepted input.
  A local offer is not a native delivery acknowledgment. Do not open a second
  socket, simulate DOM keys, reconstruct a native composer, or inspect CLI
  prompt text to implement ordinary dictation.
- Keep destination-specific state in the keyed `Terminal` view, outside the
  attachment effect and retry counter. An attachment retry must not clear a
  retained result; unmounting the view must clear it. A disposed sender must
  never target a later attachment or another session. Keep this integration
  small; a shared recorder rename is optional only if these two current
  consumers need it.
- Normalize transcript line breaks to spaces and remove terminal controls
  before offering input. Use plain text, without launch blank lines, synthetic
  Enter, or bracketed-paste escape sequences. Retain complete words and
  punctuation; do not import the launch-only 4,000-character limit. If
  normalization leaves no usable text, reuse empty-transcript recovery.
- Use the existing `IconButton` and header actions. Microphone precedes Mark
  as done where available and remains with the actions otherwise; its name
  changes to Stop during recording. Announce permission/recording/transcribing
  state and safe problems in the panel without making Close or ordinary
  typing unavailable. A pending result cannot be overwritten by a new capture.
  Keep idle status quiet; existing terminal status consumers expect no
  connection/error notice on a healthy idle attachment.

The common rule is one capture/transcription operation with destination-owned
insertion and recovery. The borrowed document-import mechanism separates
conversion from insertion; its terminal-specific limit is that control input
can act immediately and a send has no receipt. No import framework is needed.

## Outside-in proof

New spec names below are planned proof, not existing passing evidence. Use
the established real browser → local boundary → synthetic provider and native
PTY route. Extend existing voice/terminal fixture support only where needed;
do not replace recording, transcript delivery, input, or cancellation with a
stand-in for the product behavior being proved.

| Source promise / example                                                                                                                   | Owner      | Observable proof                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone microphone before Mark as done, compact header, touch and Close reachable (1, 2)                                                     | Slice 1    | New `session-terminal-voice.spec.ts`: one phone touch journey records/stops, measures visible controls and terminal input room at reduced height, and closes normally; use the delivered SEED-199 arrangement when present                                                                                                                                                                                                      |
| Desktop keyboard control, feedback, existing input, focus, exactly one insertion, edit then explicit Enter (1, 2)                          | Slice 1    | Same spec's desktop journey: type prefix, record a real clip, observe one transcript input frame and the native composer, assert no submitted native line before Enter, edit, then assert the final native line after Enter; keyboard starts/stops the named control. Extend the existing Cursor terminal-page journey's no-Mark-as-done case to assert that its microphone remains reachable, without repeating the voice flow |
| No Enter/control actions; launch separators and 4,000-character limit stay destination-specific (3)                                        | Slice 1    | Focused variants at the text-normalization boundary, plus a browser transcript containing a line break/control and a result longer than 4,000 characters reaching the native input without an automatic submit; existing launch voice/overflow proof remains green                                                                                                                                                              |
| Missing key, permission refusal, unavailable recording, empty speech, failed transcription; safe guidance, typing and explicit retry (4)   | Slice 1    | New `session-terminal-voice-lifecycle.spec.ts` reaches terminal feedback with the existing failure fixtures; prove a representative failed provider request then successful explicit retry and typed input. Reuse the existing launch failure/boundary variants for unchanged shared classifications; do not duplicate the provider matrix                                                                                      |
| Close, switching A→B, Mark as done that closes, pending permission, active capture, held request, already completed late result (5)        | Slice 1    | Same new lifecycle spec: observe stopped tracks/abort, then grant/deliver late and inspect B/reopened A plus input frames. Cover Close/reopen, switch, and successful Done through their actual page actions, without claiming unmount alone proves all three                                                                                                                                                                   |
| Unavailable attachment retains full transcript, cannot overwrite it; explicit same-session Insert after reconnect; no automatic replay (6) | Slice 2    | New `session-terminal-voice-recovery.spec.ts`: hold the completed local response, disconnect the terminal while keeping the panel, release it, assert full retained text and no frame, reconnect with no automatic frame, then Insert once; verify normal editing/submission and that a later reconnect does not resend                                                                                                         |
| Discard sends nothing, and closing/switching clears retained text (6)                                                                      | Slice 2    | Same recovery spec: Discard re-enables capture without sending; retained text is absent in B and a reopened A. An unavailable Insert attempt retains the text for recovery                                                                                                                                                                                                                                                      |
| Maintained session behavior and preserved launch behavior                                                                                  | Each slice | Update `dashboard/AGENT-LAUNCH-TERMINALS.md`; link from the existing launch dictation section if needed. Run the affected launch, terminal, and aggregate-status consumers below                                                                                                                                                                                                                                                |

## Ordered slices

### 1. Dictate into the current terminal without submitting

Type: Behavior
Status: planned

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

All observations below were in the preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/dictate-text-into-the-session-terminal-from-its`
at product revision `2fa92b730b50b1b0327977a5a45c42fea245af15` (planning-only
edits do not alter these product paths). Sources and asserted outcomes were
inspected before selection. No physical-phone or paid-provider observation is
claimed; the source reuses the existing supported-capture contract and
unsupported-browser guidance.

- Shared capture-to-destination and current terminal-input routes: the literal
  baseline command in the source's Investigation evidence passed all three
  tests. Assertions reached real recording, synthetic-provider transcription,
  appended field content, and the native terminal's `echo yes, go on` result.
- Proof discrimination: scratch suppression of `append(answer.text)` and
  `send({ input })`, running the baseline specs with
  `--grep 'two real clips|a card or standalone' --max-failures=2`, failed at
  those two corresponding observations. Both product files were restored
  byte-for-byte before any record write. This validates existing proof routes,
  not the new terminal-voice behavior that the slices must introduce.
- xterm input semantics: a local Chromium probe loaded the installed
  `node_modules/@xterm/xterm/lib/xterm.js`, opened a terminal, observed `onData`,
  and called `input('spoken text')`, `paste('first\nsecond')`, then enabled
  mode 2004 and pasted again. The observed packets were exactly
  `spoken text`, `first\rsecond`, and `\u001b[200~first\rsecond\u001b[201~`.
  Therefore use plain normalized text through input, not multiline paste.
- Cancellation/reconnect proof routes: `env -u NO_COLOR -u FORCE_COLOR
npm run test:dashboard -- session-instruction-voice-lifecycle.spec.ts
agent-terminal-lifetime.spec.ts --workers=1` passed five tests in 22.5s.
  The observations reached provider abort and released tracks, late permission
  and already-completed response isolation, unexpected track end, and native
  input after real server disconnection/reconnect. Inspected setup/observation
  locations are those specs plus `support/voicePage.ts` and
  `support/voiceProvider.ts`. These are current reusable routes; the slices
  still own the new terminal-voice integration assertions.

Literal xterm observation command (exit 0 and the three packets above):

```sh
node --input-type=module <<'NODE'
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent('<div id="terminal" style="width:800px;height:400px"></div>');
  await page.addScriptTag({ path: 'node_modules/@xterm/xterm/lib/xterm.js' });
  const result = await page.evaluate(async () => {
    const term = new window.Terminal();
    term.open(document.getElementById('terminal'));
    const observed = [];
    term.onData(data => observed.push(data));
    term.input('spoken text');
    term.paste('first\nsecond');
    await new Promise(resolve => term.write('\x1b[?2004h', resolve));
    term.paste('first\nsecond');
    term.dispose();
    return observed;
  });
  console.log(JSON.stringify(result));
  if (JSON.stringify(result) !== JSON.stringify(['spoken text','first\rsecond','\x1b[200~first\rsecond\x1b[201~'])) throw new Error('Unexpected xterm input');
} finally { await browser.close(); }
NODE
```

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
