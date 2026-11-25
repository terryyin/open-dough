---
id: SEED-420
status: active
planted: 2026-11-21
planted_during: Review of the SEED-413 file-count comparison and unified Intent design
trigger_when: selected from the product backlog
scope: story and project review in Intent
---

# SEED-420 — Review code and proof in the same Intent workspace

A developer reviewing a story should be able to follow one revision and path
from source to proof and back. Filtering today's Changed tests table alone
would hide one symptom while leaving the two review destinations and their
different baselines in place. Keep the current review, history, notes and CI
evidence capabilities in one workspace. [Design direction](../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
and [dashboard ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships).
The [interactive design example](SEED-420-unified-intent-review/preview.html)
uses illustrative sessions. Narrow the window to see the icon-only bookmark.

Keep the existing owners for [published session records and session selection](SEED-418-review-published-session-changes.md),
[sidebar behavior](SEED-417-use-sidebars-consistently-across-the-dashboard.md),
[Board actions](SEED-416-put-story-actions-in-the-comment-toolbar.md) and
[outgoing follow-up context](https://github.com/terryyin/open-dough/blob/9d70e5741139db0443e0cf37f16c0881c7b1b55f/.planning/seeds/SEED-415-choose-clear-follow-up-context.md#choose-clear-follow-up-context).

The annotated review on 2026-11-25 used the Done story
`SEED-413#trim-follow-up-context-e2e-journeys` with a file diff open. It showed
an icon-only banner, stacked comparison details and actions, page-wide story
tabs, and separate Intent sections and outside files. The current entry
points are [IntentPage](../../dashboard/src/IntentPage.tsx),
[IntentHeader](../../dashboard/src/IntentHeader.tsx), and
[IntentTreeGroups](../../dashboard/src/IntentTreeGroups.tsx).

<a id="compact-story-comparison-controls"></a>

### Read and change the story comparison from one control bar

**Identity:** SEED-420#compact-story-comparison-controls
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/833-compact-story-comparison-controls/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a1eca05b901b399dfb7e17be328824a37850231af209af3f93773625b1ffa894","plan":"13b53d4e8c0e50a27c3e7cc204edc90520d613c7ddcdfaf62252b6ef2d6787a1"}}
```

**Goal.** A developer reviewing a story in Intent can tell which comparison is
active and change it from one compact toolbar row. The files and proof get the
height the stacked comparison text and controls take today. This advances the
seed's single review workspace without dropping any comparison capability.

**Scope.** Keep the story title, its identity and Done mark, and the note
button above the bar. The bar holds, in order:

- the file sidebar's **Hide files** / **Show files** toggle;
- the comparison controls that are available: the published comparison and
  **Landed runs** choice when there is more than one choice, and
  **Include merged changes** when the published comparison supports it;
- a one-line summary of the active comparison. It names the comparison,
  shows the recorded agent's portrait beside its attribution when an agent is
  known, and opens the full comparison details.

The details show what the stacked text shows today: the recorded time,
branch, baseline and result revisions, and the attribution or the
explanation of why a comparison is unavailable. The comparison follow-up
action stays in the details until
[its own story](#put-comparison-follow-up-by-story-notes) moves it. The
details also hold **Refresh**, which re-reads the comparison while keeping the
choice. The standalone **Refresh** button leaves the bar. Changing the
comparison updates the summary and the details to describe the new choice.
Reading, unavailable and failed states appear in the summary's place. A read
failure keeps its **Retry** there. On a narrow window the bar wraps instead of
overflowing. The **Sessions** control joins the bar through
[session selection](SEED-418-review-published-session-changes.md#select-a-story-session-for-review),
not this story.

Out of scope: rereading automatically when newer work is published, and the
follow-up button beside the notes.

**Key examples.**

- An unfinished story's published comparison by Kaoru-chan is open. The bar
  shows the files toggle, the comparison choice, **Include merged changes**
  and a summary with Kaoru-chan's portrait. Opening the summary shows the
  branch, the baseline and result revisions, and **Refresh**. The file diff
  starts directly below the bar.
- The developer chooses a landed run. The summary and the details now
  describe that run's time and landing revisions. **Include merged changes**
  is not offered when that comparison does not support it.
- New work is published while the story is open. **Refresh** in the details
  re-reads it, keeps the landed run or published choice, and the summary
  reports the refreshed comparison.
- A comparison has no recorded agent. The summary shows the attribution text
  without a portrait.
- No comparison is available. The summary says so and the details explain
  why. The comparison read fails: the summary reports the failure with
  **Retry**.

<a id="put-comparison-follow-up-by-story-notes"></a>

### Put comparison follow-up beside story notes

**Identity:** SEED-420#put-comparison-follow-up-by-story-notes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/837-put-comparison-follow-up-by-story-notes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"96da3defb19b7039b92767d67d2d22bffa5dc6a9e41d78d3aef63c7fb83b1d86","plan":"68357fe64e5653531bd08da83538fe25a7af7530efcf99f16b4409739cedd07b"}}
```

**Goal.** A developer reviewing a Done story in Intent can follow up on the
comparison they are reading from the story title row. This keeps the action
within reach while the developer reads a diff or other story evidence.

**Scope.** Put one icon-only button beside **Notes** on the story title row.
Its accessible name is **Follow up on comparison**. It opens the existing
composer directly and returns focus to the button when cancelled. Comparison
details no longer contain a second follow-up action.

Keep the existing Done-story and readable-comparison requirements. Published
completions retain their current availability, including **Include merged
changes** when supported. Offer the same action for a readable landed run of
that Done story. The composer names the story and the exact baseline and result
of the comparison being shown. Starting the follow-up sends that same pair.
Admission verifies the pair against the named completion or landed run so
another story's run or a different pair cannot start a session.

File and line follow-ups, optional attachments, the comparison controls, and
published-session follow-up scope belong to their existing work.

**Key examples.**

- With a Done story's published completion showing, open **Follow up on
  comparison** by keyboard beside **Notes**. The composer shows the published
  comparison and its exact pair. Cancel to return focus to the icon. Starting
  from the same button sends that pair, including the wider baseline when
  **Include merged changes** is selected.
- With a Done story's published comparison open, select a landed run with a
  different pair. Open the same title-row action and start a follow-up. The
  composer and the follow-up both name the landed run's pair.
- With no readable comparison, no Done story, or no selected story, the
  comparison action is absent. A submitted landed reference belonging to
  another story, or a submitted pair differing from the selected run,
  is refused before starting a session.

<a id="read-story-evidence-from-intent-home"></a>

### Read CI comparison and Intent coverage from Story Home

**Identity:** SEED-420#read-story-evidence-from-intent-home
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/837-read-story-evidence-from-intent-home/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"935c7d30231ec10ad78e75fd5a61747044fe969c8ba8cd8b0323e78196eb72d4","plan":"a8b891e0d8dbd7dd86af4c872d650fe0ea0447e7b33bda37b583d76d826ccbe2"}}
```

**Goal.** A developer reviewing a story in Intent can start with its CI
evidence, open a path for detail, and get back to the same story's evidence
without reselecting the comparison.

**Scope.** When no path is selected, the reading pane shows Story Home.
A fresh story opens its **CI comparison** tab. **Intent coverage** is the
other Home tab. The story-level tab row gives way to Home and direct path
reading. Selecting a configured location, folder, or file shows its existing
summary, diff, Purpose, or Proof as applicable. CI links to locations and the
file Proof link back to story CI stay usable.

The sidebar's **Home** icon is a keyboard-accessible button with the name
**Home**. It clears the path and returns to **CI comparison**, keeping the
selected story, comparison, and any session choices already offered. It stays
reachable from a path, including through **Show files** when the sidebar is
hidden. **Review changes** keeps its direct entry from the Board: where the
comparison supplies changed files, open the remembered file for that story
or the first changed file as applicable. Pending or unavailable review keeps
its existing explanation and recovery where available.

Use the existing evidence basis, including measured builds and whole-story
qualifications where they apply. File filters affect the browser inventory
only. Story Home still shows existing CI evidence from unchanged tests.

The [sidebar story](SEED-417-use-sidebars-consistently-across-the-dashboard.md#use-sidebars-consistently-across-the-dashboard)
owns the shared responsive layout. The unified tree, new filter controls,
project browsing, session selection, and new CI evidence are separate work.

**Key examples.**

- Open a story in Intent without a selected path. Read **CI comparison** and
  switch to **Intent coverage** within Home. Select an available folder and
  see its summary directly. Select a changed test and read its diff or Proof.
  Activate **Home** to clear the selection and see **CI comparison** again.
- With a Done story's landed run chosen, open a changed path, then return
  Home. The landed run is still selected. CI identifies its measured builds
  or explains the whole-story fallback. **Intent coverage** still qualifies
  its whole-story basis when applicable.
- Hide unchanged paths with the current file filter while CI has evidence
  from an unchanged failing test. The unchanged path disappears from the
  browser. Its contribution to CI evidence remains visible in Home.
- From the Board, activate **Review changes** on a story with published
  changes. The changed-file diff opens directly once the read settles.
  If changes or their source are unavailable, the review explains the gap.

<a id="browse-one-selectable-review-tree"></a>

### Browse and select folders in one story review tree

**Identity:** SEED-420#browse-one-selectable-review-tree
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer can browse Intent paths and other paths together in one tree of
repository paths at the story review's selected revision. Show each path in
its repository folder. Retire the separate Intent section lists and
**Outside Intent locations** section. Keep comparison paths for deleted and
renamed files reachable and preserve the selected comparison when opening a
path.

Folder rows can become the current selection, with a separate expand and
collapse control. Selecting a regular folder replaces the previous reading
with an empty or minimal folder view. Selecting a configured Intent root or
a folder under it opens the folder's proof summary. For example, a developer
can expand `dashboard`, select a regular folder without leaving the tree,
then select a frontend test folder and see its proof. The
[folder proof story](#recognize-intent-folders-and-read-proof) owns the visual
cues and section details. [Project browsing](#browse-the-project-at-a-revision)
applies the shared tree to the whole-project scope.

<a id="filter-review-files"></a>

### Filter the file browser by Intent and by changes

**Identity:** SEED-420#filter-review-files
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer sees the same filtered inventory in the unified tree and the
folder file list. Replace **Selected story only** with two independent
controls. **Intent only** means paths matching the selected revision's
configured Intent locations. **Changes only** means added, modified, removed
or renamed paths in the active story comparison. Both on shows changed specs
that match Intent and hides untouched specs and changed production files.
Either off widens the inventory along that dimension. Both off shows the
repository inventory at the selected revision, with comparison paths for
deletions and renames. Keep ancestors needed to navigate to matching paths.

Place the filters after **Home** in the sidebar. Keep Intent filtering usable
without a story. In whole-project scope omit **Changes only**. If a story has
no usable comparison, explain why its changes filter is unavailable. File
filtering leaves Home's comparison evidence intact.

**Effort hypothesis:** M, medium confidence, given the current story overlay.

<a id="recognize-intent-folders-and-read-proof"></a>

### Recognize Intent folders and read their proof

**Identity:** SEED-420#recognize-intent-folders-and-read-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer can find configured Intent locations in the shared file tree.
Style a collapsed ancestor containing one or more Intent locations with a
cue related to the current Intent section style. Once expanded, style the
visible Intent root itself. If an intervening folder still hides a root, its
collapsed row carries the cue. Root rows stay visually distinct whether open
or closed. The tree rows show folder names and state. Test types and
configured folder and file patterns belong in the selected root's summary.

Selecting the root shows its test type, configured patterns, matching files
and proof. Selecting a folder inside that location shows proof scoped to that
folder, with the evidence basis identified. The same tree cues and folder
reading apply when browsing a published project without a selected story.

<a id="browse-the-project-at-a-revision"></a>

### Read the whole repository and its CI from Project Intent

**Identity:** SEED-420#browse-the-project-at-a-revision
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

With no story selected, a developer starts at the project's existing CI
overview and uses the same unified tree, selectable folders, Intent folder
cues and **Intent only** filter as story review. The story-only **Changes
only** filter is unavailable in this scope. A developer can open a production
file, test, or document at the named revision and read a test's Purpose and
Proof or a production file's source. Explain missing file-level evidence.
Moving to another path keeps the named revision. Returning to **Home**
restores the project's CI changes and measured builds. Project browsing also
works for a repository with no Intent locations.

**Effort hypothesis:** M, medium confidence. This expands the inventory beyond
test locations while preserving revision-pinned reads.

## Order and scope

The [product backlog](../PRODUCT-BACKLOG.md#backlog-list) carries the priority
of the annotated review outcomes. The story header and Home can improve with
the comparisons already available. The shared story tree gives the filtering
and folder cues one inventory, and project browsing applies the same reading
to the published project revision. Session subset attribution, Structure,
and generating new paired CI runs remain separate directions.
