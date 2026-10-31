# Execution evidence

Supporting design, investigation and accepted proof for [the active plan](PLAN.md).

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

## Slice 1 accepted evidence

Implementation return: `/root/slice_1` (quiescent uncommitted). Coordinator
inspected Terminal, adapter, live attachment sender, normalization, keyed PageFrame,
recording cancellation guards, all new setup/assertions, launch overflow observations,
and affected terminal status/keyboard/touch/native consumers. Source comparison is
per id in source-review.md. No generator is triggered by this frontend/test/doc work.
G1/G3 are proved; G2 remains the truthful safe interim owned by slice 2.

Literal proof selections (one worker, shared host load ~10–13; preserve other
sessions' processes). Initial complete selection:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-terminal-voice.spec.ts session-terminal-voice-lifecycle.spec.ts session-instruction-voice.spec.ts session-instruction-voice-lifecycle.spec.ts session-instruction-voice-overflow.spec.ts agent-terminal.spec.ts agent-terminal-lifetime.spec.ts boundary/terminal-dictation.spec.ts agent-terminal-cursor-page.spec.ts agent-terminal-codex-page.spec.ts agent-terminal-theme.spec.ts agent-terminal-touch.spec.ts --workers=1
```

All lifecycle, launch voice/lifecycle/overflow, terminal/lifetime/theme, normalization
observations passed. Aggregate failed on the corrected cases below; those passing
observations remain applicable. After keyboard/fixture corrections:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-terminal-voice.spec.ts agent-terminal-cursor-page.spec.ts agent-terminal-codex-page.spec.ts agent-terminal-touch.spec.ts agent-terminal-keyboard.spec.ts --workers=1
```

New normal voice, Cursor, both Codex and existing keyboard tests passed. Touch
UUID visibility failed and was corrected; final affected selections passed:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- agent-terminal-touch.spec.ts session-terminal-voice.spec.ts --grep touch --workers=1
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-terminal-voice.spec.ts --grep 'touch records' --workers=1
npm run typecheck:dashboard
git diff --check
```

Failure dispositions: reload keeps sidebar open, so use visibility-aware opener;
PTY resize notices can split visual text, so inspect prefix/transcript separately
and assert exact final submitted native line. Fourth action pressure is resolved
with compact gaps and touch-only block session ID, preserving title/ID scrolling
and 44px controls. Cursor currently has localDone: remove the newly false no-Mark
assertion, retain microphone visibility and independent conditional placement.
Codex fixture dates October 1 expired after 30 days; baseline at d3a51816 reproduced
both pre-Terminal failures (report `/tmp/seed200-codex-baseline-report.txt`, owned
temporary checkout retired). Only those timestamps changed to current ISO dates;
then both native consumers passed. No broader native behavior changed.

Consumer trace: `/tmp/seed200-slice1-consumers.md` (installed script, explicit five
production paths plus terminal-status/useInstructionRecording). Dispositions:
AskInPlace — run successful Done and keyboard; LaunchInstruction and recorder —
run unchanged launch voice/lifecycle/overflow plus terminal flows; PageFrame — run
Close/reopen and switch/late isolation; side-panel.css and SidePanelControls — run
phone/touch/keyboard/Close/lifetime/theme; terminal theme and normalization spec —
run. SEED-199/plan425 — concurrent planning references preserved, no executable
consumer; SEED-200/plan426 — authority/evidence records. Memory investigation doc
— excluded because output flow control is not changed by input insertion.

The recorder remains unchanged. No paid-provider or physical-phone proof claimed.

## Slice 1 refactor acceptance

Independent `/root/refactor_1` returned `## REFACTOR COMPLETE`. Coordinator
inspected the mounted attachment extraction, public-hook re-export/lifetime/theme,
shared status selection, and both lifecycle callers of the extracted holds.
No capture/cancellation mechanics changed; source observations remain at the same
public boundaries, with imperative input/disposal now in attachedTerminal.ts.
The earlier statement that the recorder is unchanged now applies to its mechanics;
it additionally owns the shared status strings.

All affected browser proof was renewed with exit 0 (session 37039):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- session-terminal-voice.spec.ts session-terminal-voice-lifecycle.spec.ts session-instruction-voice.spec.ts session-instruction-voice-lifecycle.spec.ts session-instruction-voice-overflow.spec.ts session-instruction-voice-capture-failures.spec.ts session-instruction-voice-key-failures.spec.ts session-instruction-voice-provider-failures.spec.ts agent-terminal.spec.ts agent-terminal-lifetime.spec.ts agent-terminal-codex-page.spec.ts agent-terminal-cursor-page.spec.ts agent-terminal-theme.spec.ts agent-terminal-touch.spec.ts agent-terminal-keyboard.spec.ts --workers=1
```

Typecheck and whitespace passed. Normalization/server boundaries stayed unchanged
and retain their accepted proof. The installed consumer trace at
`/tmp/seed200-refactor-consumers.md` disposes every row (12 run, 8 reused, 122
unrelated homonyms/references excluded); affected LaunchDialog, PageFrame, actions,
voice helpers and browser journeys are exercised. One sequential worker was
selected with increased shared-host contention acknowledged (load31–36, ~99% CPU),
and no other owned heavy verification or interference with other sessions.
All changed files remain <=250 after formatting preview; largest is248.
