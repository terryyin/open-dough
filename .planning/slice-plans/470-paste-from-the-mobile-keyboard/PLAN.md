# Paste from the mobile keyboard

**Identity:** SEED-237#paste-from-the-mobile-keyboard
**Source:** [selected story](../../seeds/SEED-237-paste-from-the-mobile-keyboard.md#paste-from-the-mobile-keyboard)
in SEED-237, refined 2026-11-05 with explore, borrow, challenge, clarify,
investigate, UX/UI and architecture.
**Source review:** [numbered commitments](source-review.md)
**Prepared:** 2026-11-05. Planning only, in the story's established workspace
(branch `claude/paste-from-the-mobile-keyboard`, agent joseph-chan),
continuing the refinement in the same session.

## Goal and boundaries

A developer on a phone taps **Paste** on the Side panel terminal's phone key
toolbar and the phone clipboard reaches the shown session: text as one
terminal paste, an image as a file stored on this machine whose absolute path
is pasted. The seed's eight key examples are the acceptance.

Included: the Paste key on the coarse-pointer toolbar; the clipboard read
from that tap; text delivered through the attachment as a paste (bracketed
when the native tool asked for it, control sequences removed, no Enter); a
session-scoped image store under the dashboard home with a loopback upload
boundary reusing the launch attachment limits and wording; the absolute path
pasted as text; status-region feedback for nothing to paste, refused
clipboard access, server refusal and an attachment that cannot accept input;
documentation of the toolbar's new key. Excluded, as the seed records:
desktop image paste through the terminal's own paste event, pasting both text
and image from one clipboard, removal of pasted session images, native receipt
of the image, physical-device proof, host-specific key bindings, clipboard
injection on the Mac.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local gate: each slice runs its own specs and the consumers below
through `npm run test:dashboard -- <spec paths> --reporter=list`, then
`npm run lint` and `npm run typecheck:dashboard`; before
landing, `npm run test:dashboard` with Bash 5 first on PATH under
`caffeinate -s -i` on AC power
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)),
because the toolbar, the attachment input path and the status region are
shared surfaces every terminal journey passes through.

## Direction and PFE

- **Reuse the toolbar and the attachment offer.** `dashboard/src/TerminalKeyToolbar.tsx`
  already mounts coarse-pointer keys that keep the soft keyboard (pointerdown
  `preventDefault`) and call the attachment's `insert`; `dashboard/src/attachedTerminal.ts`
  owns that offer (`terminal.input`, false when nothing is attached). Paste
  adds a sibling `paste` offer on the same attachment that calls xterm's
  `terminal.paste`, which converts line breaks to `\r` and wraps the text in
  `\x1b[200~ … \x1b[201~` when the native tool enabled bracketed paste
  (`@xterm/xterm` 5.x `paste()`), then reaches the PTY on the same
  `{ input }` WebSocket frame.
- **Reuse dictation's text rule and feedback place.** `terminalDictationText`
  removes control sequences; the Paste text rule reuses that removal but
  keeps line breaks (a paste, not a dictated line). Feedback renders in the
  `terminal-status` region beside dictation's, through a hook shaped like
  `useTerminalDictation`, without a pending result: the clipboard still holds
  the content, so nothing is retained or replayed.
- **Reuse the launch attachment contract for images.** `dashboard/src/launchAttachments.ts`
  (types, 10 MB limit, refusal wording, `pasted.png` naming) and
  `dashboard/server/launchAttachmentClaims.ts` (`sanitizeName`, bounded raw
  body through `readBoundedRawBody`) already carry a phone screenshot to a
  file under the dashboard home and hand every host its absolute path. The
  session store is the same idea keyed by host and session id instead of
  attempt: `~/.open-dough/dashboard/session-attachments/<host>/<session>/<n>-<name>`.
  Machine-local operational state only (ADR 0008).
- **Reuse session admission.** `dashboard/server/terminalAdmission.ts`
  `admittedAttach` resolves `source`, `host` and `session` to a kept record
  through `recordedSession`; the upload boundary resolves the same query the
  same way inside the launch boundary middleware (`launchBoundaryPaths`),
  which already holds `launches`.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result |
