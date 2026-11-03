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
