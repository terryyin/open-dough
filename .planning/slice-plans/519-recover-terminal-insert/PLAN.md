# Recover dictation and Paste in the embedded terminal

**Identity:** SEED-269#recover-terminal-insert

**Source:** [Refined story](../../seeds/SEED-269-recover-terminal-insert.md#recover-terminal-insert)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer on a phone can insert dictated or pasted text whenever the
embedded terminal already accepts their typing, and recovers from an
attachment that cannot accept it with feedback naming the recovery the panel
actually offers, without losing a completed transcript.

Included: one input-acceptance rule (current, open, not refused attachment)
for dictation, **Insert transcript**, toolbar **Paste** (text and image path),
composer **Insert**, and toolbar keys; state-matching unavailability feedback
for dictation and Paste; the terminal input guide.

Excluded (seed scope limits): diagnosing or changing when readiness is
confirmed for reopening; feedback for toolbar keys on a closed attachment;
retaining a transcript after it was offered.

## Current decisions

- Input acceptance in [the attachment](../../../dashboard/src/attachedTerminal.ts)
  drops the readiness-confirmation (`shown`) condition and keeps `current`,
  `!refused`, and an open socket — the condition typing already meets. The
  `shown` flag keeps announcing `onAttached`. Server readiness admission,
  done-mark reopening, and close classification stay unchanged; no protocol,
  server, or host change.
- Unavailability feedback is derived from the panel's own state rather than a
  fixed “Reconnect” sentence: it names the shown **Reconnect** or **Open
  again** action after an ending or refusal, and says the terminal is still
  connecting before the socket opens. Clipboard-read failure keeps its own
  Compose guidance.
- Test data follows [test automation](../../../AGENTS.md#test-automation):
  arrange records and sessions through the existing launch helpers and MakeMe
  builders; no sleeps, default timeouts.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  applies without conflict; the change stays within a local session
  capability.

## Outside-in proof

| Seed example | Owner | Required observation |
| --- | --- | --- |
| 1. Dictation on a visible prompt | Slice 1 | Real page voice journey on a terminal whose readiness stays pending with an open socket: the transcript reaches the native process once with no **Unsent transcript** panel; nothing is submitted until Enter. |
| 2. Paste on the same screen | Slice 1 | Phone page, Codex fixture `partial` mode: toolbar **Paste** then toolbar **Enter** records the pasted text once in the fixture's submitted lines; no reconnect feedback. |
| 3. Toolbar key while pending | Slice 1 | Same journey: toolbar **Esc** reaches the fixture and completes the held frame. |
| 4. Done mark unchanged by input | Slice 1 | Same journey on a done record: after Paste the done mark is still set; it clears only after Esc completes the ready frame. Keep the existing held-frame test in [agent-terminal-codex-page.spec.ts](../../../dashboard/tests/terminals/agent-terminal-codex-page.spec.ts). |
| 5. Attachment ended | Slice 2 | Ended terminal showing **Open again**: a completed transcript stays pending with feedback naming **Open again**; Paste feedback names it too; reopening sends nothing; **Insert transcript** then sends once. Existing disconnect journeys keep **Reconnect** wording in [session-terminal-voice-recovery.spec.ts](../../../dashboard/tests/terminals/session-terminal-voice-recovery.spec.ts) and [agent-terminal-touch-paste.spec.ts](../../../dashboard/tests/terminals/agent-terminal-touch-paste.spec.ts). |
| 6. Clipboard unreadable | Slice 2 (preserve) | Existing unreadable-clipboard assertion in agent-terminal-touch-paste.spec.ts stays green with its Compose guidance. |

## Decisive premises

Observed in this owned worktree at `dc25b93aa` on 2026-11-08 (macOS on AC,
Node 24.21.0, ordinary Chromium preview profile through
`npx playwright test --config dashboard/playwright.config.ts … --reporter=list`
with `NO_COLOR`, `FORCE_COLOR`, and `GIT_ALTERNATE_OBJECT_DIRECTORIES`
unset). Product paths are unchanged since the seed's reproduction at
`d328aea8f`.

- **Symptom (examples 2–4).** A scratch phone spec copied from the held-frame
  test (Codex fixture `partial`, done record, phone touch context with
  clipboard permissions) tapped toolbar **Paste** at the unchanged revision:
  status read “Reconnect to the terminal, then tap Paste again.” and nothing
  was sent. Toolbar presses were dispatched as clicks because the copied
  desktop journey placed the panel where touch hit-testing fails; the final
  spec must use the phone journey's ordinary taps.
- **Remedy (examples 2–4).** With only `shown &&` removed from
  `acceptsInput`, the same scratch spec passed: Paste + Enter put the text in
  the fixture's submitted lines, the done mark stayed set after Paste, and
  toolbar **Esc** completed the frame and cleared it. This also confirms the
  server forwards page input before admission.
- **Consumers.** With the same scratch change, `dashboard/tests/terminals`
  and `dashboard/tests/sessions` passed 250/250 (6.8 min, load ≈5–7). No
  existing test depends on refusing insertion while readiness is pending;
  none yet proves the new behavior. Scratch edit and spec were reverted.
- **Dictation (example 1)** reaches the same `insert` function as composer
  Insert and toolbar keys (`useTerminalDictation` → `insertText` →
  attachment `insert`), so the remedy observation covers its acceptance. Its
  page proof route is not yet chosen: the [voice journey support](../../../dashboard/tests/support/terminalVoicePage.ts)
  opens Claude sessions, which admit immediately. Slice 1 either opens the
  voice journey on the Codex `partial` fixture or substitutes the page's
  terminal socket with the existing WebSocket routing used in
  [frontend service substitutes](../../../dashboard/tests/support/frontendServiceSubstitutes.ts)
  to keep readiness at `observe`. This affects only proof sizing, not the
  approach.

## Local gates

Follow [test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. On a fully awake Mac on AC, run under `caffeinate -s -i`; on
battery, plug in or start fully awake with the lid open under `caffeinate -i`
and inspect the sleep log afterward. See
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

Run `npm run typecheck:dashboard` and `npm run lint`. The changed acceptance
is shared by every terminal input journey, so each slice runs the terminal and
session families (`dashboard/tests/terminals`, `dashboard/tests/sessions`;
about 7 minutes locally) rather than hand-picked specs, plus any consumer the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
lists outside them (supply `--term` for “Reconnect to the terminal” and “was
not inserted” in Slice 2).

## Slices

### 1. Text input works on a visible prompt before readiness is confirmed

**Type:** Behavior

**Status:** done

Given a Codex attachment whose socket is open and whose readiness is still
pending, dictation, toolbar **Paste**, composer **Insert**, and toolbar keys
each reach the native session once; submission still needs Enter; the done
mark is unchanged until the server confirms readiness. Change
`acceptsInput` as decided. Add a phone page spec owning examples 1–4
(capability-named, for example
`agent-terminal-pending-readiness-input.spec.ts`), using the phone journey's
ordinary taps. Update the [terminal input guide](../../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md)
where it says an attachment cannot accept input. Safe stopping point.

**Accepted proof (2026-11-08, load ≈8–10).** New
`dashboard/tests/terminals/agent-terminal-pending-readiness-input.spec.ts`
(voice fixture extended with the exported `codexProtocol` fixture, Codex
`partial`, done record, phone taps) passes 5/5 repeats and fails at the
dictation step with `shown &&` restored. Terminal and session families plus
the touch-paste-image frontend spec and `agent-launch-codex.spec.ts`: 253
passed. The `codexProtocol` move reaches `dashboard/tests/launches`,
`dashboard/tests/review` and `dashboard/backend-tests`: 1332 passed, 1
skipped. Typecheck and lint pass. Refactor pass: doc rewrap only.

**Learning.** The fake Codex echoes nothing until Enter: observe offers
through `noteTerminalTraffic` input frames and `codexLines`, not rows text.
The Recently done section header is a ~23px disclosure row, so it is tapped
with `locator.tap()` rather than `tapWhereShown`.

### 2. Unavailable input names the panel's recovery

**Type:** Behavior

**Status:** planned

Given an attachment that cannot accept input, dictation's pending-transcript
feedback and Paste's feedback name the action the panel shows (**Reconnect**
or **Open again**), or that the terminal is still connecting; reopening sends
nothing; clipboard-read failure keeps Compose guidance. Prove example 5 on the
ended-terminal path and keep the existing disconnect and unreadable-clipboard
assertions. Update the input guide's reconnect wording to match.

## Preparation review

Slice-plan refinement was not needed: the two slices are independent
observable outcomes on one shared rule, each with its own proof, and both are
small. No remaining slice-specific concern; the dictation proof route is a
sizing choice inside Slice 1 bounded by two available routes.