| --- | --- | --- | --- |
| Headless Chromium with granted clipboard permissions reads `image/png` and `text/plain` through `navigator.clipboard.read()` from a button tap on a loopback origin | both slices' specs | scratch script with the integration checkout's `playwright` 1.63.0, `chromium.launch()`, contexts desktop and `devices["Pixel 7"]` + `hasTouch`, permissions `clipboard-read`/`clipboard-write`, `http://127.0.0.1:<port>`, 2026-11-05 | `ok image/png:88`, `ok text/plain:16` in both contexts |
| Chromium hands back a written PNG re-encoded, deterministically, and keeps `text/plain` beside `image/png` in one item | slice 2 stored-bytes assertion and image-wins case | same script shape with the `pngA` fixture bytes and a `text/plain` part, 2026-11-05 | `image/png 88` differs from `pngA`; second read identical to first; `text/plain 7` present. The spec compares the stored file with the bytes the page reads back, not with `pngA` |
| xterm's `paste()` converts `\r?\n` to `\r` and wraps in bracketed-paste markers when the application set mode 2004, then fires the data event the attachment forwards | slice 1 multi-line example | read `node_modules/@xterm/xterm/lib/xterm.mjs` (`Al`, `kl`, `triggerDataEvent` in the paste handler) in the integration checkout, 2026-11-05 | as stated; the fake attach must emit `\x1b[?2004h` for the bracketed case, which slice 1 adds as a control beside `attach-menu` |
| The synthetic `claude attach` echoes typed characters and the dashboard specs can grant clipboard permissions | both specs | `dashboard/tests/fixtures/fake-claude-attach.cjs` writes each typed key and `echo <line>` on Enter; `agent-launch-ad-hoc-attachments-paste.spec.ts` uses `test.use({ permissions: ["clipboard-read", "clipboard-write"] })`; `agent-terminal-touch-composer.spec.ts` observes sent frames with `noteTerminalTraffic` and a restarted server for the unavailable case | existing routes, reused as they are |
| The phone reaches the dashboard in a secure context, so `navigator.clipboard` exists there | the story's goal, no slice | `tailscale serve status`, `~/.open-dough/dashboard/tailscale/Caddyfile`, `lsof` on 4173 and 43128, 2026-11-05 | `https://territory.tailb878f6.ts.net` → Caddy 127.0.0.1:43128 → 127.0.0.1:4173 |

No unverified remainder bounds a slice. Whether each host reads a bare pasted
path as an image mid session is not a premise of this plan: the promised
outcome ends at the path at the prompt, as the seed records.

## Outside-in proof

| Seed example | Owning slice | Proof |
| --- | --- | --- |
| 1 text, 2 bracketed multi-line, 4 nothing to paste, 5 clipboard unavailable, 6 attachment cannot accept input, 8 desktop unchanged | 1 | `dashboard/tests/agent-terminal-touch-paste.spec.ts` (phone viewport, `hasTouch`, clipboard permissions); desktop absence is the existing toolbar-absence assertion in `agent-terminal-touch-keys.spec.ts` |
| 3 image, image wins over text, 7 image refused | 2 | `agent-terminal-touch-paste-image.spec.ts`, with the server refusal shown through a `page.route` fulfilment of the upload endpoint; `dashboard/tests/boundary/session-attachment-boundary.spec.ts` for the server's own refusals and store |

## Execution context

- Story Branch Mode, owned workspace `.worktrees/paste-from-the-mobile-keyboard`
  on `codex/paste-from-the-mobile-keyboard`, publisher
  `dashboard-territory.local-open-dough`, agent `ebacky-chan`.
- Start `5d6a7bb4e1560d36c89b731d7e36dc7f6a01dfa1`. Claim
  `a951e7c226aaf0e18e9f294e33f0c18383df9257` accepted on
  `origin/main` and published as the execution branch base.
- GitHub Actions `ci.yml`, story branch push. Codex observer
  `codex-paste-mobile-314dcf99`, mailbox `/tmp/dough-ci-501/watch-z1QQA9`,
  PID 38783, stream session 84913, cell `g2:8`.
