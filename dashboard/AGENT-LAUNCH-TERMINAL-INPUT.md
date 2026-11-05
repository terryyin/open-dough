# Terminal input

The [embedded terminal](AGENT-LAUNCH-TERMINALS.md) accepts ordinary typing,
dictation and input from the phone key toolbar.

## Dictation

The terminal header offers **Dictate into terminal** immediately before Mark as
done, or with the other actions when Done is unavailable. The microphone becomes
**Stop recording** during capture. From terminal input, **Alt+F10** focuses the
session actions; Tab reaches the microphone, and Enter or Space activates it.
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
be offered to its attachment stays visible in full. **Insert transcript** offers
it once to this session and focuses terminal input; an unavailable attachment
keeps the text for another deliberate attempt. **Discard transcript** sends
nothing. Settle it before recording again; closing or switching discards it.
Reconnect leaves unsent text pending and never resends text already offered.

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
terminal is disconnected, reconnect and tap **Paste** again. When the
clipboard includes a PNG, JPEG, GIF or WebP image, the terminal offers its
stored absolute path as one paste instead of the clipboard text. The status
region identifies the stored file or shows the server’s refusal. Images use
the launch attachment size limit of 10 MB.
An optional text composer edits longer drafts with the phone’s native
selection, autocorrection and dictation; deliberate Insert offers the draft
once through the same attachment `insert` path dictation uses, without a
trailing Enter, and deliberate Enter submits. An unavailable attachment keeps
the unsent draft for another deliberate Insert and never auto-replays it.
Direct typing remains available. One-finger swipe moves terminal scrollback
only; it does not send Up/Down or move an option-menu selection—toolbar arrows
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
launching or reconnecting it. Close and reopening follow the host lifecycles
above. Local Chromium touch viewport proof covers phone/tablet portrait,
landscape and a 240-pixel visible height, including toolbar keys, composer
Insert, soft-keyboard fit, Backspace, Enter and actual
browser-to-WebSocket-to-PTY replies. It does not establish physical iOS
keyboard, predictive-IME or remote connectivity behavior.
