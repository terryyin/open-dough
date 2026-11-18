---
id: SEED-384
status: active
planted: 2026-11-16
planted_during: Request to simplify Review changes and remember the file sidebar width
trigger_when: selected from the product backlog
scope: story
---

# SEED-384 — Keep Review changes focused on the diff

**Temporary design reference.** Keep the [interactive Review changes mockup](../mockups/review-changes.html)
through both stories so reviewers can compare the compact and revealed layouts
and try the sidebar interactions. It shows Landed runs and Published
completion; the stories below say what the other comparisons do. Remove it
during the wrap-up of whichever story is delivered last, after the delivered
UI is verified.

<a id="keep-review-changes-focused-on-the-diff"></a>

### Keep Review changes focused on the diff

**Identity:** SEED-384#keep-review-changes-focused-on-the-diff

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/695-keep-review-changes-focused-on-the-diff/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"877c4e6dbf88e5ff9e72fb2d64b165882f1420ec11d0d7aa50acd5121cb55bf5","plan":"766887795fee3031aac8f5d5a6f82ad2ac87923e2e81db27179a215b8f71ce73"}}
```

#### Goal

A developer opens **Review changes** and can start reading the diff right away:
the panel opens with one slim toolbar above the files and the diff. They can
reveal which changes they are reviewing and choose another comparison or landed
run when they want to, and hide or show the file sidebar from the same place
whatever is revealed.

#### Scope

Required behavior, for every review the panel shows (a story's workspace, a
landed run, a published completion, an ad hoc session's landing):

- **One toolbar.** Under the panel header, the toolbar holds the file sidebar
  toggle at the far left, then the name of the comparison shown (**All
  changes**, **Commits**, **Landed runs**, **Published completion**) beside
  the details toggle. The comparison name alone identifies the comparison; it
  does not name the selected run.
- **Details collapsed on every opening.** One inline section between the
  toolbar and the work area holds what the panel shows above the work area
  today: the Comparison choices, the **Landed run** picker when there is more
  than one run, and the context of the comparison shown — the workspace context
  line, the landed run's workflow, launch time, target and captured base and
  delivered revision, or the published completion's facts — and **Include
  uncommitted changes**. Each keeps today's words, facts and behavior. The
  expanded state lasts while the panel stays open, across comparison and run
  choices and Refresh, and is not remembered for the next opening.
- **Details toggle.** An outlined eye icon button, named **Show review
  details** or **Hide review details** in its accessible name and tooltip,
  exposing its expanded state. Escape from inside the details collapses them
  and returns focus to the toggle. Revealing or hiding keeps the comparison,
  the selected file and the diff's scroll position, and choosing a comparison
  or run updates the toolbar name, the details and the diff together.
- **File sidebar toggle.** An outlined sidebar icon button, named **Hide
  files** or **Show files** in its accessible name and tooltip, offered when
  the comparison has files. It stays in the same place whether the sidebar is
  shown or hidden and works with the details collapsed. Hiding gives the diff
  the freed width; showing restores the sidebar with the current file
  selected. The sidebar starts shown on every opening, as today.
- **Always visible.** Reading progress, a problem, and an unavailable or empty
  comparison's explanation stay outside the details, so they explain
  themselves while the details are collapsed. In **Commits**, the chosen range
  heading and the commit list stay visible: choosing commits is that
  comparison's work.
- Touch input keeps full-size activation surfaces for both toggles, and the
  narrow layout keeps files above the diff.

Scope limits:

- Resizing the file sidebar and remembering its width, delivered separately.
- Naming the selected landed run in the collapsed toolbar was considered and
  deferred: the newest captured run opens by default, so the name can mislead
  only after the reviewer chose another run in this opening.
- Remembering the details' or the sidebar's shown state across openings.
- Intent's locations toggle keeps its words and place.

#### Key examples

- **Landed run, compact.** A completed story has two captured landed runs →
  the developer opens **Review changes** → the toolbar shows the sidebar
  toggle, “Landed runs” and the eye named **Show review details**; no
  Comparison choices, run picker or run facts are shown; the changed files and
  the first file's diff are readable.
- **Reveal and choose a run.** In that review, with the second file selected
  and its diff scrolled → the developer activates the eye → the Comparison
  choices, the **Landed run** picker and the selected run's workflow, launch
  time, target and revisions appear above the work area, the eye is named
  **Hide review details**, and the selected file and scroll position are
  unchanged → they choose the older run → details and diff show that run, and
  the details stay revealed.
- **Escape.** Focus is on the run picker in the revealed details → Escape →
  the details collapse and focus is on the eye.
- **Workspace review.** An active story's workspace has committed and
  uncommitted changes → open **Review changes** → the toolbar shows “All
  changes”; the worktree and baseline context and **Include uncommitted
  changes** are not shown until the eye reveals them. After choosing
  **Commits** in the details, the toolbar shows “Commits” and the commit list
  stays visible when the details are hidden again.
- **Evidence gap while collapsed.** The only landed run has no captured
  comparison → open **Review changes** → the explanation that its delivered
  comparison was not captured is shown with the details collapsed, and no
  sidebar toggle is offered.
- **Sidebar toggle.** Details collapsed, third file selected → **Hide files**
  → the diff takes the sidebar's width, and the toggle sits in the same place
  named **Show files** → **Show files** → the sidebar returns with the third
  file selected.
- **Next opening.** The developer leaves the details revealed and the sidebar
  hidden, closes the review, and opens another story's review → details
  collapsed, sidebar shown.

#### Architecture

No new consequential concern. The panel keeps its one multi-purpose side-panel
region and read-only review boundary; only where the existing controls sit
changes.

<a id="one-owner-for-the-review-file-sidebar-sizing"></a>

### Give the review file sidebar's sizing one owner

**Identity:** SEED-384#one-owner-for-the-review-file-sidebar-sizing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/699-one-owner-for-the-review-file-sidebar-sizing/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3ccf7e73c3c03a4372e476f089ded6243526976181ef5168b8ac061d32e69185","plan":"849ba1b9d2b364735292deb88f7350a6cb19b180fd216f5f5f8763a6596c4716"}}
```

Correction from the retrospective of
Resize and remember the Review changes file sidebar
(`88a7f2348:.planning/seeds/SEED-384-keep-review-changes-focused-on-the-diff.md`, section `resize-and-remember-the-review-file-sidebar`).

#### Goal

Dashboard maintainers change the review file sidebar's width, its default or
its divider's grip in one place each, and its tests prove only what the review
adds to the shared kept preference, with the review's behavior unchanged.

#### Scope

- The review file sidebar's side-by-side and stacked sizing, and its 16rem
  default, each have one owner; the Panel divider and the Files divider share
  one vertical grip.
- The Files divider specs keep proof of the review's own rules and stop
  repeating the shared kept-preference proof; reaching the divider's upper
  bound is explicit.
- No product behavior changes, and no new product promise. Intent's locations
  column keeps its width.

Plan: [699-one-owner-for-the-review-file-sidebar-sizing](../slice-plans/699-one-owner-for-the-review-file-sidebar-sizing/PLAN.md)
