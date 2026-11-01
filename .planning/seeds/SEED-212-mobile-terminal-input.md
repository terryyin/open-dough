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

**Beneficiary:** A developer using the dashboard's embedded terminal from an
iPhone or another touch device with an on-screen keyboard.

**Goal:** Read terminal output, enter and edit instructions, navigate interactive
option menus, and submit or cancel input comfortably without a physical keyboard.

**Problem:** Terry reports unreliable virtual-keyboard input and scrolling on
iPhone, especially when the terminal application captures input for an option
menu. The phone keyboard supplies no up/down keys. The dashboard uses xterm.js;
its current touch handler moves terminal scrollback with `scrollLines`, which
does not send menu-navigation input. The exact causes of the reported typing
and scrolling failures still need observation on a physical device.

**Decisions captured from the 2026-11-01 discussion:**

- Add mobile controls around the existing terminal. Retain its live native
  session and input path; no replacement terminal or separate mobile app is
  selected.
- Provide a touch key toolbar with **Esc**, **Tab**, **Up**, **Down**, **Left**,
  **Right**, and **Enter**. Keep these controls reachable above the on-screen
  keyboard; less frequent controls, including **Ctrl+C**, belong in an expandable
  section. Activating a key sends the corresponding terminal input and preserves
  the keyboard's current visibility rather than dismissing or reopening it.
- Offer an optional ordinary text composer for longer instructions. Users can
  edit with the phone's native selection, autocorrection, and dictation, then
  deliberately **Insert** the text into the current terminal. Insertion and
  **Enter** are separate actions: insertion must not submit or execute the draft.
  Direct terminal typing remains available.
- Treat reading output and controlling a terminal application as separate
  actions. Swiping reads terminal history; toolbar arrows navigate option menus
  or move the application cursor. Application-internal scrolling may require
  wheel or keyboard input according to that application; it must not be confused
  with terminal scrollback. Explicit keys provide navigation when gestures are
  captured or the application has no ordinary scrollback.
- Fit the terminal and toolbar to the area visible when the keyboard opens or
  closes. Provide an explicit hide-keyboard control and keep input and terminal
  actions reachable at reduced height and after rotation.
- Keep all of this as one product backlog story. Start implementation with the
  key toolbar and reliable history scrolling, then add the composer; story
  completion includes the composer and keyboard layout behavior as well.
- Verify physical iPhone keyboard behavior. Desktop mobile emulation alone is
  insufficient evidence for this outcome.

**Key examples / acceptance:**

- An interactive terminal prompt offers several options. On an iPhone without
  physical arrow keys, tap Down twice and Enter: the application moves twice
  and confirms the intended option. Esc cancels where the application supports
  it. These keys work with the phone keyboard shown or hidden.
- With the keyboard open, use Tab for terminal completion and Left/Right to
  edit input; tapping the toolbar does not hide the keyboard, lose the input,
  or trigger a dashboard shortcut. Expand the additional controls and send
  Ctrl+C to interrupt the foreground application.
- Type, backspace, and submit short input directly using the on-screen keyboard.
  Text composition, cursor movement, and deletion produce the intended input
  without missing, repeated, or corrupted text.
- Write a longer instruction in the composer, revise it with native selection
  and dictation, and tap Insert. The intended text reaches the current terminal
  once and remains available for review there; no trailing Enter or draft line
  break accidentally submits it. Press Enter deliberately to submit. An
  unavailable attachment keeps the unsent draft available for a deliberate
  retry and never automatically replays inserted text.
- Swipe through earlier terminal output and back to the latest output without
  moving an option-menu selection. When the foreground application presents
  an option menu, use the arrows without relying on a swipe to behave as Up or
  Down. Text editing and terminal input remain usable after scrolling.
- Open and hide the keyboard, then rotate between portrait and landscape.
  The current terminal attachment, input, and unsent composer draft survive;
  toolbar, composer actions, and Close remain reachable within the visible
  area. No reconnect or relaunch is needed to fit the terminal.
- Desktop hardware-keyboard typing, terminal special keys, existing dictation,
  and ordinary terminal scrolling retain their current behavior. New controls
  follow the dashboard's existing accessible names and 44px touch-target
  convention.

**Proof and investigation:** Observe the reported failures before choosing input
and gesture details. Exercise the real browser-to-terminal-to-PTY path for text,
special keys, and interactive selection. Cover stable behavior with proportionate
automated checks, and record a physical iPhone Safari observation with the iOS
version, keyboard, host/application, keyboard visibility, and orientation.
Distinguish that result from simulated touch/viewport checks. The earlier mobile
dashboard observation explicitly excluded physical iOS keyboard behavior, so it
does not close this story's device gate. Apply the repository's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Boundaries and preparation:** This record captures the selected outcome and
decisions; refinement and slice planning remain to be done. It authorizes no
implementation. Keep host-specific menu parsing, a new terminal engine, and a
general touch text-selection system outside this bounded outcome. Exact toolbar
layout, input/composition handling, and any application-wheel support remain
implementation questions to settle against the examples above. No blocking
story prerequisite has been identified.

**Priority:** Terry explicitly requested first place in the product backlog on
2026-11-01 as a current usability problem. Preserve the existing near-future
direction and other queue entries.

**References:**

- [Current embedded-terminal behavior](../../dashboard/AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions).
- [Current touch scroll handler](../../dashboard/src/terminalTouchScroll.ts)
  and [terminal attachment/input path](../../dashboard/src/attachedTerminal.ts).
- [Dashboard navigation and touch conventions](../../docs/dashboard-navigation.md).
- [Previous mobile observation and its device limits](../../dashboard/tests/manual/2026-10-13-mobile-dashboard/README.md).
- [ADR 0008: Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  names the terminal's containing region as the Side panel; layout mechanics
  remain presentation choices.
- [Blink Smart Keys](https://docs.blink.sh/#smart-keys) illustrates the extra
  terminal-key row; [xterm.js predictive-keyboard discussion](https://github.com/xtermjs/xterm.js/issues/2403)
  records mobile text-input difficulties, without establishing their cause in
  this dashboard.
