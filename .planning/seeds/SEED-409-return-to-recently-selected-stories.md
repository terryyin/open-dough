---
id: SEED-409
status: active
planted: 2026-11-19
planted_during: Terry requested a selected-story indicator and history in the Dashboard banner
trigger_when: selected from the product backlog
scope: one story
---

# SEED-409 — Return to recently selected stories

<a id="return-to-recently-selected-stories"></a>

### Return to recently selected stories

**Identity:** SEED-409#return-to-recently-selected-stories

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/718-return-to-recently-selected-stories/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7fd57ddb982e47a6beeb68fe72fce3774e62989650db3fd0085cac7215d74544","plan":"e94a9f29d8e72d088fdd690b0f043c954e32e92e467f20ed5be89a5c2c8c634b"}}
```


**Goal.** A developer using the Dashboard can tell at a glance whether a
story is selected. They can get back to it after scrolling, switching views or
reloading, and can return to stories they selected earlier, including stories
in other projects. This keeps their place while they move between sessions,
reviews and Intent readings, without searching the Board.

**Scope.**

- *Required behavior.*
  - The banner gets one **Recent stories** icon button in its own group,
    immediately beside the Development/Intent perspective choice. It shows a
    filled bookmark when a story is selected and an outline bookmark when none
    is. Its accessible name also says which state it is in.
  - Clicking the button either reveals the current story or opens the
    **Recent stories** popover anchored to it. It reveals the story when one
    is selected and its start is not in view. Otherwise it opens the popover.
  - The popover lists the current story first, checked, when one is selected.
    Earlier selections follow, most recent first. Each project and story pair
    appears once, and each row is labelled with its project. An empty history
    says so.
  - Choosing a row selects that story and closes the popover. If the story
    belongs to another project, the Dashboard switches to that project. The
    current perspective stays, and the story is revealed. This works like
    choosing a linked Recently done sessions row.
  - What "reveal" means:
    - In Development, Columns shows the project's stories, leaving Roster
      when it was shown, and brings the story card into view.
    - In Intent, the selected story's view is shown, leaving Project Intent
      when it was chosen, and its start is brought into view.
    - A story counts as in view when the start of its card or Intent view is
      on screen. A tall card whose top is visible therefore counts.
  - Every way of setting the Selected story adds that story to the history,
    including Side panel openings and Recently done rows. Clearing the
    selection leaves the history as it is.
- *Retention (decided by Terry, 2026-11-19).* Each browser keeps the 10
  most recently selected distinct stories, including the current one, in its
  disposable storage, so the history survives a reload. When storage is
  unavailable, the history lasts only for the page. The selection itself
  stays page state and is still lost on reload. The limit keeps the popover
  readable without scrolling and keeps old stories from accumulating forever.
- *Scope limits.*
  - History is not shared across browsers or devices, and the selection is
    not added to the URL.
  - Rows show only the project and story identity. They do not read titles
    or status from other projects' snapshots.
  - A row whose story is no longer on the Board gets no new handling. In
    Development, choosing it follows the story the way a story reference
    does, so the existing reference notice reports the story as unavailable.
    In Intent, the story is selected with nothing new added. Pruning or
    marking such rows is deferred.
  - No keyboard shortcut is added beyond the popover's own keyboard use.

**Key examples.**

1. No story selected, empty history → developer looks at the banner → the
   outline bookmark is shown and its name says no story is selected. Click
   it → the popover opens and says there are no recent stories.
2. Story A selected, card scrolled out of view → click the button → the
   Board scrolls A's card into view and the popover stays closed. Click again
   → the popover opens with A checked at the top.
3. Story A selected, A's card top visible (even if the card runs below the
   fold) → click the button → the popover opens straight away.
4. A, then B, then A selected → open the popover → A (checked), then B. A
   appears only once.
5. A selected, then cleared by clicking its card's empty area → the button
   shows the outline bookmark. Click it → the popover lists A, unchecked.
6. Showing project P, history holds story C of project Q, Development's
   Roster view shown → choose C's row → the popover closes, project Q's
   Columns show, C's card is selected and brought into view. Reopening the
   popover lists C checked first, followed by the previous current story.
7. Intent perspective, A selected, developer switched to Project Intent →
   click the button → A's Intent view shows from its start, and the popover
   stays closed.
8. Eleven distinct stories selected in turn, then the page reloads → no story
   is selected, and the popover lists the last 10, newest first. The first
   story selected is gone.

**UI.** Use a filled bookmark for a selected story and an outline bookmark
for none. Anchor the popover to the button, with each row showing its project
label and story identity and a check on the current story. Pressing Escape or
clicking outside closes the popover without changing anything.

**Architecture.** The page gets one new responsibility: a history of selected
stories, owned next to the Selected story in PageFrame and fed by every
selection change. Its storage follows the existing
[`keptPreference`](../../dashboard/src/keptPreference.ts) pattern. ADR 0008
allows optional browser storage when it is disposable. In Development, revealing a story
reuses the story-reference journey
([`storyReferenceJourney.tsx`](../../dashboard/src/storyReferenceJourney.tsx)),
which switches project, reaches into Recently done, focuses and cues the card,
and reports an unavailable story. It also reuses the card marks in
[`storyCardFocus.ts`](../../dashboard/src/storyCardFocus.ts) and Intent's
story/project scope. ADR 0008 requires one name per UI concept. Its
[Dashboard UI concepts](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
therefore gain **Recent stories**, and the Selected story entry gains the new
way of setting it. No Accepted decision conflicts.
