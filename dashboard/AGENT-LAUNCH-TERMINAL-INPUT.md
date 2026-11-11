# Terminal input

The [embedded terminal](AGENT-LAUNCH-TERMINALS.md) accepts ordinary typing,
common prompts, dictation and input from the phone key toolbar.

Fixed prompts, dictation, **Insert transcript**, toolbar keys and **Paste**, and composer
**Insert** are accepted under the same condition as typing: the panel's current
attachment is open and was not refused. That includes a visible native prompt
whose readiness the server has yet to confirm. Such input confirms no
readiness and clears no Done mark; only a confirmed ready screen reopens the
session.

## Common prompts

The terminal header offers **Prompts** immediately before Mark as done, or with
its other session actions when Done is unavailable, on desktop and mobile.
The menu offers exactly `OK`, `as recommended`, and **Dictate into terminal**.
Selecting a fixed phrase closes the menu and inserts that literal text through
the normal attachment insert path, then focuses terminal input for editing and
submission with deliberate Enter. Existing input remains; selecting sends no
Enter. When input cannot be accepted, feedback names **Reconnect**, **Open
again**, or says the terminal is still connecting. Recover, then open **Prompts**
again; nothing is retried automatically.

## Dictation

Choose **Dictate into terminal** from **Prompts** to close the menu and start
capture. **Stop recording** replaces **Prompts** during capture; **Prompts**
returns when capture ends. From terminal input, **Alt+F10** focuses session
actions; Tab reaches **Prompts**, and Enter or Space opens its menu. Use the
menu's choices to insert a reply or start dictation.
Ordinary Tab, Shift+Tab and Escape still belong to the native terminal. Permission, recording and transcription state
are announced in the panel; Close and ordinary typing remain available. Recording
uses the same configured OpenAI access and safe recovery guidance as launch
instruction dictation. A completed transcript is offered once through the current
terminal's normal input path, then focus returns there. Existing input remains;
line breaks become spaces and terminal controls are removed. Dictation sends no
Enter and has no launch-field separator or 4,000-character limit. Edit and press
Enter deliberately to submit. A local offer is not a native delivery receipt and
is never replayed automatically.

Capture and pending results belong to the open session view. Close, switching
sessions and a successful Mark as done that closes it cancel capture and pending
requests, including late permission or transcript delivery. A result that cannot
be offered stays visible in full, with feedback naming the panel's **Reconnect**
or **Open again** action, or saying the terminal is still connecting.
**Insert transcript** offers it once to this session and focuses terminal input;
an unavailable attachment keeps the text for another deliberate attempt.
**Discard transcript** sends nothing. Settle it before recording again; closing
or switching discards it.
Reconnecting or opening again leaves unsent text pending and sends nothing by
itself; text already offered is never resent.

## Phone keyboard

On coarse-pointer / soft-keyboard use, tap the terminal to focus its ordinary
input, edit with the browser keyboard and submit with Enter. A key toolbar
above the soft keyboard supplies Esc, Tab, arrows, Enter and Paste. Expand
**More** for less-frequent controls such as Ctrl+C. Sequence keys use the
same terminal → WebSocket → PTY path as typing. Toolbar taps preserve the
soft keyboard’s current visibility.
**Paste** reads the phone clipboard and offers its text as one terminal paste
with control sequences removed and no trailing Enter. If the browser cannot
read the clipboard, open Compose and use the keyboard’s own Paste. If the
terminal cannot accept input, the status names the panel's **Reconnect** or
**Open again** action, or says it is still connecting; then tap **Paste**
again. When the
clipboard includes a PNG, JPEG, GIF or WebP image, the terminal offers its
stored absolute path as one paste instead of the clipboard text. The status
region identifies the stored file or shows the server’s refusal. Images use
the launch attachment size limit of 10 MB.
An optional text composer edits longer drafts with the phone’s native
selection, autocorrection and dictation; deliberate Insert offers the draft
once through the same attachment `insert` path dictation uses, without a
trailing Enter, and deliberate Enter submits. An unavailable attachment keeps
the unsent draft for another deliberate Insert and never auto-replays it.
Direct typing remains available. One-finger swipe scrolls the output wherever
it is held. Where the terminal holds it, the swipe moves terminal scrollback
and sends the session nothing. Where the session’s application has taken over
the screen and takes the wheel, as Claude Code does, the swipe gives it wheel
input where the finger went down, one step per row of travel, as a desktop
wheel would. The terminal’s reported pointer tracking decides, not the host.
A swipe never sends Up/Down or moves an option-menu selection—toolbar arrows
navigate menus and the application cursor. When the soft keyboard opens,
closes or the device rotates, the Side panel terminal region, toolbar and
composer actions fit the visible area (including an explicit Hide keyboard
control); toolbar, composer actions and Close stay reachable at reduced
height, and the current attachment, typed input and unsent draft survive
without reconnecting solely to re-fit. Fine-pointer desktop hardware-keyboard
use omits that phone chrome and keeps today’s terminal behavior. With reduced
visible height, a long session title and identity scroll independently in the
header, leaving the input and Maximize/Restore/Close controls reachable.
Maximize gives the terminal the available window; restoring, changing
orientation or reducing visible height fits that same attachment without
launching or reconnecting it. Closing and reopening follow the
[embedded terminal lifecycles](AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions). Local Chromium touch viewport proof covers phone/tablet portrait,
landscape and a 240-pixel visible height, including toolbar keys, composer
Insert, soft-keyboard fit, Backspace, Enter and actual
browser-to-WebSocket-to-PTY replies. It does not establish physical iOS
keyboard, predictive-IME or remote connectivity behavior.
