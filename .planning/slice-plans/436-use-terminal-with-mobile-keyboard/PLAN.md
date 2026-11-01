# Use the dashboard terminal with a mobile keyboard

**Identity:** SEED-212#use-terminal-with-mobile-keyboard
**Source:** [selected story](../../seeds/SEED-212-mobile-terminal-input.md#use-terminal-with-mobile-keyboard).

## Goal and scope

On a phone (iPhone / coarse-pointer Soft-keyboard use), the Side panel’s live
attached terminal stays operable without a physical keyboard: a touch key
toolbar supplies Esc, Tab, arrows, Enter, and expandable Ctrl+C; swipes read
history without moving option menus; an optional text composer Inserts longer
drafts without submitting them; the panel fits the visible area when the soft
keyboard opens, closes, or the device rotates. Direct typing remains available.
Desktop hardware-keyboard behavior is unchanged. Host-specific menu parsing, a
new terminal engine, sticky modifiers, long-press repeat, buffer text-selection
overlays, and application-wheel input stay out of scope.

## Existing solutions and decisions

PFE:

- **Live attachment and insert.** Keep
  `dashboard/src/attachedTerminal.ts` / `useAttachedTerminal.ts`. Toolbar keys
  and composer Insert are additional producers on the same `onData` → WebSocket
  → PTY path. Reuse `insert(text)` (`terminal.input(text)` with no trailing
  Enter) already used by `useTerminalDictation.tsx`; reuse its pending-draft /
  deliberate-retry pattern for an unavailable attachment.
- **Touch history scroll.** Keep `listenToTerminalTouchScroll` in
  `terminalTouchScroll.ts` (`scrollLines` only). Do not rewire swipe into key
  sequences. Extend
  `dashboard/tests/agent-terminal-touch.spec.ts` /
  `touchTerminalPage.ts` / `noteTerminalTraffic` for toolbar and
  scroll-vs-navigate proof.
- **Terminal chrome.** Add toolbar and composer inside the existing Terminal
  Side panel view (`Terminal.tsx`, `agent-terminal.css`), gated by coarse
  pointer the way other dashboard touch chrome uses `@media (any-pointer:
  coarse)`. Follow 44px targets and accessible names from
  `docs/dashboard-navigation.md`. No Board or Sessions sidebar changes.
- **Keyboard-aware fit.** No existing `visualViewport` use. Fit the Side panel
  terminal region to the visible area when the soft keyboard changes height;
  provide hide-keyboard. Presentation only under ADR 0008 Side panel / terminal
  contents — no new ADR or North Star topic.
- **Borrowed pattern.** Blink-style accessory keys: inject sequences while
  preserving soft-keyboard focus (`preventDefault` on toolbar pointerdown so
  xterm’s textarea keeps focus).

Applicable Accepted decisions: [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(Side panel holds the terminal; layout mechanics are presentation). No conflict.
ADR 0007 / 0009 remain Proposed and unbound here.

## Outside-in proof

| Story promise / example | Slice | Observable proof |
| --- | --- | --- |
| Observe current iPhone typing / menu / scroll failures before locking IME details | 1 | Developer-operated physical iPhone Safari record of the pre-change symptoms (iOS version, keyboard shown/hidden, host/application, orientation); shapes slices 2–4 if direct typing or focus retention needs a different approach |
| Tap Down twice + Enter selects a menu option; Esc cancels; Tab / Left / Right edit; Ctrl+C interrupts; keyboard visibility preserved | 2 | New or extended phone-viewport Playwright journey on the real browser→xterm→WebSocket→PTY path: toolbar buttons send the expected input bytes; option-menu fixture moves; focus stays on the terminal textarea after toolbar taps; expandable Ctrl+C present |
| Swipe scrolls history without changing sent input or menu selection; arrows navigate without relying on swipe | 2 | Same journey: swipe changes visible scrollback with `sent` unchanged (as today’s touch-scroll step); with a menu prompt, arrows change selection while swipe does not |
| Composer Insert places text once without Enter; deliberate Enter submits; unavailable attachment keeps draft for retry, never auto-replays | 3 | Playwright: composer Insert equals transcript-style insert (text in `sent` without `\r`); Enter afterward submits; disconnect/reconnect keeps draft until deliberate Insert |
| Soft keyboard open/hide and rotate: fit, controls reachable, attachment and unsent draft survive | 4 | Phone viewport + simulated visualViewport / reduced height / orientation cases: toolbar, composer actions, Close reachable; Close not required to re-fit; draft retained across rotate |
| Desktop hardware keyboard, dictation, ordinary scroll unchanged | 2–4 | Existing `agent-terminal-touch`, voice, and desktop terminal specs stay green; no toolbar on fine-pointer desktop |
| Physical iPhone Safari acceptance of the finished chrome | 5 | Developer-operated observation after slices 2–4: same fields as slice 1, against the shipped toolbar/composer/fit; desktop emulation alone does not close |

## Ordered slices

### 1. Observe current iPhone soft-keyboard and menu-input failures
Type: Behavior
Status: planned
Proof: Developer-operated early probe on physical iPhone Safari against the
current dashboard (pre-toolbar). Record iOS version, soft keyboard
shown/hidden, host/application under test, orientation, and what fails for
typing, scrolling, and option-menu navigation. Failure or a surprising IME
detail stops dependent slices and revises their approach in this plan before
implementation continues.

```
Behavior: current phone dashboard open with a live terminal → developer
exercises typing, swipe, and a menu that needs arrows → recorded symptoms
distinguish scrollback vs missing keys vs corrupted typing, and name any IME
constraint slices 2–4 must respect
```

### 2. Phone key toolbar and scroll-versus-navigate
Type: Behavior
Status: planned
Proof: Phone-viewport Playwright on the real attachment path; toolbar input
bytes and menu selection; swipe leaves `sent` unchanged; existing touch and
desktop terminal neighbors remain green.

```
Behavior: coarse-pointer terminal open → tap toolbar Esc/Tab/arrows/Enter and
expandable Ctrl+C; swipe history; use arrows on an option menu → PTY receives
the matching sequences; soft-keyboard focus is not dismissed by toolbar taps;
swipe moves scrollback only; menu selection moves only from arrows; Close and
session identity remain reachable
```

### 3. Optional composer Insert without submit
Type: Behavior
Status: planned
Proof: Playwright composer Insert / Enter / unavailable-attachment draft cases
on the phone viewport; dictation insert path still works.

```
Behavior: composer draft ready on an attached (or reconnecting) terminal →
Insert, then deliberate Enter; or Insert while detached then after reconnect →
draft text reaches the terminal once without trailing Enter; Enter submits;
unsent draft survives unavailable attachment and is never auto-replayed;
direct typing remains available
```

### 4. Fit the terminal to the soft keyboard and orientation
Type: Behavior
Status: planned
Proof: Phone viewport reduced-height / orientation / hide-keyboard cases;
controls reachable; attachment and composer draft survive; desktop layout
unaffected.

```
Behavior: terminal open on phone → soft keyboard opens or hides, or device
rotates; user uses hide-keyboard → terminal, toolbar, and composer actions fit
the visible area; Close stays reachable; attachment, typed input, and unsent
draft survive without reconnect solely to re-fit
```

### 5. Physical iPhone Safari acceptance of the finished chrome
Type: Behavior
Status: planned
Proof: Developer-operated observation after slices 2–4. Record iOS version,
keyboard, host/application, keyboard visibility, and orientation against the
key examples (menu arrows, toolbar with keyboard up, short direct typing,
composer Insert, swipe vs arrows, fit/rotate). The 2026-10-13 Chromium mobile
observation does not close this gate.

```
Behavior: finished phone terminal chrome on physical iPhone Safari → developer
walks the story’s key examples → recorded pass/fail per example; a fail stops
completion and returns to the owning slice’s repair
```

## Decisive premises

- **`insert(text)` sends data without Enter.** Observation: read
  `attachedTerminal.ts` `insert` → `terminal.input(text)` only; voice recovery
  spec expects `sent` to equal `[transcript]` after Insert before a later
  Enter. Settled for the API contract. Playwright re-run of that route needs a
  worktree `npm` install (absent here); slice 3’s focused proof owns the
  composer discrimination after install.
- **Current touch scroll does not send PTY input.** Observation: read
  `terminalTouchScroll.ts` (`scrollLines` + `preventDefault`);
  `agent-terminal-touch.spec.ts` asserts `sent` unchanged across swipe.
  Settled as the behavior to preserve. Re-run after install is slice 2’s
  regression neighbor.
- **iOS soft-keyboard visibility and predictive-IME typing on this dashboard.**
  Unsettled without a physical device. Bounded by early probe slice 1 (symptoms)
  and acceptance slice 5 (finished chrome). Failure revises slices 2–4.
- **`visualViewport` (or equivalent) can drive Side panel fit without breaking
  covering layout.** Unsettled until slice 4 implements and proves it; no
  current product use. Approach hypothesis only; slice 4 owns the observation.

## Current decisions

- One backlog story; delivery order is toolbar + scroll/navigate, then
  composer, then keyboard-fit, with physical observation before locking IME
  details and again for acceptance.
- Coarse-pointer media query shows the new chrome; fine-pointer desktop keeps
  today’s terminal chrome.
- No sticky Ctrl/Alt, long-press repeat, or buffer selection overlay in this
  plan.

## Concern evidence

Refinement not needed: five Behavior slices are ordered proof loops over one
Side-panel mobile-input model (toolbar producers, preserved scroll handler,
composer via existing insert, viewport fit, device gate), not accumulating
special-case recognizers. Interim absence of composer until slice 3 and of
viewport fit until slice 4 is an accepted delivery order from the story, not a
remaining concern.

No remaining slice-specific concern identified in this review beyond the
authorized early-probe / acceptance device observations named in slices 1 and 5.
