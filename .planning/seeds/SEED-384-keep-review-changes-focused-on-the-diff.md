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

<a id="resize-and-remember-the-review-file-sidebar"></a>

### Resize and remember the Review changes file sidebar

**Identity:** SEED-384#resize-and-remember-the-review-file-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

Split from [Keep Review changes focused on the diff](#keep-review-changes-focused-on-the-diff)
during refinement, to be delivered after it.

#### Goal

A developer reviewing changes gives the file sidebar enough room for the paths
they need to read, once, and finds that width again in every later review in
the same browser.

#### Scope

Required behavior:

- A divider between the file sidebar and the diff, shown while both sit side
  by side. Dragging it changes their widths. It takes keyboard focus, and Left
  and Right move it in the arrow's direction; it says the sidebar's current
  width and bounds as the dashboard's other resize dividers do.
- Both panes stay usable: neither becomes narrower than its usable minimum,
  whatever is dragged or preferred.
- One preferred width serves every review, for any story or session, across
  closing and reopening and a page reload, kept as a disposable preference in
  this browser like the side panel's width
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  optional browser storage is disposable). Until the reviewer chooses, or
  where the browser keeps none or an unusable one, the sidebar takes today's
  default width.
- A limit the room sets never changes the preference: a narrower panel shows
  the sidebar as wide as the diff's minimum allows, and more room recovers the
  preferred width. Where the panel is too narrow for both panes side by side,
  files sit above the diff as today and no width divider is offered.
- Hiding and showing the sidebar restores it at the preferred width.

Scope limits:

- A height divider for the narrow, stacked layout.
- Intent's locations column keeps its own width.
- Sharing the preference across browsers or machines.

#### Key examples

- **Drag.** Review open side by side at the default width, long paths cut off
  → drag the divider right → the sidebar widens and the diff narrows by the
  same amount → close the review, open another story's review → the sidebar
  has the dragged width.
- **Reload.** After that choice → reload the page and open **Review changes**
  → the same width.
- **Keyboard.** Focus the divider → Right → the sidebar is one step wider and
  the divider says the new width; Left returns it.
- **Bounds.** Drag far right → the sidebar stops where the diff reaches its
  minimum; drag far left → the sidebar stops at its own minimum.
- **Temporary limit.** A wide preferred width, then the side panel is narrowed
  until the room cannot give it → the sidebar is narrower, both panes usable →
  the panel is widened again → the preferred width returns, without the
  reviewer choosing again.
- **Narrow panel.** The review body is too narrow for both panes → files sit
  above the diff and there is no width divider → widened, the divider returns
  with the preferred width.
- **No choice yet.** A browser that keeps no preference → the sidebar has
  today's default width.

#### Architecture

Reuse the dashboard's one resize mechanism: the shared resize divider, the
shared room calculation, and kept browser preferences that the side panel and
Sessions sidebar already use. The divider gains the case of an area on its
leading side, where Right grows the area. No server state.
