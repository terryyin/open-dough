# Source review — Select and copy text in the Dashboard terminal on mobile

Launch: one fresh general-purpose reviewer on 2026-11-11, before the first
implementation delegation, with no conversation inheritance. Input: the
selected story's Goal, Scope with its scope limits, Key examples and UI text
from [SEED-316](../../seeds/SEED-316-mobile-terminal-text-selection.md#select-and-copy-terminal-text-on-mobile)
at `19e0e454a`, and nothing else. It was told to read no project files, change
nothing, and return individually numbered commitments. The rows below are its
return.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer following agent sessions from a phone or tablet browser can put a chosen portion of a session terminal's output on the device clipboard. (Both phone and tablet browsers are named.) | slice 3 | |
| G2 | The developer can paste that chosen portion elsewhere. | slice 3 | |
| G3 | Earlier output can be brought on screen by swiping first. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts “a swipe scrolls an application…”: after a stroke down the rows show conversation line 046 and no longer 060; dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts shows earlier menu history after a swipe |
| G4 | Swiping earlier output on screen works in a session of any host. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: the swipe scrolls under a Codex record and sends nothing under a Claude record whose application takes no wheel; dashboard/src/terminalTouchScroll.ts decides by terminal.modes.mouseTrackingMode and names no host |
| G5 | This completes reading and reusing terminal output in the mobile Dashboard, which today offers input only. (Stated outcome and context.) | slice 3 | |
| S1.1 | The phone key toolbar offers **Select**. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts step “Select is one tap away, beside Paste”: Select visible in the Terminal keys toolbar |
| S1.2 | **Select** is offered in one tap. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: Select visible while More is collapsed, with a 44-pixel target |
| S1.3 | **Select** sits beside **Paste**. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: Select on Paste’s line with less than one key’s width between them |
| S1.4 | Using **Select** replaces the live terminal screen with a paused copy of the terminal's text. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts expectPausedOverScreen and expectPausedHoldsDrawnRows: opaque text over the screen’s whole box holding the rows the terminal draws |
| S1.5 | The replacement happens in place. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts expectPausedLineInPlace: the echoed path’s paused line lies within one pixel of its terminal row; the page reported no new size |
| S1.6 | The paused copy is ordinary page text. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts expectPausedOverScreen: a pre outside .terminal-screen with user-select text and touch-action auto |
| S1.7 | The device's own selection works on that text: long-press. |  | O1 |
| S1.8 | The device's own selection works on that text: handles. |  | O1 |
| S1.9 | The device's own selection works on that text: magnifier. |  | O1 |
| S1.10 | The device's own selection works on that text: the system Copy. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: a two-line range copied with the platform’s copy after the clipboard held “copied earlier” reads back exactly from navigator.clipboard |
| S1.11 | The dashboard adds no selection gesture of its own. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: nothing is selected after the tap; dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts: a finger stroke on the paused text selects nothing; dashboard/src/TerminalPausedText.tsx adds no gesture handler |
| S1.12 | The dashboard adds no highlight of its own. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: the page holds no selection of the dashboard’s making; dashboard/src/terminal-paused-text.css styles no selection or highlight |
| S1.13 | The dashboard adds no Copy control of its own. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: no button named Copy in the Terminal panel |
| S2.1 | The paused text holds every line the terminal holds at that moment: its screen. | slice 3 | |
| S2.2 | The paused text holds every line the terminal holds at that moment: any scrollback it keeps. | slice 3 | |
| S2.3 | The paused text opens at the lines the terminal was showing. | slice 3 | |
| S2.4 | The paused text scrolls by ordinary touch. | slice 3 | |
| S2.5 | A selection can span more than one screen. (Qualification: where the terminal holds more.) | slice 3 | |
| S3.1 | The text reads as the terminal shows it: the same characters. | slice 3 | |
| S3.2 | The text reads as the terminal shows it: in aligned columns. | slice 3 | |
| S3.3 | The text reads as the terminal shows it: row by row. | slice 3 | |
| S3.4 | A line the terminal itself wrapped over several rows is one line, as a desktop terminal selection copies it. | slice 3 | |
| S3.5 | Line breaks the session's application drew stay line breaks. | slice 3 | |
| S4.1 | The paused state is evident: **Select** reads as on. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: aria-pressed true and a background that differs from the off look, also after the tap’s hover has gone |
| S4.2 | Using **Select** again returns the live terminal. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts expectLive after the second tap: paused text gone, aria-pressed false, the screen on top of its own box |
| S4.3 | The returned live terminal shows its current output. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: rows show the echoed path after return; dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: rows show “printed while paused” after return |
| S4.4 | Pausing sends nothing to the session. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: sent since before pausing is exactly the later paste; dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: sent is empty across pause, output and return |
| S4.5 | Returning sends nothing to the session. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts and dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test, same expectations spanning the returning tap |
| S4.6 | Pausing and returning keep the same attachment. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: one native attach with the same short id and no new size line; dashboard/frontend-tests/agent-terminal-touch-select.spec.ts: the count of sizes the page reported is unchanged |
| S4.7 | Output that arrived meanwhile shows on return. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: output printed while paused shows in the rows on return |
| S5.1 | Whatever the terminal holds can be selected. | slice 3 | |
| S5.2 | That includes the remaining screen of a disconnected attachment. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts “the remaining screen of a disconnected attachment pauses as text a range can be selected in” |
| S5.3 | That includes the remaining screen of an ended attachment. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts “the remaining screen of an ended attachment pauses as text a range can be selected in” |
| S6.1 | Swipe scrolls the output, whoever holds it. (Section heading covering S6.2–S7.6.) | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts (application holds the output) with dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts (terminal holds it) |
| S6.2 | A one-finger vertical swipe still moves the terminal's own scrollback. (Qualification: where the terminal holds the output.) | slice 1 | observed: dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts “…arrows move a menu while swipe does not”: rows change and sent is unchanged after both strokes; dashboard/tests/terminals/agent-terminal-touch.spec.ts swipe step; both unchanged and green |
| S7.1 | When the session's application has taken over the screen and scrolls its own output, the swipe scrolls that application's output. (Claude Code is named as an example of such an application, not as the rule.) | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: alternate screen with any-motion tracking, stroke down shows lines 046–055, stroke back up returns to 060 |
| S7.2 | That swipe scrolls the application's output the way a desktop wheel does. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts expectWheelAtTouch: xterm’s own wheel path sends one SGR wheel report per row, button 64 down and 65 up; no comparison with a hardware wheel event |
| S7.3 | That scroll acts at the touched place. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts expectWheelAtTouch: each report’s column and row hold the point where that stroke’s finger went down |
| S7.4 | That swipe sends no arrow keys. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: every input sent during the strokes matches wheelReport and the tail is exactly five plus five reports then “!”; second test: sent equals [“x”] on the alternate screen without wheel tracking |
| S7.5 | That swipe changes no typed input. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: the draft row is “> draft” after both strokes and “> draft!” after one more key |
| S7.6 | This decides by what the terminal reports about the application, not by host name. | slice 1 | observed: dashboard/src/terminalTouchScroll.ts wheelTracking decision; dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts both tests; mutation “!== none” failed the second test and removing “any” failed the first |
| S8.1 | Fine-pointer desktop use keeps its terminal behavior. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts “fine-pointer desktop”: a mouse drag makes an xterm selection, the wheel reaches line 1 of scrollback, nothing sent |
| S8.2 | Fine-pointer desktop use gains no **Select** control. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts “fine-pointer desktop”: toolbar and Select hidden, no paused text |
| K1.0 | Trigger: a phone shows a session terminal whose output includes a path, and the developer taps **Select**. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts setup: the session echoes /work/open-dough/docs/notes.md, then a tap on Select |
| K1.1 | The same lines stay in place as paused text. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: paused lines equal the drawn rows and the path’s line lies on its terminal row |
| K1.2 | Long-pressing a word and dragging the handles across two lines, then the system Copy, puts that range on the clipboard. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: the range “docs/notes.md⏎echo /work/open-dough”, set programmatically as handles would leave it, is exactly on the clipboard after the platform’s copy; the long-press itself is O1 |
| K1.3 | Pasting it into another field gives exactly the selected text. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: Paste sends exactly that text with a carriage return for the break and the session records the line docs/notes.md |
| K2.0 | Trigger: the terminal is paused, the session prints more output, and the developer taps **Select** again. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test setup: directedApplication prints while paused, then a second tap on Select |
| K2.1 | The live terminal shows the current output. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: rows show the output printed while paused |
| K2.2 | It is on the same attachment. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: the sizes count is unchanged, so the page opened no second socket; dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: one native attach |
| K2.3 | There is no reconnect. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: dashboard.claudeAttaches() has length 1 after return |
| K2.4 | Typing reaches the session as before. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: a typed “!” reaches the session and shows in the rows |
| K2.5 | The session received nothing from pausing. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: sent is empty until that “!” |
| K2.6 | The session received nothing from returning. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: the “!” is the first thing sent after returning |
| K3.0 | Trigger: a terminal holds 200 lines of scrollback, the developer has swiped up to line 40, then uses **Select**. | slice 3 | |
| K3.1 | The paused text opens at line 40. | slice 3 | |
| K3.2 | Touch scrolling reaches line 1. | slice 3 | |
| K3.3 | Touch scrolling reaches the last line. | slice 3 | |
| K3.4 | One selection can run from line 35 to line 80. | slice 3 | |
| K4.0 | Trigger (first case): the terminal wrapped one 100-character line over three rows, and the developer selects those rows and copies. | slice 3 | |
| K4.1 | The paste is that one line with no break inside it. | slice 3 | |
| K4.2 | Second case: in a Claude Code session at 41 columns, a URL the application drew over two rows copies as two lines, as shown. | slice 3 | |
| K5.0 | Trigger: a Claude Code session's conversation is longer than the screen, and the developer makes a one-finger swipe down. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts setup: selfScrollingApplication announces ?1049h ?1003h ?1006h as Claude Code was observed to, 60 lines with 10 shown, one-finger stroke down |
| K5.1 | Earlier conversation scrolls into view. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: rows contain conversation line 046 after the stroke down |
| K5.2 | No arrow key reaches the session. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: nothing but wheel reports was sent during the strokes |
| K5.3 | The typed input is unchanged. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts: draft row unchanged after the strokes |
| K5.4 | After **Select**, the paused text is that earlier screen. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts “after an application scrolled itself, Select pauses that earlier screen…”: paused lines are the ten earlier conversation lines and the draft row |
| K5.5 | That paused text is ready to copy from. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts same test: a two-line range of that paused text selects |
| K6.0 | Trigger: a terminal holds its own scrollback, its application does not scroll itself, and the developer makes a one-finger swipe. | slice 1 | observed: dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts setup: fake claude attach prints menu history into terminal scrollback, no pointer tracking |
| K6.1 | The swipe moves the terminal's scrollback. | slice 1 | observed: dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts: rows show earlier menu history after the stroke |
| K6.2 | The swipe sends the session nothing, as today. | slice 1 | observed: dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts: expect(sent).toEqual(afterDown) after the strokes |
| K7.0 | Trigger: a fine-pointer desktop browser shows the same session. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts “fine-pointer desktop” at 1280×800 without touch |
| K7.1 | No **Select** control appears. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts: Select hidden |
| K7.2 | Mouse selection behaves as before. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts: mouse drag shows .xterm-selection |
| K7.3 | The wheel behaves as before. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts: wheel moves the terminal’s scrollback to conversation line 001 |
| U1 | Context: the developer is reading on a small screen, often one-handed, sometimes with the soft keyboard open and the session still working. | slice 2 | observed: context for U2–U12; dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts second test covers reduced visible height, dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test a working session |
| U2 | One tap changes what a touch on the screen means, so the change must be visible where the eyes are. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: the paused text covers the whole screen box and Select’s look changes |
| U3 | The screen no longer moves. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: paused lines are unchanged after output arrives beneath |
| U4 | The screen no longer blinks. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts and dashboard/tests/terminals/agent-terminal-touch-select.spec.ts expectPausedOverScreen: opaque at the middle and corners, so the live cursor does not show |
| U5 | **Select** shows as on. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: aria-pressed true with a distinct background |
| U6 | The paused text fits the visible area as the terminal does. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts “the paused text keeps to the visible area…”: covers the screen box inside the visual viewport with Select reachable |
| U7 | That fit holds above an open soft keyboard. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts same test at a 320-pixel visible height, where a finger scrolls the paused text |
| U8 | That fit holds after rotation. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts same test after rotation |
| U9 | Using **Select** does not raise the soft keyboard. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: the terminal input is not focused before, during or after either tap, or after a tap on the paused text; dashboard/tests/terminals/agent-terminal-touch-select.spec.ts: focus stays in the terminal when it was there |
| U10 | The only way out that the developer needs to learn is the same control. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: a tap on the paused text leaves it paused; dashboard/src/TerminalPausedText.tsx offers no other exit |
| U11 | A session that needs the developer while its terminal is paused is announced by the Dashboard's existing session attention. | slice 2 | observed: inspection: session attention is rendered by dashboard/src/SessionsSidebar.tsx and SessionAttentionMessage.tsx from the machine’s sessions, outside the Terminal panel; usePausedTerminalText holds only the panel’s local paused state; no automated assertion pauses and then raises attention |
| U12 | That announcement does not come from the paused text. | slice 2 | observed: dashboard/frontend-tests/agent-terminal-touch-select.spec.ts first test: the status region stays empty and the paused text lies in no live, status or alert region |
| X1.1 | Copied text matches the screen. | slice 3 | |
| X1.2 | Where an application wraps its own lines to a phone-width terminal, a longer URL or command copies with those breaks. | slice 3 | |
| X1.3 | In that case it also copies with that indentation. | slice 3 | |
| X1.4 | Landscape gives longer rows. | slice 3 | |
| X1.5 | Unbroken text would come from a session's conversation instead of its terminal: a separate per-host story, to consider only if this hurts in practice (Terry's decision of 2026-11-11). | slice 3 | |
| X2 | Selecting directly on the live terminal by long-press is not promised. | slice 2 | observed: dashboard/src/terminalTouchScroll.ts and attachedTerminal.ts gain no long-press handling in this slice |
| X3.1 | One selection reaches what the terminal holds. | slice 3 | |
| X3.2 | More than one screen of an application-held conversation in a single selection is not promised. | slice 3 | |
| X3.3 | The stated route instead: swipe, then select again. | slice 3 | |
| X4.1 | The paused text need not carry the terminal's colors. | slice 2 | observed: dashboard/src/terminal-paused-text.css: one foreground and background from the terminal theme |
| X4.2 | The paused text need not carry the terminal's text styles. | slice 2 | observed: dashboard/src/terminalText.ts reads characters only (translateToString) |
| X5.1 | Automated proof uses the local Chromium touch viewports the terminal's existing touch proof uses. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts on phonePasteJourney and dashboard/frontend-tests/agent-terminal-touch-select.spec.ts, dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts at phoneLaunchTouchViewport with hasTouch |
| X5.2 | Their emulation cannot perform a device's long-press selection. |  | O1 |
| X5.3 | Automated proof covers the paused text. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts, dashboard/frontend-tests/agent-terminal-touch-select.spec.ts, dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts paused-text expectations in dashboard/tests/terminalSelectPage.ts |
| X5.4 | Automated proof covers a selected range reaching the clipboard. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts clipboard expectation |
| X5.5 | Automated proof covers a paste. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts Paste step |
| X5.6 | Automated proof covers the return to the live terminal. | slice 2 | observed: dashboard/tests/terminals/agent-terminal-touch-select.spec.ts and dashboard/frontend-tests/agent-terminal-touch-select.spec.ts expectLive |
| X5.7 | Automated proof covers the swipe case where the terminal holds the output. | slice 1 | observed: dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts and dashboard/tests/terminals/agent-terminal-touch.spec.ts at phoneLaunchTouchViewport, unchanged |
| X5.8 | Automated proof covers the swipe case where the application holds the output. | slice 1 | observed: dashboard/frontend-tests/agent-terminal-touch-application-scroll.spec.ts at phoneLaunchTouchViewport.portrait with hasTouch |
| X5.9 | The device gesture itself is confirmed once by a developer on a physical phone after delivery. |  | O1 |
