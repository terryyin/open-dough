Use only these inputs, read no other project files, change nothing; number independently observable promises, one id per expected result under its source conditions. Group repeated statements and clauses describing the same result under one id, retaining their source text or locations, qualifications, triggers and journey examples so one sufficient observation can cover that promise. Separate results that can fail independently, including alternatives and genuine rejection restrictions; sharing a proof command or location does not make them one promise. Keep reasons, settled baselines, effort hypotheses, proof-method explanations and delivery deferrals available as unnumbered source context unless they also promise an independently checkable result. Keep scope limits and exclusions as context unless they promise such a result; do not turn them or examples into new rejection rules. Derive promises, not slice ownership or acceptance.

Original source:
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
