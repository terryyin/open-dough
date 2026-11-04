---
id: SEED-228
status: active
planted: 2026-11-04
planted_during: Terry Yin's annotated screenshot and request to improve the selected-story Intent view
trigger_when: A developer opens Intent for a selected story and browses its files
scope: story
---

# SEED-228: Make selected-story Intent easier to scan

<a id="compact-selected-story-intent"></a>

### Make selected-story Intent easier to scan

**Identity:** SEED-228#compact-selected-story-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/461-compact-selected-story-intent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cdd50dcf837f61afac9b0bfac17253ea504ce5803e68a79dd885a3d9dac6b8ac","plan":"cb4ef24215ed31a4cf291606bd428d8890485905295cfa02f510030dd4dc318f"}}
```

**Goal:** A developer reviewing a selected story's test impact in Intent can
tell at a glance which story scopes the tree and quickly tell Intent
locations apart from their files and folders, without mistaking a
selected location for an expanded or changed one.

**Scope**

Required behavior:

- The selected story's lens moves from above the reading-mode strip into the
  **Intent** tab, as one compact summary at the top of the locations column,
  directly above the location tree. It holds the story, the **Selected story
  only** choice, and, when changed files lie outside every location, their
  count with **Review changes**. Where the **Intent** tab shows a locations
  explanation instead of a tree, the summary stands above that explanation,
  so the tab still names the selected story.
- The summary starts compact. Compact, it names the story by its title on
  one line (a long title is shortened, with the full title on hover), keeps
  the choice and the outside-locations count and action, and, while the
  comparison is reading, unavailable, or failed, says so briefly, with
  **Retry** for a failure, so an unmarked tree never reads as a story without
  changes. A keyboard-operable disclosure, announced as expanded or
  collapsed, reveals the full title, the identity, and the compared
  revisions or the full explanation. Expanding or collapsing keeps the
  selection, the reading pane, the tree's expansion, and **Selected story
  only**.
- Every location header has its own background, distinct from nested file
  and folder rows, whether or not a story is selected. A selected location's
  header takes the selected background across its full width, disclosure
  caret included. A location containing the selected story's changes stays
  distinguishable from unchanged locations and from changed folder rows,
  and from selection: selection is shown by background, expansion only by
  the caret, and a location's changes by a mark that does not replace the
  location's own background. Folders containing changes keep their shared
  background. This replaces Intent's rule that folders and locations
  containing changes share one background.

Scope limits:

- **Optimization Candidates** and **CI status** no longer show the lens:
  Optimization Candidates is not scoped by the story, and CI status already
  names the story whose branch it judges ("Story branch of …").
- The summary's expanded or collapsed state is not kept across reloads or
  in browser storage.
- No new way to clear or change the selected story from Intent; the Board
  and Side panel keep that.
- Review changes' own file browser and Intent's folder and file rows keep
  their current styles.

**Key examples**

- Story **Read frontend Vitest proof in both projects** is selected and
  Intent shows its tree. The mode strip sits directly under the banner; the
  locations column begins with one compact summary naming that story, the
  **Selected story only** checkbox, and "3 changed files outside Intent
  locations are shown in Review changes." with **Review changes**; the
  location headers follow.
- A story whose title is longer than the column is selected. Compact, its
  title is shortened on one line; hovering shows it in full; expanding shows
  the full title, `SEED-…#…` identity, and "Compared `4cc8cff` with the
  landed run's tree `8b069ae`."
- A file is selected and **Selected story only** is on. The developer
  expands and then collapses the summary: the same file stays selected and
  read, the same folders stay open, and the choice stays on.
- The story's changes could not be read. Compact, the summary says so with
  **Retry**; the published tree stays usable beneath.
- No story is selected. No summary shows; the tree starts at the first
  location header, and each header's background differs from the file and
  folder rows under it.
- `tests` is selected and `dashboard/tests` is expanded. Only `tests`'
  header, caret to right edge, carries the selected background;
  `dashboard/tests` shows its open caret on its location background.
- With a story selected, `dashboard/tests` contains changes and its folder
  `boundary` does too. `dashboard/tests`' header keeps a location background
  with a change mark, distinct from `boundary`'s changed-folder row; selecting
  `dashboard/tests` gives it the selected background while its change mark
  remains.
- A project with no Intent locations configured and a story selected: the
  **Intent** tab shows the compact summary above the explanation that no
  intent locations are configured.

**Architecture**

The lens stops being a perspective-wide header and becomes part of the
**Intent** reading mode: the mode's panel owns the summary for both the tree
and the locations explanations, rather than the location browser alone,
which is absent when locations are missing or unreadable. The page-level
comparison read (`useIntentStoryLens`) keeps one owner and feeds both the
summary and the overlay; the lens and the story-only scope become one
summary component instead of two separately placed parts. ADR 0008's
ubiquitous language reserves **Highlight** for the Story card's indication
of the Selected story, so a selected location is described by its selected
background, not as a highlight.
