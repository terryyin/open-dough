---
id: SEED-224
status: active
planted: 2026-11-03
planted_during: Terry Yin's request to unify dashboard story selection and highlighting
trigger_when: A developer inspects stories, opens story content in the Side panel, or reads the selected story in Intent
scope: story
---

# SEED-224: Unify story selection across Development and Intent

## Selected Stories

<a id="unify-story-selection"></a>

### Unify story selection across Development and Intent

**Identity:** SEED-224#unify-story-selection
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/454-unify-story-selection/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4a49e88ac677710aea7894c760acd0c9b39faff30fcdf2ee747df536412d1b97","plan":"1acf43521564cf8e4e9d76c63ab6887ba34b4c8b99fee7443e268fb50b3f5530"}}
```

**Goal:** A developer can tell which story the dashboard is showing and read
its Intent, without reconciling a card's inspection border with a separate
Side panel outline. The page keeps one **selected story**. Its card is
**highlighted**, and Intent reads the same story. **Inspect** only opens a
card's inline detail. This applies ADR 0008's rule of one name and one
responsibility per concept to dashboard selection.

**Scope**

- Required behavior:
  - The page has one selected story at a time, or none. Two things set it:
    opening one of the story's terminals, final reports, or reviews in the
    Side panel, and toggling its card's **Select story** control.
  - Every card in Backlog, Taken, and Recently done has **Select story** in
    its action group. The control shows whether it is pressed, and it works
    by pointer and keyboard. Clicking an empty area of a card is the pointer
    shortcut for the same toggle. Toggling the selected story's card clears
    the selection.
  - Opening other content in the Side panel replaces any earlier selection,
    including one made on a card. Opening content of the already selected
    story keeps it selected. Selecting a card leaves the Side panel as it is.
  - Closing the Side panel clears the selection. So does showing a session
    that is attached to no story. This includes a panel that closes because
    its session is marked done or its record is deleted.
  - The selected story's card is highlighted wherever it is visible. The
    highlight replaces both the inspection border and the Side panel outline
    on cards.
  - Inspection belongs to each card on its own. **Inspect story** opens and
    closes that card's inline detail, and its control shows whether the
    detail is open. Several cards can have their detail open at once.
    Inspecting never changes the selected story. Selecting never opens or
    closes detail. Following a dependency's story reference reveals the
    target card and opens its detail without selecting it.
  - Intent reads the page's selected story for its story lens and its CI
    status. With no selected story it shows no lens, and CI status judges
    the trunk.
  - Terminology: **selected story** names the shared state, **highlight** its
    visual indication on a card, and **inspect** the opening of a card's
    inline detail. ADR 0008's Dashboard UI concepts and the maintained
    Development, navigation, Side panel, and Intent documentation use these
    meanings. The wording that tied selection to inspection, or that
    described a separate card mark for Side panel content, is replaced.
- Scope limits:
  - The selection is page state that the URL does not record, as today. It
    does not survive a reload.
  - No new Side panel content. A story becomes selectable through content
    that already exists, or through its card's toggle.
  - Plan 448 (SEED-192#align-intent-story-lens, currently Taken) keeps its
    own outcomes: disclosure content inside a card is not an empty area, and
    Intent's **Review changes** opens Intent's comparison. This story keeps
    both and changes only what the click toggles.
- Boundary assumptions:
  - One Side panel serves every project on the page, and selection is one
    page-wide project and story. While the page shows a project that does not
    own the selected story, that project has no selected story. Toggling one
    of its cards selects that card.
  - Session entries keep their own "shown" mark for the session the Side
    panel shows. That mark identifies a session, not a story selection.

**Key examples**

- No story is selected, and the developer opens Story A's terminal from its
  card. Story A is selected and highlighted, and its **Select story** shows
  pressed. Intent names Story A and shows its branch's CI status. Opening
  Story B's final report then moves both the selection and the highlight to
  Story B.
- The Side panel shows Story A's review. The developer opens Story B's
  detail with **Inspect story** and then closes it. Story A stays selected
  and highlighted, and Story B's control shows open and then closed. With
  the Side panel closed, opening Story B's detail leaves no story selected.
- The Side panel shows Story B's terminal, and the developer clicks an empty
  area of Story A's card. Story A is selected and highlighted, Intent reads
  Story A, and Story B's terminal stays in the Side panel. Clicking Story A's
  empty area again clears the selection. Neither click opens or closes any
  detail.
- A keyboard user tabs to a Backlog card's **Select story** and presses
  Enter. That story is selected and highlighted, and the control shows
  pressed. Pressing Space clears the selection again. Neither key opens or
  closes the card's detail.
- A Taken story is held on another machine, so it has no local session and
  no Review changes. The developer selects its card. Intent's CI status
  judges that story's published story branch, as it does today through
  inspection.
- The developer opens a Recently done story's Review changes. That done card
  is highlighted, and Intent's lens shows the completed story. Clicking the
  card's empty area clears the selection and leaves the review open.
- Story A is selected through its terminal. The developer closes the Side
  panel, or opens a session attached to no story. The highlight disappears,
  and Intent shows no story lens and judges the trunk.
- Stories A and C both have their detail open. The developer follows a
  dependency reference to Story D. Story D's card is revealed with its detail
  open, A and C stay open, and the selection does not change.

**Deferred promises**

- A way to select a story from Intent itself.
- Keeping the selection across a reload or in the URL.

**Architecture:** The selected story is one page-level state. Two kinds of
change set it: the Side panel's open and close transitions, and each card's
Select story toggle. Today `pageStorySelection.tsx` keeps a per-project
selection that inspection toggles, and `StoryCard`'s `in-side-panel` class
gives a second "shown" mark. After this story, the Side panel owner sets and
clears the selection as its content changes, card toggles set or clear it,
and the highlight is the card's only selection mark. Inspection moves to its
own per-card state. Story navigation must be able to open a card's detail
from outside the card, so that state needs a page-level owner keyed by
project and story. Both remain disposable UI state, as ADR 0008 requires.
No Accepted decision conflicts.
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)'s
concept table gains the three terms, and the selection gets one name and one
responsibility, as that ADR requires.

**Decision references:** [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
defines dashboard concepts and calls for one name and responsibility per
concept. [ADR 0001, Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
guides consistent terms across the product and its documentation.
