---
id: SEED-271
status: active
planted: 2026-11-08
scope: story
---

# Make the Intent sidebar easier to scan and hide

<a id="compact-intent-sidebar"></a>

### Make the Intent sidebar easier to scan and hide

**Identity:** SEED-271#compact-intent-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/525-compact-intent-sidebar/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d7193cc855ffdc3e9bf08474e7ea629ffab7f66314f5305f406dbbfdb073d774","plan":"8b91d094e8e5802bd8625e6fb26819567c58f47b207c20a4691244dc6f7f232f"}}
```

**Goal.** A developer reviewing a story in Intent can quickly spot the top-level
entries, give the reading pane more room, and see at a glance how many changed
files fall outside Intent locations. Intent's sidebar becomes easier to scan
and costs less room while reading, so reviewing a story's Purpose and Proof
needs less scrolling and searching.

**Scope.**

Required behavior:

- **Location headers read as section headers.** Each top-level Intent location
  header spans the sidebar edge to edge with its own colored background, its
  toggle and label padded inside that color, and a bold label that sets it
  apart from the folder and file rows beneath. The header keeps every cue it
  carries now: the selected background across its whole width (or the accent
  border when a CI duration tint would be hidden), the change mark on its
  leading edge, and a compared entry's count-border and duration-tint cues.
  The header color is distinct from those cues and from the shared background
  of folders holding changes, in light and dark themes.
- **Hide and show the sidebar.** While the **Intent** mode shows the location
  tree, the bar holding **Intent** and **Optimization Candidates** offers one
  toggle, **Hide files** / **Show files**, the same control and words Review
  changes uses for its file browser. Hiding removes the whole locations column
  (story summary and tree) and gives the reading pane the freed width; on a
  narrow screen, where the tree sits above the reading pane, the reading pane
  takes the full height. Showing it again restores the column as it was:
  selection, open location and folders, **Selected story only**, the summary's
  disclosure, and the tree's scroll. Hiding changes no selection or reading.
  The choice is kept in memory with Intent's reading place: across file and
  location selections, **Optimization Candidates** and back, Development and
  back, and new revisions; a project change shows the sidebar again. It is
  not on the URL or in storage. The control is keyboard-operable and states
  whether the sidebar is shown.
- **The story title while hidden.** With a story selected and the sidebar
  hidden in the **Intent** mode, the bar's remaining space at its trailing end
  names the story (`Story` and its title) on one line, truncated with the full
  title on hover. Nothing else from the summary appears there. Showing the
  sidebar removes it and the full summary returns above the tree.
- **Outside-locations count.** The summary replaces the sentence
  "N changed files outside Intent locations are shown in Review changes." and
  its separate button with one compact control on the story's title line: an
  icon and the count. Its accessible name and hover text explain the count
  and that it opens Review changes (for example, "2 changed files outside
  Intent locations — open Review changes"). Activating it opens Review
  changes on Intent's comparison (All changes, uncommitted included), as the
  button does now. With no such files, the control is absent.

Scope limits and deferred promises:

- No resizable sidebar, keyboard shortcut, or remembering the choice across
  reloads; the toggle is enough for "more room" and these remain open.
- No sticky location headers while scrolling; the full-width bold header is
  this story's scanning aid.
- While the sidebar is hidden, the bar shows no comparison state, **Retry**,
  or outside count. A comparison that is reading or failed is seen when the
  sidebar is shown again. Surfacing that state in the bar is a possible
  follow-up if hidden reading proves to miss failures.
- Development's layout, Review changes' own browser behavior, and the
  explanation shown in place of the tree (which has no sidebar to hide) are
  unchanged.

**Key examples.**

- Five locations configured, sidebar open → the developer looks down the
  sidebar → each location shows a full-width colored band with a bold name
  (`Dashboard Frontend Test`, `dashboard/tests`, …), and its folders and files
  read as rows inside it, without the band's color.
- `dashboard/tests` selected, with a story whose comparison changed files in
  it → the developer looks at the header → it carries the selected background
  across the full sidebar width and the change mark on its leading edge, as
  before.
- A story selected, a file's **Purpose** open, `dashboard/tests` and two of
  its folders open → **Hide files** → the reading pane spans the page width;
  the bar shows **Intent**, **Optimization Candidates**, **Show files**, and
  `Story Make the Intent sidebar easier to scan and hide` at its trailing end,
  ellipsized when it does not fit, the full title on hover → **Show files** →
  the summary, the same open folders, the selected file row and the tree's
  scroll return; the reading pane still shows that file's **Purpose**.
- Sidebar hidden, no story selected → the bar shows the toggle and nothing at
  its trailing end; the reading pane shows **CI status** across the width.
- Sidebar hidden → the developer switches to Development and back, or to
  **Optimization Candidates** and back → the sidebar is still hidden; picking
  another project → its Intent shows the sidebar.
- A story whose comparison changed two files that no Intent location selects →
  the summary's title line shows an icon and `2`; a screen reader hears
  "2 changed files outside Intent locations — open Review changes";
  activating it opens Review changes on All changes for that story. A story
  whose changed files all fall inside locations shows no such control.

**UI.**

```text
Sidebar open
[Intent | Optimization Candidates]  [Hide files]
+---------------------------------+----------------
| > Story Make the Intent s…  [i] 2 | reading pane
|   [ ] Selected story only        |
|#### [book] **Dashboard Frontend Test** ####|
|     > intent/                    |
|#### [book] **dashboard/tests** ##########|

Sidebar hidden
[Intent | Optimization Candidates]  [Show files]      Story Make the Intent s…
+--------------------------------------------------------------------------
| reading pane across the full width
```

**Architecture.** No Accepted ADR is implicated beyond keeping this as
disposable presentation state ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
The shown/hidden choice belongs to Intent's kept reading place
(`useKeptReading` in `dashboard/src/pageIntentReading.tsx`), owned by the
perspective because the toggle sits in the mode bar while the column lives in
the browser; the browser reads it rather than keeping its own copy. The
toggle reuses Review changes' `FileBrowserToggle`
(`dashboard/src/StoryReviewBrowserToggle.tsx`), moved to a shared home both
surfaces import, so one control owns Hide files / Show files. The
outside-locations count stays computed where it is now; only its
presentation changes.

The [Development and Intent guidance](../../docs/dashboard-development-intent.md)
describes the current location browser and selected-story summary and is
updated with this behavior.
