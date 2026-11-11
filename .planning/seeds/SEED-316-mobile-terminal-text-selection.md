---
id: SEED-316
status: active
planted: 2026-11-11
planted_during: Terry reported that Dashboard terminal text cannot be selected on mobile
trigger_when: Developers select mobile terminal text selection for refinement
scope: story
---

# SEED-316 — Mobile terminal text selection

<a id="select-and-copy-terminal-text-on-mobile"></a>

### Select and copy text in the Dashboard terminal on mobile

**Identity:** SEED-316#select-and-copy-terminal-text-on-mobile
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/591-select-and-copy-terminal-text-on-mobile/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"29c32d5b74bca1918cbedd7015415eabee41c8cf5b2faeeed87e387735eca176","plan":"61962088e659fc5a17bb68e48499941839dabf62024b3baea6f9c44a98394399"}}
```

#### Goal

A developer following agent sessions from a phone or tablet browser can put a
chosen portion of a session terminal's output on the device clipboard and paste
it elsewhere. Earlier output can be brought on screen by swiping first, in a
session of any host. This completes reading and reusing terminal output in the
mobile Dashboard, which today offers input only.

#### Scope

Select text:

- The phone key toolbar offers **Select** in one tap, beside **Paste**. Using
  it replaces the live terminal screen, in place, with a paused copy of the
  terminal's text as ordinary page text. The device's own selection works on
  that text: long-press, handles, magnifier and the system Copy. The dashboard
  adds no selection gesture, highlight or Copy control of its own.
- The paused text holds every line the terminal holds at that moment: its
  screen and any scrollback it keeps. It opens at the lines the terminal was
  showing and scrolls by ordinary touch, so a selection can span more than one
  screen where the terminal holds more.
- The text reads as the terminal shows it: the same characters in aligned
  columns, row by row. A line the terminal itself wrapped over several rows is
  one line, as a desktop terminal selection copies it. Line breaks the
  session's application drew stay line breaks.
- The paused state is evident: **Select** reads as on, and using it again
  returns the live terminal with its current output. Pausing and returning
  send nothing to the session and keep the same attachment; output that
  arrived meanwhile shows on return.
- Whatever the terminal holds can be selected, including the remaining screen
  of a disconnected or ended attachment.

Swipe scrolls the output, whoever holds it:

- A one-finger vertical swipe still moves the terminal's own scrollback where
  the terminal holds the output.
- When the session's application has taken over the screen and scrolls its own
  output, as Claude Code does, the swipe scrolls that application's output the
  way a desktop wheel does at the touched place. It sends no arrow keys and
  changes no typed input. This decides by what the terminal reports about the
  application, not by host name.

Fine-pointer desktop use keeps its terminal behavior and gains no **Select**
control.

Scope limits:

- Copied text matches the screen. Where an application wraps its own lines to
  a phone-width terminal, a longer URL or command copies with those breaks and
  indentation; landscape gives longer rows. Unbroken text would come from a
  session's conversation instead of its terminal, a separate per-host story to
  consider only if this hurts in practice (Terry's decision of 2026-11-11).
- Selecting directly on the live terminal by long-press is not promised.
- One selection reaches what the terminal holds. More than one screen of an
  application-held conversation in a single selection is not promised: swipe,
  then select again.
- The paused text need not carry the terminal's colors or text styles.
- Automated proof uses the local Chromium touch viewports the terminal's
  existing touch proof uses. Their emulation cannot perform a device's
  long-press selection, so automated proof covers the paused text, a selected
  range reaching the clipboard and a paste, the return to the live terminal,
  and both swipe cases. The device gesture itself is confirmed once by a
  developer on a physical phone after delivery.

#### Key examples

1. A phone shows a session terminal whose output includes a path → the
   developer taps **Select** → the same lines stay in place as paused text →
   long-pressing a word and dragging the handles across two lines, then the
   system Copy, puts that range on the clipboard → pasting it into another
   field gives exactly the selected text.
2. The terminal is paused and the session prints more output → the developer
   taps **Select** again → the live terminal shows the current output on the
   same attachment, with no reconnect, and typing reaches the session as
   before. The session received nothing from pausing or returning.
3. A terminal holds 200 lines of scrollback and the developer has swiped up to
   line 40 → **Select** → the paused text opens at line 40, touch scrolling
   reaches line 1 and the last line, and one selection can run from line 35 to
   line 80.
4. The terminal wrapped one 100-character line over three rows → the developer
   selects those rows and copies → the paste is that one line with no break
   inside it. In a Claude Code session at 41 columns, a URL the application
   drew over two rows copies as two lines, as shown.
5. A Claude Code session's conversation is longer than the screen → a
   one-finger swipe down → earlier conversation scrolls into view, no arrow key
   reaches the session and the typed input is unchanged → **Select** → the
   paused text is that earlier screen, ready to copy from.
6. A terminal holds its own scrollback and its application does not scroll
   itself → a one-finger swipe moves the terminal's scrollback and sends the
   session nothing, as today.
7. A fine-pointer desktop browser shows the same session → no **Select**
   control appears; mouse selection and the wheel behave as before.

#### UI

The developer is reading on a small screen, often one-handed, sometimes with
the soft keyboard open and the session still working. One tap changes what a
touch on the screen means, so the change must be visible where the eyes are:
the screen no longer moves or blinks, and **Select** shows as on. The paused
text fits the visible area as the terminal does, including above an open soft
keyboard and after rotation, and using **Select** does not raise the soft
keyboard. The only way out that the developer needs to learn is the same
control. A session that needs the developer while its terminal is paused is
announced by the Dashboard's existing session attention, not by the paused
text.

Unbuilt direction is kept in the
[UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md#phone-terminal-text-and-scrolling).

#### Investigation and alternatives

Observed on 2026-11-11 in this repository at `77b044c81`:

- xterm 6.0.0 selects from mouse events only; its sources have no touch
  selection. In Chromium with a phone touch viewport, a one-finger drag on a
  bare xterm produced touch events only and no selection, and a long press
  produced a tap and no selection. The dashboard's touch scrolling
  (`dashboard/src/terminalTouchScroll.ts`) takes every one-finger move for
  scrolling. Nothing can select today.
- A read-only `claude attach` of a live Claude Code 2.1.322 session, shown in
  browser xterm at a 390-pixel-wide touch viewport (41 columns, 35 rows): the
  terminal was on the alternate screen with pointer tracking on, held no
  scrollback, and had no terminal-wrapped rows; the application drew every
  line break. A one-finger swipe sent the session nothing and scrolled
  nothing. Wheel reports, which xterm produced from wheel events, scrolled the
  conversation. Claude Code's documentation states that attached background
  sessions always render this way and that no setting changes it.
- The text from walking xterm's buffer, joining terminal-wrapped rows, equals
  xterm's own selection text for the same lines. xterm's programmatic
  selection works while an application tracks the pointer.
- Chromium touch emulation performs no long-press selection even on ordinary
  page text. A range selected in ordinary text and copied by the platform
  reached the clipboard.
- This machine serves the phone over tailnet HTTPS, a secure context.
- On his phone, Terry reports that a long-press on ordinary Dashboard text
  outside the terminal selects it with handles and offers Copy.

Not observed: Codex and Cursor terminals. The server starts Codex with
`--no-alt-screen`, so its output is expected in the terminal's scrollback; the
swipe rule follows the terminal's reported state either way.

Directions compared against the same goal:

- **Paused native text in place (chosen).** Every selection affordance is the
  device's own and nothing moves under the finger. Costs one tap each way and
  a paused view. Works for any host from what the terminal holds.
- **Long-press selection on the live terminal.** No mode, but the dashboard
  would rebuild handles and Copy without the device's magnifier or callout,
  live redraws change text under the selection, and its feel cannot be proven
  without a physical phone.
- **A toolbar mode in which a drag selects.** Simple to build, but a finger on
  7-pixel cells cannot place a precise start and end without handles.
- **Let the application select.** Claude Code selects and copies by pointer
  itself, but by its documentation a local session copies to the clipboard of
  the machine it runs on, not the phone's, and other hosts have no equivalent.
- **Copy from the conversation instead of the terminal.** Gives unbroken text
  but needs a reader per host and omits what only the terminal shows. Recorded
  above as the possible later story.
- **Borrowed: live text on a photo.** A phone makes the words in a photo
  selectable by laying native text over a surface that is not text. Mapped
  here, the drawn terminal is the photo and the terminal's own buffer supplies
  the text exactly, with no recognition step. The analogy breaks where a photo
  is still and a terminal redraws: native text laid over a live screen would
  be replaced mid-selection, and xterm's own accessibility layer ignores
  touches. Pausing the screen removes that limit, which is the chosen
  direction.

The strongest challenge was that copying can match the screen and still miss
the purpose when a phone-width terminal breaks long tokens. Terry accepted
that limit for this story on 2026-11-11. Terry also chose the paused native
text and folding the Claude Code swipe scrolling into this story on that date.

#### Architecture

Everything stays in the page; the server, transport and session records do not
change, and nothing is stored. The terminal attachment
(`dashboard/src/attachedTerminal.ts`) owns the xterm instance and gains one
read: the terminal's current text and the place it shows. The phone accessory
chrome already hands input to the device's own text editing through Compose;
**Select** is the same idea for output, owned beside it, so the phone has one
concept of native text next to the terminal and not a second selection model.
Touch scrolling changes its question from "move the terminal's scrollback" to
"scroll the output where it is held", answered from the terminal's reported
state so that no host name appears in the page.

[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
names the terminal as Side panel content with one name per concept. The paused
text is a state of that terminal, not another region or panel content. No
conflict with an Accepted decision was found, and no ADR is needed.