- Replanning retains the plan's existing authority. Locked install via
  `node scripts/setup-native.mjs npm` and the checkout's
  `npm run typecheck:dashboard` passed.
- Locked xterm is 6.0.0. The text journey observes its bracketed-paste
  behavior through the attachment.

## Slices

### 1. Paste key delivers clipboard text as one terminal paste
Type: Behavior
Status: done

CI repair for run 41959816141, attempt 1, dashboard shard 3. The headless
Linux shortcut delivered a paste event with an empty clipboard payload.
The desktop journey now supplies the browser paste event at the focused
xterm textarea, and still checks the hidden toolbar, exact wire input,
prompt echo and no submission. The launch composer journey independently
exercises the browser shortcut. This test-only change is within the prior
refactor's terminal input and consumer trace.

`PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch-keys.spec.ts agent-terminal-touch-paste.spec.ts agent-launch-ad-hoc-attachments-paste.spec.ts --reporter=list`
passed 7 checks in 16.6s. The observer owns the Linux result.
Proof: `agent-terminal-touch-paste.spec.ts`, text cases; consumers
`agent-terminal-touch-keys.spec.ts`, `agent-terminal-touch-composer.spec.ts`,
`agent-terminal-touch-keyboard-fit.spec.ts`, `agent-terminal-touch.spec.ts`
stay green.

Behavior: a session's terminal is shown on a phone and attached, the
clipboard holds text → tap **Paste** (visible beside Enter without expanding
More, 44px target, soft keyboard kept) → the attachment sends exactly that
text as one paste on the `{ input }` path with no `\r` appended, the fake's
screen shows it at the prompt unsubmitted, xterm's textarea keeps focus. With
the fake's new bracketed-paste control on and two lines in the clipboard, the
one sent frame is `\x1b[200~first\rsecond\x1b[201~`. An empty clipboard
sends nothing and the status region says there was nothing to paste; a
refused read (the spec revokes clipboard permission, or the API is absent)
sends nothing and the status region points to Compose with the keyboard's
own Paste; a disconnected attachment (server closed, as the composer spec
does) sends nothing, the status region says to reconnect and tap Paste again,
and reconnecting replays nothing.

Steps: add the `paste` offer to `attachedTerminal.ts` and thread it beside
`insert` through `useAttachedTerminal.ts` and `Terminal.tsx`; a
`useTerminalPaste` hook owns the clipboard read (`navigator.clipboard.read()`,
text when no accepted image), the control-sequence removal that keeps line
breaks, and the status lines; the toolbar's trailing group gets the Paste
key; the fake attach gains an `attach-bracketed-paste` control
(`fakeClaudeControls.ts` flag) that emits `\x1b[?2004h` with the prompt;
update the touch paragraph of
`dashboard/AGENT-LAUNCH-TERMINALS.md` and the toolbar sentence in
`docs/dashboard-navigation.md`.

Accepted observations are mapped in [source review](source-review.md).
Both focused commands ran with Bash 5 first on PATH, with the launch's
inherited Git alternates still set in the parent shell:

```sh
PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch-paste.spec.ts agent-terminal-touch-keys.spec.ts agent-terminal-touch-composer.spec.ts agent-terminal-touch-keyboard-fit.spec.ts agent-terminal-touch.spec.ts boundary/terminal-dictation.spec.ts session-terminal-voice.spec.ts session-terminal-voice-lifecycle.spec.ts session-terminal-voice-recovery.spec.ts agent-terminal-cursor-page.spec.ts agent-terminal-theme.spec.ts --reporter=list
PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-lifetime.spec.ts agent-terminal-codex-page.spec.ts boundary/proof-record-entry.spec.ts --reporter=list
```

Results: 23 passed in 40.6s and 5 passed in 19.0s. The first attempted run
failed before test selection because inherited alternate Git objects made the
fixture clone incomplete. The Playwright config now clears inherited Git
repository paths before admission, matching the shell runner's isolation.
The toolbar's primary keys scroll separately so the visible trailing group
does not cover an arrow's touch target. The journey drives the swipe and the
arrows without losing focus. Dictation shares escape removal, with its
existing line and control treatment proved by its boundary and voice journeys.

