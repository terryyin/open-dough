---
id: SEED-328
status: active
planted: 2026-11-12
planted_during: Terry requested review tracking for completed stories
trigger_when: selected from the top of the product backlog
scope: story
---

# SEED-328 — Mark Recently done stories as reviewed

<a id="mark-recently-done-stories-as-reviewed"></a>

### Mark Recently done stories as reviewed

**Identity:** SEED-328#mark-recently-done-stories-as-reviewed
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/602-mark-recently-done-stories-as-reviewed/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4daf594e959c2f99b135130d6c4ce76b1063408e48bdaa113280f593ab897079","plan":"f0a4785795123689a4bfa8cfcd49b44822f528104181eb67c1d4df00e163f864"}}
```

#### Goal

A developer scanning the Dashboard’s **Recently done** column can see which
completed stories they have not yet reviewed, and record or clear that
judgment from the story’s card. The broader ambition, working through
everything that still needs review, is larger than this story: this story
makes the judgment recordable and visible on each shown card.

#### Scope

Required behavior:

- Every done story card in Recently done has one review state, **unreviewed**
  or **reviewed**, belonging to the story (its project and identity) and
  independent of sessions, launches and workspaces. A story with no saved
  state is unreviewed, so every story completed before this increment starts
  unreviewed, including one completed in a terminal or on another machine.
- An unreviewed card offers **Mark as reviewed** among its Story actions. A
  reviewed card shows a **Reviewed** indicator in that place and offers
  **Unreview** as a secondary action. The indicator and the action names carry
  the state in words, so it reads without color and by assistive technology.
- **Mark as reviewed** saves the state; **Unreview** clears it and restores
  **Mark as reviewed**. Both keep the card in Recently done at its place, with
  its sessions, its other actions, the shown range and the entry count as they
  were, and neither changes the Selected story nor opens the Side panel.
- The state is kept on the machine that serves this dashboard, with its other
  local records under `~/.open-dough/dashboard/`. It outlives page reload,
  project refresh and dashboard restart, and every page that server serves,
  a phone included, shows the same state once it next reads.
- The action is offered from the identity the done catalog names, so a card
  whose record is still being read, or could not be read, offers it too.
- A save that fails leaves the card showing the state last saved and says
  that the review state could not be saved.

Required restriction:

- The review state is local evidence, never a published story fact: the
  dashboard writes nothing to the project repository for it.
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
  keeps record maintenance in the workflow and the dashboard an observer of
  published records.

Scope limits:

- The story review’s **Mark reviewed**
  ([review marks](../../dashboard/STORY-REVIEW-MARKS.md)) stays what it is, a
  mark of one workspace snapshot that later reviews compare against. Neither
  state sets, clears or reads the other.
- Standalone session entries, the Sessions sidebar’s Recently done sessions
  rows, Backlog and Taken cards, and the Intent perspective show no review
  state.
- Reviewed cards are neither hidden, dimmed out of reach, reordered nor
  counted separately.

Deferred promises (considered, not delivered here; nothing prevents them):

- Sharing the review state between machines or developers through a published
  record.
- A count or filter of unreviewed stories, or any way to find unreviewed
  stories beyond the entries Recently done shows.
- Marking from inside the story review, and showing when a story was reviewed.
- Clearing the state when later work lands for the story.

#### Key examples

- **Older story starts unreviewed.** A story was completed on another machine
  before this increment and has no local session → the developer opens
  Recently done → its card offers **Mark as reviewed** and shows no
  **Reviewed** indicator.
- **Marking is per story and survives reload.** Two unreviewed done cards A
  and B → the developer uses **Mark as reviewed** on A → A shows **Reviewed**
  and offers **Unreview**, B still offers **Mark as reviewed**, and both stay
  in place; after a reload, and after a dashboard restart, the same holds.
- **Unreview restores.** A is reviewed → the developer uses **Unreview** → A
  offers **Mark as reviewed** and shows no indicator, and still does after a
  reload.
- **Independent of the snapshot mark.** A done story whose workspace review
  holds a **Mark reviewed** snapshot mark and no saved review state → its card
  is unreviewed; marking the card reviewed leaves the snapshot mark and the
  review’s Changes since the review as they were.
- **Unread record.** A done card still says its record is being read → the
  developer uses **Mark as reviewed** → the card shows **Reviewed**, and keeps
  it once the record’s title and facts appear.
- **Failed save.** The dashboard cannot write its local records → the
  developer uses **Mark as reviewed** → the card still offers **Mark as
  reviewed** and says the review state could not be saved.
- **Selection untouched.** Story C is the Selected story → the developer
  marks A reviewed → C stays selected and the Side panel shows what it showed.

#### UI

- **Reviewed** is a status, not a control; **Unreview** sits beside it and is
  visually the quieter of the card’s actions. An unreviewed card has no
  “unreviewed” badge: the offered **Mark as reviewed** is its sign, so a
  column of unreviewed cards gains one action each and no extra noise.
- Using either action keeps the keyboard on the card: after **Mark as
  reviewed** it rests on **Unreview**, after **Unreview** on **Mark as
  reviewed**. The change is announced to assistive technology once.
- With touch input both actions offer the shared 44px control height.

#### Architecture

- One new machine-local responsibility: a story review state per project and
  story identity, kept as a machine document like the review marks and read
  with the project’s other local facts. It is local operational evidence
  under ADR 0008; a missing or unreadable document means every story is
  unreviewed, and no published record, Git ref or launch record changes.
- The state is keyed by the published story identity, not by a session,
  launch or workspace, so it holds for stories this machine never ran.

#### Considered alternatives

- **Derive “reviewed” from the existing snapshot mark or from having opened
  Review changes.** No new control, but 4 snapshot marks exist on this machine
  against 345 done records, a mark needs a readable workspace, and opening a
  review is not a judgment. Rejected as unable to cover every done story.
- **Publish the review state in the done record.** Shared across machines,
  but the dashboard would write and push a workflow record, which ADR 0008
  leaves to the workflow. Deferred with the sharing promise above.
- **A “Viewed” toggle as a code-review tool offers per changed file**, which
  clears itself when the file changes. Adopted as the per-story toggle; the
  self-clearing half is deferred, since a done story’s completion is fixed
  and later follow-up work is a separate promise.
