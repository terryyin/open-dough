# Story notes

Every Backlog, Taken and Recently done story card offers **Notes**. It opens
**Story notes** over the page, leaving its terminal and review in place.
The count is shown when the story has notes.

Choose **Add note**, type an observation, then **Save note**. A general note
belongs to the story alone: its identity and title are shown above the text
and with each saved entry. **Cancel** discards the draft. Blank text is not
saved. Saved entries are listed newest first, and saving is announced once.
A note records an observation; it has no fixed or resolved state.

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