Independent refactoring moved the dictation and phone-input documentation to
`dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md`, preserving the parent terminal
documentation's links and anchors. No code, configuration or test changed in
that pass. Both focused results remain applicable.

The formatter identified the async React callback and computed environment
deletes. Both mechanical repairs stay within the accepted refactor trace.
`PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch-paste.spec.ts boundary/proof-record-entry.spec.ts --reporter=list`
passed 5 checks in 14.2s after the repair.

Guarded delivery completed selective formatting, lint and typecheck and
published `c039115b5c8253a3ec3530cb7548b354fde750a0` to
`origin/codex/paste-from-the-mobile-keyboard` over the published claim. It
reused the retained observer.

### 2. Paste key delivers a clipboard image as a stored file's path
Type: Behavior
Status: done
Proof: `agent-terminal-touch-paste-image.spec.ts`;
`dashboard/tests/boundary/session-attachment-boundary.spec.ts`;
`boundary/launch-attachment-boundary.spec.ts` and
`agent-launch-ad-hoc-attachments-paste.spec.ts` stay green after the shared
helper extraction.

Behavior: the clipboard holds a PNG → tap **Paste** → the page posts the
bytes as one bounded raw body to the session upload endpoint
(`/__agent-terminal/attachments?source=&host=&session=`, name header
`pasted.png`), the server stores them unchanged under
`session-attachments/<host>/<session>/1-pasted.png` in the machine dashboard
home and answers the absolute path, the attachment pastes that path with no
`\r`, and the status region says the image was pasted as that file. A
clipboard with both `text/plain` and `image/png` pastes the path only. A
server refusal (route fulfilled with 413 and the too-large wording) pastes
nothing, shows that wording, and leaves the terminal attached. At the
boundary: a body over 10 MB answers 413 with `launchAttachmentTooLarge`, a
non-image type 415 with `launchAttachmentUnsupportedType`, an empty body 400
with `launchAttachmentEmpty`, an unknown or unavailable session is refused
before any write, and none of these leaves a folder; a second paste into the
same session stores `2-pasted.png` beside the first.

Steps: extract the name sanitizing and type/limit checks that
`launchAttachmentClaims.ts` and the new store share into one module; add
`dashboard/server/sessionAttachments.ts` (store path, write, numbering) and
the POST boundary inside the launch boundary middleware, admitting the
session as `admittedAttach` does (`verifyLocalOrigin`, `knownSource`,
`recordedSession`); the paste hook prefers an accepted image item, posts it,
and pastes the answered path; extend the touch paragraph of
`dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md` with the image path hand-off and name
the store beside the launch attachment folder in `dashboard/AGENT-LAUNCH.md`.

Accepted observations are mapped in [source review](source-review.md).
The image and text journeys share setup and remain separate specs. Browser
proof observes the raw PNG POST, stored bytes, a single path-only frame,
mixed clipboard precedence, and a real over-limit clipboard PNG with the
page wired to the server's refusal shape. The boundary checks the real
413 response for 12 MiB, unsafe origin, method, unsupported and empty
bodies, unknown and unavailable sessions, ordered and overlapping writes,
storage failure and path-safe opaque IDs.

```sh
PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch-paste.spec.ts agent-terminal-touch-paste-image.spec.ts boundary/session-attachment-boundary.spec.ts boundary/launch-attachment-boundary.spec.ts agent-launch-ad-hoc-attachments-paste.spec.ts boundary/agent-terminal-boundary.spec.ts boundary/agent-terminal-codex.spec.ts boundary/serving-modes.spec.ts --reporter=list
PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- agent-terminal-touch-paste.spec.ts agent-terminal-touch-paste-image.spec.ts boundary/session-attachment-boundary.spec.ts boundary/launch-attachment-refusals.spec.ts agent-launch-ad-hoc-attachments.spec.ts agent-launch-ad-hoc-attachments-refusal.spec.ts agent-launch-ad-hoc-attachments-cancel.spec.ts agent-launch-ad-hoc-attachments-codex.spec.ts agent-launch-ad-hoc-attachments-cursor.spec.ts agent-launch-ad-hoc-attachments-continuation.spec.ts agent-launch-start-session-existing-changes-attachments.spec.ts agent-launch-story-attachments.spec.ts agent-terminal-codex-page.spec.ts agent-terminal-cursor-page.spec.ts --reporter=list
```

