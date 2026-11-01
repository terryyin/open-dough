---
id: SEED-212
status: active
planted: 2026-11-01
planted_during: Terry Yin's report of iPhone keyboard and terminal menu difficulties
scope: story
---

# Operate the dashboard terminal from a phone

<a id="use-terminal-with-mobile-keyboard"></a>

### Use the dashboard terminal with a mobile keyboard

**Identity:** SEED-212#use-terminal-with-mobile-keyboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/436-use-terminal-with-mobile-keyboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"872bf0589ab499f32ff519ca59f0291ff7aad3f13a1527214db3d94361ae5ded","plan":"511d18ea7ee3eb4d0a0c8b3ffbcc408c5d423ea4f78986f869ad0451c66482fd"}}
```

**Beneficiary:** A developer using the dashboard's embedded terminal from an
iPhone or another touch device with an on-screen keyboard.

**Goal:** From the Side panel's live attached terminal on a phone, the developer
can read output, enter and edit instructions, navigate interactive option menus,
and submit or cancel input without a physical keyboard—comfortably enough that
phone use is a practical way to drive the same native session the desktop uses.

**Selected direction:** Keep the existing xterm.js attachment and its live
native session and input path. Add mobile controls around it: a touch key
toolbar for missing control keys, reliable history scrolling distinct from
application navigation, an optional ordinary-text composer for longer drafts,
and layout that fits the visible area when the soft keyboard opens or closes.
No replacement terminal engine and no separate mobile app.

**Alternatives considered (explore / borrow):**

| Option | Why not selected |
| --- | --- |
| Fix touch scroll only; rely on the soft keyboard | Fails the purpose: phones supply no Esc/Tab/arrows for option menus and line editing. |
| Full on-page virtual keyboard replacing the phone IME | Heavier, fights autocorrect and dictation, and is worse for longer instructions. |
| Replace xterm with a DOM/textarea “terminal” | Would redo attachment, replay, readiness, and host clients; out of proportion to the missing keys and scroll confusion. |
| Blink-style Smart Keys alone (borrowed mechanism) | The accessory bar maps well (inject terminal sequences while the soft keyboard stays up), but alone it does not give native selection, autocorrection, or dictation for longer drafts—hence the composer beside the toolbar. |

**Challenge:** The purpose is operable phone control of the live session, not
“a toolbar exists.” Meeting the wording with keys that never reach the PTY, or
with swipes that move menus instead of history, would miss it. The strongest
remaining doubt is that short direct typing into xterm’s hidden textarea can
still mis-behave under iOS predictive IME even after the toolbar and composer
land; the composer mitigates longer drafts. On 2026-11-01 the developer waived
physical iPhone Safari observation for this story; phone-viewport automated
proof stands in for the device gate. That risk does not change the selected
outcome: keep direct typing and the composer both in scope.

**Scope:**

- **Touch key toolbar** reachable above the on-screen keyboard on coarse-pointer
  / soft-keyboard phone use of the terminal: **Esc**, **Tab**, **Up**, **Down**,
  **Left**, **Right**, and **Enter**. Less frequent controls, including
  **Ctrl+C**, live in an expandable section. Activating a key sends the
  corresponding input on the existing terminal → WebSocket → PTY path and keeps
  the soft keyboard’s current visibility (neither dismissing nor forcing it
  open). Desktop hardware-keyboard and existing special-key behavior stay as
  they are.
- **Optional text composer** for longer instructions: edit with the phone’s
  native selection, autocorrection, and dictation; deliberately **Insert** into
  the current terminal. Insertion and **Enter** are separate: Insert must not
  submit or execute the draft; a deliberate Enter submits. Direct terminal
  typing remains available. When the attachment cannot accept input, the unsent
  draft stays for a deliberate retry and is never auto-replayed. The existing
  attachment `insert` path (already used by dictation) is the insertion
  mechanism to reuse.
- **Reading vs application control:** one-finger swipe moves terminal
  scrollback history only (`scrollLines`); it must not send Up/Down or move an
  option-menu selection. Toolbar arrows navigate menus and move the application
  cursor. Application-internal scrolling that needs wheel or host-specific input
  is out of this story’s delivery; do not confuse it with terminal scrollback.
- **Keyboard-aware layout:** fit the terminal, toolbar, and composer actions to
  the area visible when the soft keyboard opens, closes, or the device rotates.
  Provide an explicit hide-keyboard control. Toolbar, composer actions, and
  Close stay reachable at reduced height. The current attachment, typed input,
  and unsent composer draft survive; no reconnect or relaunch is required only
  to fit the panel.
- **Proof:** Cover stable behavior with proportionate automated checks on the
  real browser → terminal → PTY path for text, special keys, and interactive
  selection, including phone-viewport journeys. Physical iPhone Safari
  observation is waived for this story (developer, 2026-11-01); desktop
  phone-viewport automation closes the device-shaped gate. Apply the
  repository’s
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Scope limits (deferred promises, not rejections):**

- Sticky Ctrl/Alt modifiers (tap modifier, then a letter); dedicated **Ctrl+C**
  is enough for this increment.
- Long-press key repeat on toolbar arrows.
- A general touch text-selection / copy overlay over the terminal buffer.
- Synthetic wheel or host-specific parsing for application-internal scrollers.
- A new terminal engine, separate mobile app, or second session path.

**Required restrictions:**

- Toolbar activation must not steal focus in a way that dismisses the soft
  keyboard when it was shown, or trigger unrelated dashboard shortcuts.
- Composer **Insert** must not append a trailing Enter or otherwise submit the
  draft.
- Swipe-to-scroll must not emit navigation key sequences.
- New controls follow the dashboard’s existing accessible names and 44px
  touch-target convention for coarse pointers
  ([navigation guidance](../../docs/dashboard-navigation.md)).

**Key examples:**

- An interactive terminal prompt offers several options. On an iPhone without
  physical arrow keys, tap Down twice and Enter: the application moves twice
  and confirms the intended option. Esc cancels where the application supports
  it. These keys work with the phone keyboard shown or hidden.
- With the keyboard open, use Tab for completion and Left/Right to edit the
  line; tapping the toolbar does not hide the keyboard, lose the input, or
  trigger a dashboard shortcut. Expand the additional controls and send Ctrl+C
  to interrupt the foreground application.
- Type, backspace, and submit short input directly with the on-screen keyboard.
  Composition, cursor movement, and deletion produce the intended input without
  missing, repeated, or corrupted text.
- Write a longer instruction in the composer, revise it with native selection
  and dictation, and tap Insert. The intended text reaches the current terminal
  once and remains available for review there; no trailing Enter or draft line
  break accidentally submits it. Press Enter deliberately to submit. An
  unavailable attachment keeps the unsent draft for a deliberate retry and never
  automatically replays inserted text.
- Swipe through earlier terminal output and back to the latest output without
  moving an option-menu selection. When the foreground application presents an
  option menu, use the arrows without relying on a swipe to behave as Up or
  Down. Text editing and terminal input remain usable after scrolling.
- Open and hide the keyboard, then rotate between portrait and landscape. The
  current terminal attachment, input, and unsent composer draft survive;
  toolbar, composer actions, and Close remain reachable within the visible area.
  No reconnect or relaunch is needed only to fit the terminal.
- Desktop hardware-keyboard typing, terminal special keys, existing dictation,
  and ordinary terminal scrolling retain their current behavior.

**UI:** One Side panel terminal view. On phone / coarse-pointer use, a key
toolbar sits with the terminal so it stays reachable above the soft keyboard;
primary keys are always visible, less-frequent keys expand. An optional
composer (ordinary text field plus Insert, distinct from Enter) sits with that
toolbar. An explicit hide-keyboard control is available. Describe interaction
in words; exact row layout, expand affordance, and composer placement are
implementation choices so long as the examples hold and 44px targets are met.
No new Board or Sessions sidebar chrome.

**Architecture:** Presentation stays inside the Side panel’s terminal content
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
Side panel / terminal contents). Layout and keyboard-fit mechanics remain
presentation choices under the navigation guidance; they add no Board,
workflow, or durable-state responsibility and need no new ADR. Input continues
on the existing attachment path (`attachedTerminal` / `onData` → WebSocket →
PTY); toolbar keys and composer Insert are additional producers of that same
input, reusing the attachment’s `insert` offer already used by dictation.
Touch history scrolling remains client-side `scrollLines` and must not be
rewired into PTY input. No conflict with Accepted ADRs; ADR 0007 / 0009 stay
Proposed and unbound here.

**Interaction / system trade-offs (ux-ui + architecture):**

1. **Accessory toolbar that injects sequences while preserving soft-keyboard
   focus** — User gets Esc/Tab/arrows without leaving the phone IME; system
   keeps one live attachment and must preventDefault focus theft on toolbar
   presses.
2. **Optional native composer → `insert` without Enter** — User gets
   autocorrect, selection, and dictation for long drafts; system shares one PTY
   with direct typing and must treat Insert as data-only.
3. **Fit terminal chrome to `visualViewport` (or equivalent) inside the Side
   panel** — User keeps output and controls readable when the keyboard opens;
   system stays a Side panel presentation change, not a Board or session-model
   change (ADR 0008).
4. **Swipe = history only; arrows = application input** — User can read without
   disturbing menus; system must keep the current touch handler from becoming a
   synthetic key source.

**Priority:** Terry explicitly requested first place in the product backlog on
2026-11-01 as a current usability problem. Preserve the existing near-future
direction and other queue entries.

**References:**

- [Current embedded-terminal behavior](../../dashboard/AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions).
- [Current touch scroll handler](../../dashboard/src/terminalTouchScroll.ts)
  and [terminal attachment/input path](../../dashboard/src/attachedTerminal.ts).
- [Dashboard navigation and touch conventions](../../docs/dashboard-navigation.md).
- [Previous mobile observation and its device limits](../../dashboard/tests/manual/2026-10-13-mobile-dashboard/README.md).
- [ADR 0008: Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
- [Blink Smart Keys](https://docs.blink.sh/#smart-keys) (borrowed accessory-bar
  pattern); [xterm.js predictive-keyboard discussion](https://github.com/xtermjs/xterm.js/issues/2403)
  and related mobile terminal toolbars elsewhere illustrate the problem space
  without establishing this dashboard’s exact iOS failure mode.
