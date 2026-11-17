# Story notes

Every Backlog, Taken and Recently done story card offers **Notes**. It opens
**Story notes** over the page, leaving its terminal and review in place.
The count is shown when the story has notes. While any note is waiting for a
follow-up, **Notes** is described with “1 note waiting” or “<n> notes waiting”;
that waiting count goes away once none are.

The same **Notes** control appears in a story’s Review changes heading and
beside the selected story in Intent. Story notes opens over the current
activity. Closing it keeps the comparison, selected file, revealed context
and reading position, and returns the keyboard to **Notes**.

Choose **Add note**, type an observation, then **Save note**. A general note
belongs to the story alone: its identity and title are shown above the text
and with each saved entry. **Cancel** discards the draft. Blank text is not
saved. Saved entries are listed newest first, and saving is announced once.
A note records an observation. Each saved entry shows **Waiting for follow-up**
until a session receives its current text, then **Sent to follow-up**. New notes
are waiting. Saving an edit of a sent note, with or without changing its text,
makes it waiting again so it can be sent once more.

**Dictate** records a note using the same microphone and OpenAI setup as a
session instruction. Choose **Stop recording**, then correct the transcript
in the note text before **Save note**. Saving waits while permission,
recording, transcription or transcript review is in progress. A transcript
that exceeds the 4,000-character note limit opens for shortening or discarding
and keeps the typed note. **Cancel** or closing Story notes stops recording
and abandons transcription. Opening OpenAI settings keeps the draft for return.

Notes are kept by project and story identity on the machine serving the
dashboard, outside the project's repository. They survive dashboard restarts
and are available to every page served by that machine, including a phone.
Other open pages read changes at the shared 15-second check interval.

If the machine cannot write its records or the dashboard cannot be reached,
**Save note** keeps the composer open with its text and says “The note could
not be saved.” Try **Save note** again once saving works; the note is saved
and the composer and problem clear.

If the notes file cannot be read, cards say “The notes could not be read.”
in place of a count. Story notes says the same; it does not present the
unreadable file as an empty collection. The machine keeps that file in place
for recovery, and refuses to save over it.

Each saved entry offers **Edit** and **Delete**, including after it is sent.
**Edit** opens **Edit note** with the saved text and context; **Save note**
changes the text while keeping its original context and saved time, and keeps
any delivery so the new version waits again. Diff context includes the view, current
and previous file paths, comparison and endpoints, and a line's number, side
and original text. **Delete** asks in place. **Cancel** keeps the entry;
confirming removes it and updates the card's count. Updates and deletions are
announced once, with the keyboard returned to an available control.

A refused edit keeps the composer and typed text with “The note could not be
saved.” A refused delete keeps the saved entry and says “The note could not
be deleted.” Try the action again once the dashboard can keep changes.

A Done story’s Published completion or Landed run offers **Add note** beside
the file path and beside **Follow up** in each line-number menu, in Review
changes and Intent → Changed tests. The composer opens alone over the diff
and closes after saving. Its context shows the view, file path (including
the previous path of a rename), comparison name and endpoints; a line note
also keeps its number, side and the text as it read, including revealed
context lines. The saved entry shows the same facts away from the diff.

Captured context is developer-authored evidence of what the page showed when
the note was made. It stays readable after the workspace or compared Git
trees are gone.

A Done story’s follow-up dialog offers **Attach story notes**
([Follow up](LAUNCH-FOLLOW-UP.md)): checked with “<w> waiting of <n> notes”
when notes wait; unavailable with “No waiting notes” when none wait or the
story has none; unavailable with “The notes could not be read.” when the
notes could not be read. Starting while it is checked asks the server to
attach notes; unchecking or cancelling asks for none. The server then sends
only the waiting notes from this machine’s store at admission, each with its
text and context, after the story’s own follow-up context and outside the
4,000-character request. Sent notes are not attached. The session input
labels them as the developer’s story notes and their context as what the
dashboard showed when the note was taken. The attach choice is part of that
launch’s identity; a retried start resends the notes saved with the attempt.
Delivery into **Sent to follow-up** waits until the host confirms the first
input. A Taken story’s card still shows how many notes are waiting, and
offers no way to send them until the story is Done.

A Taken story’s workspace comparisons also offer **Add note** at the file and
line. Its line menu holds **Add note** alone; **Follow up** retains its Done
comparison eligibility. Notes keep the Comparison switch’s words and the
actual endpoints. They stay with the story through new launches, completion
and workspace removal. A session without a story offers no notes actions.