The first run passed 38 checks in 19.6s. After the desktop-only CI repair,
the expanded run passed 26 checks in 28.7s. The repair
`6ab56f9d621e710598a4c50ba5bfaa94b6d33fd3` was published over the text
increment and registered with the same observer. Slice 2 changes were
restored without conflict. The launch upload, WebSocket admission and
serving-mode observations from the first run stayed applicable.

Independent refactoring found no candidate and made no edits. It verified
that the binary read and filename rules are shared, that launch claims and
stored session images have separate lifecycles, and that the captured
attachment is checked again before sending the returned path. Shard preview
included the text, image and session attachment boundary specs.

The formatter identified one direct mutation through a fixture parameter.
The test now follows the existing Codex boundary fixture convention. This
mechanical change stays within the independent review's trace.
`PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- boundary/session-attachment-boundary.spec.ts --reporter=list`
passed all four cases in 4.8s.

Guarded delivery passed formatting, lint and typecheck. It published
`d762f1bca746e05e22175247a4e47925d2c8438e` over the desktop CI repair and
registered the accepted revision with the story-branch observer.

The full local gate requested admission at 03:23:43 UTC on the AC-powered
16-core Mac with Bash 5.3.20. It runs the unfiltered dashboard suite with four
workers under the macOS guard. At launch the machine had 52% idle CPU and
about 3.9 GB unused with another worktree's full suite and a focused run
active. The maintained admission serializes full suites, so the runs do not
share their worker load. Reconsider if the workload changes or the run
reports resource pressure.

## Current decisions

- One `paste` offer for both text and the image path, so the terminal's
  bracketed-paste handling applies uniformly; `insert` stays for toolbar
  sequences, Compose and dictation.
- No pending state for a failed paste: the clipboard is the retained copy.
- The store is keyed by host and session id, not launch attempt, because
  launch records do not carry their attempt id and a session outlives its
  attempt's retention; removal stays deferred as the seed records.
- The stored-bytes assertion compares with the clipboard bytes the page reads
  back, since Chromium re-encodes written PNGs.

## Concern evidence

Slice-plan refinement not needed: two Behavior slices with one proof loop
each, text before image so the toolbar key, attachment offer and feedback
exist before the store; the shared helper extraction is slice 2's own
cleanup, not hidden preparation. This review identified no remaining
slice-specific concern.

## Execution complete

Product advice: no change. The delivered phone paste uses the existing
terminal input and launch image contracts. The browser journeys retain
integrated proof of the tap, clipboard handling and terminal input. The
HTTP boundary owns the refusal and storage variants. No new queue work is
supported by the outcome.

The review covered `c039115b5c8253a3ec3530cb7548b354fde750a0` for text,
`6ab56f9d621e710598a4c50ba5bfaa94b6d33fd3` for the desktop test repair,
and `d762f1bca746e05e22175247a4e47925d2c8438e` for images. The Take and
preparation establish provenance. No unrelated trunk work is attributed.
ADR 0008 governs machine-local files and loopback admission, and ADR 0001
governs the session and terminal vocabulary. The process review found no
unsettled finding after the Git fixture isolation and desktop test repairs.

The repair-only run 41960710815 was superseded by the image publication
under the same branch's concurrency group. Its recorded job conclusions
were success or cancelled. Completion followed the image revision. The story-branch completion receipt
for `670e9cedf63a548e424a35f7519a5f7d36655790` confirmed the applicable
image revision passed and the observer shut down with no unread events.

The full pre-landing dashboard gate passed on
`d762f1bca746e05e22175247a4e47925d2c8438e`.
`PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm run test:dashboard -- --workers=4`
exited 0 with the normal strict reporter. The runner acquired admission and
started the unfiltered suite at 03:27:36 UTC on AC power.
