# Select and copy text in the Dashboard terminal on mobile

**Identity:** SEED-316#select-and-copy-terminal-text-on-mobile
**Source:** [Refined story](../../seeds/SEED-316-mobile-terminal-text-selection.md#select-and-copy-terminal-text-on-mobile)
**Source review:** [Source-only review](source-review.md)

## Goal and scope

A developer on a phone or tablet can put a chosen portion of a session
terminal's output on the device clipboard and paste it elsewhere, after
swiping earlier output on screen in a session of any host.

The source owns the promises, examples and limits. This plan delivers them in
three steps: a swipe scrolls an application that scrolls its own output;
**Select** pauses the shown screen as text the device selects; the paused text
then reaches everything the terminal holds from the place shown.

Not undertaken, as the source records: long-press selection on the live
terminal, unbroken text where an application wrapped it, more than the terminal
holds in one selection, and the terminal's colors or text styles in the paused
text. Fine-pointer desktop terminal behavior does not change. The server, the
terminal transport and session records do not change.

## Architecture and current decisions

Existing solutions found and how each is used:

- **One-finger movement** is owned by `dashboard/src/terminalTouchScroll.ts`.
  Change it in place; it stays the only owner of what a swipe does.
- **Phone accessory controls** are owned by `dashboard/src/TerminalKeyToolbar.tsx`,
  which already holds the More and Compose toggles and keeps the soft
  keyboard as it was on a tap. **Select** joins them there.
- **Reading the terminal's text** exists only for readiness: the attachment
  (`dashboard/src/attachedTerminal.ts`) sends the screen's rows to the server.
  That reading has a different purpose and contract. The terminal's text for
  selection, with the place it shows, is a new read beside the attachment, not
  a change to the readiness message.
- **A native text surface beside the terminal** exists for input only
  (`dashboard/src/TerminalComposer.tsx`). No output counterpart exists; the
  paused text is new and sits with the phone accessory chrome.
- **Test support** is reused: the phone clipboard journey setup
  (`dashboard/tests/terminalPastePage.ts`), terminal traffic and toolbar helpers
  (`dashboard/tests/touchTerminalPage.ts`), finger movement
  (`dashboard/tests/touchGestures.ts`), and the frontend tier's attached
  terminal substitute (`dashboard/tests/support/frontendServiceSubstitutes.ts`),
  extended so a test can supply what the application prints and how it answers
  input.

Direction is recorded in the
[UX/UI North Star, Phone terminal text and scrolling](../../../docs/dashboard-ux-ui-north-star.md#phone-terminal-text-and-scrolling):
hand text work to the device, pause in place, send the session nothing, and
decide the swipe from what the terminal reports.
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps the terminal as Side panel content under one name; the paused text is a
state of that terminal. No Accepted decision conflicts.

Decisions that constrain the slices:

1. **Swipe decision.** A swipe sends wheel input only while the terminal
   reports a pointer tracking mode that includes the wheel (xterm
   `modes.mouseTrackingMode` of `vt200`, `drag` or `any`). In every other state
   it keeps today's scrollback rule. On the alternate screen without such
   tracking, xterm turns a wheel into arrow keys; a swipe must never reach that
   conversion. No host name appears in the page.
2. **Wheel input through xterm.** The page does not encode pointer reports.
   It gives xterm wheel input at the touched place and xterm encodes it as the
   application asked, one step per terminal row of finger travel, carrying
   partial rows between moves as the scrollback rule does. The place is where
   the finger went down, held for the whole stroke. That input does not bubble
   to the page around the terminal, so the reading pane's wheel listener
   (`dashboard/src/pageIntentReading.tsx`) never hears it. The window capture
   listener in `dashboard/src/pageMovement.ts` hears every event dispatched in
   the page before xterm can, and xterm takes wheel input only as an event; the
   wheel changes nothing there, because the same swipe's `touchstart` on the
   same terminal is already one of its own moves and its exceptions answer
   alike for both (slice 1, 2026-11-11).
3. **The terminal keeps its box while paused.** The attachment refits and
   sends a resize whenever the screen element's size changes. The paused text
   therefore covers the screen without hiding or resizing it, so pausing and
   returning send no resize.
4. **The paused text is outside the swipe listener.** The swipe listener
   cancels every one-finger move on the screen element. The paused text must
   not be a descendant of that element, or the device could neither scroll it
   nor drag a selection handle.
5. **Text rule.** The paused text is read from the terminal's buffer: one line
   per row, with a row the terminal wrapped continuing its line. This equals
   xterm's own selection text for the same lines.
6. **Proof tiers.** One integrated journey proves the representative
   select, copy, return and paste through the real terminal path. Variants are
   proved once in the frontend tier with the terminal substitute, as
   [where a check goes](../../../dashboard/tests/README.md#where-a-check-goes)
   directs.

Expected edits stay under the 250-line file check by giving each new
responsibility its own module: the terminal text read, the paused text and its
styles, each new spec, and the substitute application. Current sizes of files
this work touches: `Terminal.tsx` 218, `attachedTerminal.ts` 222,
`agent-terminal.css` 215, `TerminalKeyToolbar.tsx` 162,
`touchTerminalPage.ts` 165, `frontendServiceSubstitutes.ts` 223,
`agent-terminal-touch.spec.ts` 244, `agent-terminal-touch-keys.spec.ts` 235.
None is over the limit now; none receives a new responsibility.

## Execution and learnings

Story Branch Mode in `.worktrees/select-and-copy-text-in-the-dashboard-terminal-o`
on `claude/select-and-copy-text-in-the-dashboard-terminal-o`, remote `origin`,
target `main`; claim `19e0e454a` accepted on `main`. Replanning follows the
plan's existing authority.

- The substitute's application (`TerminalApplication`: an `opening` and an
  `answer` to each input) prints only at opening and in answer to input. A
  test that needs output at a moment it chooses, or an ended attachment,
  extends `terminalSubstituteApplication.ts` or a new module:
  `frontendServiceSubstitutes.ts` is at 238 lines.
- Frontend-tier phone terminal specs open through
  `openFrontendTerminalByTouch` (`dashboard/tests/support/frontendTouchTerminal.ts`)
  and pass the substitute `{ application }`.
- Under `selfScrollingApplication` a tap on the terminal screen sends three
  pointer reports (motion, press, release). A "sent nothing" expectation takes
  its baseline after the focusing tap.
- The bare selector `tests/terminals/` also selects `backend-tests/terminals/`.

## Decisive premises and observations

Observed in this preparation checkout at `77b044c81` on 2026-11-11, with
scratch edits reverted afterwards.

| Premise / consuming operation | Observation, result and remainder |
| --- | --- |
| The symptom exists in the page: a swipe gives a pointer-tracking application nothing (slice 1) | Scratch spec on `phonePasteJourney` (phone touch viewport), run with `npx playwright test --config dashboard/playwright.config.ts`, with the Claude attach stand-in scratch-edited to enable `?1000h` and `?1006h`: after finger strokes of +100 and −100 pixels, the page had sent the session nothing. |
| xterm encodes wheel input given to it by the page (slice 1) | Same run: one `WheelEvent` with client coordinates, dispatched on `.xterm-screen` and again on `.xterm`, each sent the session exactly one `ESC [ < 64 ; 6 ; 3 M`. |
| Tracking modes and the arrow-key conversion (decision 1) | `node_modules/@xterm/xterm/src/common/services/CoreMouseService.ts`: `X10` requests button presses only; `VT200`, `DRAG` and `ANY` include the wheel. `CoreBrowserTerminal.ts` line 838 sends arrow keys for a wheel on the alternate buffer without wheel tracking. Read from the installed 6.0.0 sources the page bundles. |
| Real Claude Code scrolls on those reports (slice 1) | Read-only `claude attach` of a live Claude Code 2.1.322 session from a scratch pseudo-terminal into browser xterm 6.0.0 at a 390-pixel touch viewport (41 columns, 35 rows): alternate screen, tracking mode `any`, no scrollback, no terminal-wrapped rows. A swipe sent nothing and scrolled nothing. Forwarding only the wheel reports of three wheel events moved the conversation about three rows and showed earlier lines. Not through the dashboard server; the server passes input strings to the pseudo-terminal unchanged, as the toolbar key journey already proves. Remainder: a physical phone, in the confirmation below. |
| The existing scrollback swipe proof discriminates (slice 1 preserves it) | With `terminal.scrollLines` scratch-removed, `tests/terminals/agent-terminal-touch-keys.spec.ts` "arrows move a menu while swipe does not" failed at its `rows` change expectation (line 138). |
| Ordinary text beside the terminal is selectable, scrolls by touch, and copies (slices 2 and 3) | Same scratch spec: a `pre` inserted as a sibling after `.terminal-screen` in the Terminal panel had computed `user-select: auto` and `touch-action: auto`; a −150 pixel finger stroke scrolled it to `scrollTop` 135, so the terminal's swipe listener does not reach a sibling; a programmatic range of two lines copied with `ControlOrMeta+c` gave exactly that range from `navigator.clipboard.readText()`, as did `document.execCommand("copy")`; the Paste key then sent that text to the session with a carriage return for the line break. |
| The text rule equals xterm's selection (decision 5) | Chromium with `node_modules/@xterm/xterm/lib/xterm.js` 6.0.0 at 45 columns: 65 buffer lines with two terminal-wrapped rows; the buffer walk joined by `isWrapped` equalled `selectAll()` then `getSelection()`, and a 115-character token came out whole. A standalone page, not the dashboard bundle; the bundle contains the same package version and the page already reads `terminal.buffer.active`. |
| Emulation cannot perform the device gesture (proof boundary) | Chromium phone touch context, `Input.dispatchTouchEvent` held 1.2 seconds on ordinary page text: no selection. Automated proof therefore selects a range programmatically and uses the platform's copy. |
| The device selects ordinary Dashboard text on the developer's phone (slices 2 and 3) | Terry, 2026-11-11, on his phone against the production dashboard: a long-press on ordinary Dashboard text outside the terminal selects with handles and offers Copy. Covers the phone's own selection on ordinary text in this page. Remainder: the built paused text itself, in the confirmation below. |

No premise is left to a probe slice.

## Ordered slices

### 1. A swipe scrolls an application that scrolls its own output
Type: Behavior
Status: done
Proof: A new frontend-tier spec at the phone touch viewport, with the terminal
substitute supplying an application that takes over the screen, tracks the
pointer, draws a window of numbered lines and redraws an earlier or later
window for each wheel report it receives. A finger stroke down shows earlier
numbered lines; a stroke back up returns to the latest. Everything the page
sent is a wheel report whose position lies in the touched cell; no arrow key is
sent; a draft typed before the swipe is unchanged after it. Negative control:
the spec fails before the change, as the premise observed.
`tests/terminals/agent-terminal-touch.spec.ts` and
`tests/terminals/agent-terminal-touch-keys.spec.ts` stay green unchanged for
the scrollback case. Update the Phone keyboard paragraph of
`dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md`, which today says a swipe moves
terminal scrollback only.
`npm run test:dashboard -- frontend-tests/<new application-scroll spec> tests/terminals/agent-terminal-touch.spec.ts tests/terminals/agent-terminal-touch-keys.spec.ts`
and `npm run typecheck:dashboard`.
Accepted: `dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts`
proves the application case under the tracking Claude Code reports (`any`, SGR
reports): five wheel reports per five-and-a-half-row stroke in the cell where
the finger went down, nothing else sent, the draft row unchanged; its second
test proves the alternate screen without wheel tracking sends nothing. Setup is
`selfScrollingApplication` in `dashboard/tests/support/terminalSubstituteApplication.ts`,
opened through `openFrontendTerminalByTouch`.
The spec failed on the unchanged listener, and with `any` removed from the
decision, with the decision widened to every tracking mode, or with the wheel
placed away from the touch. `vt200` and `drag` share the decision's list
without a page open of their own.
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard -- tests/terminals/ frontend-tests/ --reporter=list --workers=3`
passed 148 tests on 2026-11-11, with `npm run typecheck:dashboard`.

Behavior: A phone shows a session whose application has taken over the screen,
tracks the pointer and has more conversation than fits → a one-finger swipe
down on the terminal → earlier conversation scrolls into view; the session
received wheel input at the touched place and nothing else. A terminal that
holds its own scrollback under an application that does not scroll itself
still moves that scrollback and sends the session nothing.

Covers source examples 5 (the swipe) and 6.

### 2. Select pauses the shown screen as selectable text and returns
Type: Behavior
Status: planned
Proof: One integrated journey on the phone clipboard setup: **Select** is
shown beside **Paste** without opening More, with a 44-pixel target; a tap
shows the terminal's shown lines as ordinary text over the screen's box,
**Select** reads as on, and focus is where it was; a range across two lines,
copied by the platform after the clipboard was primed with another value, is
exactly on the clipboard; a second tap shows the live terminal; the same
single attachment remains, no `resized` line arrived, the page sent nothing
across both taps, and **Paste** then gives the session the copied text.
Frontend-tier variants with the substitute: output arriving while paused
leaves the paused text as it was and shows on return; the remaining screen of
an ended attachment is still shown as paused text; the paused text stays
within the visual viewport at reduced visible height and after rotation; after
slice 1's application scrolled itself, the paused text is that earlier screen;
a fine-pointer viewport shows no **Select**. Preserved consumers: the
`tests/terminals/agent-terminal-touch*` family, which measures the toolbar,
its sideways scrolling, soft-keyboard fit, Compose and Paste, and the frontend
terminal specs that use the substitute. Describe **Select** in the Phone
keyboard paragraph and the `Terminal.tsx` header comment.
`npm run test:dashboard -- tests/terminals/agent-terminal-touch frontend-tests/agent-terminal-touch frontend-tests/terminal-prompts-recovery.spec.ts`
and `npm run typecheck:dashboard`.

Behavior: A phone shows an attached terminal with output → the developer taps
**Select** → the lines shown stay in place as paused ordinary text and
**Select** reads as on; the device's selection and Copy put a chosen range on
the clipboard; tapping **Select** again returns the live terminal with its
current output on the same attachment, and the session received nothing from
pausing or returning.

Interim: the paused text holds the lines the terminal is showing. Slice 3
extends it to everything the terminal holds.

Covers source examples 1, 2, 5 (selecting the earlier screen) and 7.

### 3. The paused text reaches everything the terminal holds, from the place shown
Type: Behavior
Status: planned
Proof: A frontend-tier spec whose substitute prints 200 numbered lines, one
100-character line the terminal wraps over three rows, and a long token an
application drew over two rows. After swiping the terminal up to line 40,
**Select** opens the paused text with line 40 where the terminal showed it;
finger strokes on the paused text scroll it natively to line 1 and to the last
line; a range from line 35 to line 80, copied by the platform, is exactly
those lines; the wrapped line occupies three rows and copies as one line; the
drawn token copies as two lines. On return the terminal still shows the place
it showed before pausing and a swipe moves its scrollback. Complete the Phone
keyboard paragraph: what the paused text holds, that copied text matches the
screen, and that landscape gives longer rows.
`npm run test:dashboard -- frontend-tests/agent-terminal-touch tests/terminals/agent-terminal-touch`
and `npm run typecheck:dashboard`.

Behavior: A terminal holds 200 lines of scrollback and the developer has
swiped up to line 40 → **Select** → the paused text opens at line 40, touch
scrolling reaches the first and the last line, one selection can run from line
35 to line 80, and a line the terminal wrapped copies as one line while breaks
an application drew stay breaks.

Replaces slice 2's interim. Covers source examples 3 and 4.

## Developer confirmation after delivery

No tool available to an agent performs a phone's long-press, so the device
gesture on the built paused text is confirmed by the developer once the
production dashboard serves the delivered revision. It is not a slice and
blocks none. Execution's completion handoff carries this one request as its
reminder:

- **Questions answered:** does a swipe scroll a Claude Code session on the
  phone, and does the phone's own selection and Copy work on the paused text.
- **One round, on the developer's phone:** open a Claude Code session with a
  conversation longer than the screen and swipe to earlier output; tap
  **Select**; long-press a word, drag a handle across a line break and choose
  Copy; paste into another app and compare; tap **Select** again and confirm
  the live terminal returns.
- **Retained baseline:** Terry's observation of 2026-11-11 above. A round
  that fails is reported against this story for the developer to route.

## Verification and delivery gates

Every source promise has an owner. Swipe on terminal scrollback and on an
application that scrolls itself, no arrow keys and unchanged typed input →
slice 1. **Select** beside **Paste**, paused text in place, evident state,
return with current output, nothing sent, same attachment, ended attachment,
visible-area fit, soft keyboard not raised, no desktop control → slice 2.
Everything the terminal holds, opening place, touch scrolling, selections
spanning screens, wrapped lines whole and drawn breaks kept → slice 3. The
device gesture → the developer confirmation above.

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff. Follow
[AGENTS.md — Test automation](../../../AGENTS.md#test-automation): arrange
domain data through the shared MakeMe API, wait for observable events instead
of wall-clock time, keep the default timeout, and never use `test.slow()`.
Write journeys under
[the browser journey guide](../../../dashboard/tests/writing-journeys.md) and
the [tier rules](../../../dashboard/tests/README.md).

Run the focused commands each slice names through `npm run test:dashboard`
from the repository root, plus `npm run typecheck:dashboard`,
`git diff --check` and this project's selective pre-commit gates. The named
families are the consumers of the changed toolbar, panel layout and shared
test support; no project rule requires the whole dashboard suite locally for
this change, and hosted CI runs it after publication. Post-change refactoring,
agent commits, publication and final CI stay with Execute Plan's delivery
workflow.

Before a longer local run inspect current load and competing work on this
machine and choose bounded concurrency. On macOS start fully awake: on AC use
`caffeinate -s -i`; on battery plug in, or keep the lid open under
`caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
A run invalidated by sleep is rerun under that policy, never accepted.

## Plan concern assessment

Slice-plan refinement was not needed: each slice has one outcome and one proof
loop, the three share one model (what the terminal holds, and what it reports
about its application), and no slice prepares beyond the next. Slice 2's
interim is named with its replacing slice. No remaining slice-specific concern
was found. This plan grants no execution.


## Story obligations

### O1. Device long-press selection is outside automated proof
Reported: slice 2 — "Chromium phone touch emulation performs no long-press selection, so automated proof selects a range programmatically and uses the platform's copy."
Story clause: "The device's own selection works on that text: long-press, handles, magnifier and the system Copy."
Disposition: excluded "The device gesture itself is confirmed once by a developer on a physical phone after delivery."
Commitment: S1.7, S1.8, S1.9, X5.2, X5.9
