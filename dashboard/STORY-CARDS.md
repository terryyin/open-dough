# Story cards

Each story card has scan and detail views. The scan starts with title, backlog
priority, and the assigned or preparing developer with its credited human, tool
and model, preparation and readiness badges, dependencies and evidence warnings,
a Taken story's slice count with its clock or completion and a short source
qualification, its launch group, its compact sessions, and its inspection group.
The [Session entry contract](AGENT-LAUNCH-SESSION-ENTRIES.md) defines compact
facts, disclosures, attention and readiness. The launch group holds **Start
execution** and **Start refinement**, each with any launch answer beside it and
any note in its tooltip; the inspection group holds **Select story**, **Inspect
story** and, when offered, **Review changes**. Each group's actions share a line
when the card is wide enough and wrap in reading order when it is not. Each
action but **Select story** leads with a decorative icon that says what it does:
a play glyph for **Start execution** and a pencil for **Start refinement**,
noted or disabled alike; a chevron for **Inspect story** that points right and
turns down while the detail is open; and a compare glyph for **Review changes**,
which also ends with an arrow toward the side panel. **Inspect story** opens its
detail from facts already read: full identity, purpose, what the assignment
records with its mode and branch context, preparation explanations, the exact
progress branch and revision, slice evidence, product advice, and source links;
**Hide detail** closes it and returns focus to the card. Several cards can have
their detail open, and inspecting never changes the selected story. **Select
story**, or a click on an empty area of the card, makes the story the page's
selected story, which Intent reads, and highlights its card with an inset accent
ring and a pale fill; toggling it again clears the selection. Opening the
story's terminal, final report, or review in the Side panel selects it too;
closing the Side panel, or showing a session attached to no story, clears the
selection, and selecting a card leaves the Side panel as it is. The page has one
selected story across its projects, so a project that does not hold it shows
none. The highlight is the card's only selection mark. Selecting never opens or
closes detail, and stays available while the story starts. The
dependency explanation opens in place from the card's **Dependencies** summary
(see [Blocking story dependencies](README.md#blocking-story-dependencies)).

A done story card in Recently done also holds the story's review state among
its Story actions, after **Review changes**. An unreviewed story offers **Mark
as reviewed** and shows no badge; a reviewed one says **Reviewed**, a status in
words rather than a control, with the quieter **Unreview** beside it. Both
actions offer the shared touch control height. Either keeps the card at its
place with its sessions and other actions, the shown range, the entry count,
the selected story and the Side panel as they were, leaves the keyboard on the
action that then shows, and is announced once. A change that could not be
saved, because the machine could not write its local records or the dashboard
was not reached, leaves the card showing the state last saved, with the
keyboard on the action still shown, and says "The review state could not be
saved." until the action is used again and saved. The action is offered from the
identity the done catalog names, so a card whose record is still being read,
or could not be read, offers it too; nothing shows until the project's states
are first read. The state belongs to the story, by project and identity, not
to a session, launch or workspace, so a story completed on another machine
starts unreviewed. It is kept on the machine serving the dashboard in
`~/.open-dough/dashboard/story-review-states.json`
(`server/storyReviewStates.ts`), an entry meaning reviewed, and a missing or unreadable file reads as nothing
reviewed. It is local evidence, never a published story fact: nothing is
written to the project's repository. Each page reads it once per project and
again at the shared revision check interval, so every page of that server
shows a change at its next read; the page making a change shows it at once.
Its request is a same-origin GET or POST to
`/__project-configuration/story-review-states?id=<project>`, the POST naming
the story identity and the state, never a path. Backlog and Taken cards,
session entries, the Sessions sidebar and Intent show no review state.
