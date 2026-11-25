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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/838-browse-one-selectable-review-tree/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"66d8ca4c205292d6c8d16d6fdb0bf9f3129f9c4c8b462d9a534c39f115520aa5","plan":"8102836c229acd4818db853667dd7b78bcb38286a71e0629837adeb03b895a1f"}}
```

**Goal.** A developer reviewing a story can navigate its repository folders,
open source or a diff, and move to a folder's Intent proof while keeping
the same story and comparison in view.

**Scope.** Show a single repository path tree in story review. When the
comparison supplies a published revision, use its repository inventory and
the Intent locations at that revision. Place tracked files, including files
outside Intent, under their repository folders. Overlay the selected
comparison on this inventory so deletions remain selectable at their former
paths and a renamed file has one row at its destination with both paths
available in the diff. Preserve the former path for baseline proof and
existing links into the comparison. Retire the separate Intent section
lists and **Outside Intent locations** section in story review.

A folder name selects the folder and its disclosure control independently
opens or closes its children. Both controls work by keyboard. Selecting a
regular folder replaces the previous reading with a minimal view naming its
path. Selecting a configured Intent root or folder within it opens its
existing scope summary. Selecting an unchanged file reads its source at the
browsed revision. Selecting a changed file uses the current comparison's
diff and existing proof. Keep the comparison choice when moving among
paths, and keep the directed **Review changes** entry and file navigation
working with the paths shown in the tree.

Keep **Selected story only** and its current meaning while the
[filter story](#filter-review-files) owns its replacement. When repository
inventory is unavailable, explain the gap and keep independently readable
comparison paths available. Keep existing evidence and navigation for a
story without a published comparison. The
[folder proof story](#recognize-intent-folders-and-read-proof) owns new cues
and summary details. [Project browsing](#browse-the-project-at-a-revision)
owns the whole-project rollout.

**Key examples.**

- In a story comparison containing tests and production changes, expand
  `dashboard` once to reach both kinds of paths. Select a production
  folder to replace the previous diff with its folder view. Collapse it
  without changing the selection, then select a frontend test folder and
  read its proof summary with the same comparison still selected.
- In a comparison with a deleted test and a test renamed into a
  production folder, open the deletion at its old path and the rename at
  its destination. The deletion and rename retain their change kinds and
  diffs. The rename keeps its former path and baseline proof. File moves
  traverse the visible changed paths in tree order. **Selected story only**
  hides unchanged paths while preserving the ancestors needed for those
  changes.
- Choose a captured landed run whose repository has an unchanged document
  that later trunk changes. Open the document from the tree and read the
  text at that run's revision. Choose another published comparison and the
  tree follows its revision. If the inventory read fails, explain the gap
  and leave the available changed diffs reachable.

<a id="filter-review-files"></a>

### Filter the file browser by Intent and by changes

**Identity:** SEED-420#filter-review-files
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#filter-review-files","dependencies":[{"supplier":{"identity":"SEED-420#browse-one-selectable-review-tree","href":"seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree"},"implementation":"One story-review tree of repository paths","rationale":"These filters narrow that one inventory. The browser today lists configured Intent locations and changed files outside them, so both filters off cannot show the repository, and applying the filters to the sections that story retires would not leave this inventory. Building the repository tree here would take that story's outcome.","condition":"Story review shows Intent paths and other repository paths together in one tree at the selected revision, with each path in its repository folder, folder rows selectable, and comparison paths for deleted and renamed files reachable. The separate Intent section lists and Outside Intent locations section are retired.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/838-filter-review-files/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1edaa58471fa196c569c38828e1924c74c540165e2314462b7ab68cec74a2d36","plan":"485bffc4e77e4e13542b5f1b1bc1c4181a2c37a6505fb1daa7f7ef1224608e05"}}
```

**Goal.** A developer reviewing a story, or browsing the published project
without one, can narrow the file browser to configured Intent paths, to the
active comparison's changes, or to both. The tree and a folder's file list
show that same inventory, and both filters off still reaches the repository
at the selected revision. This keeps one review workspace while the developer
hides untouched Intent files or changed production files independently.

**Scope.** Replace **Selected story only** with two independent checkboxes,
**Intent only** and **Changes only**, after **Home** in that order. The
[sidebar story](SEED-417-use-sidebars-consistently-across-the-dashboard.md#use-sidebars-consistently-across-the-dashboard)
owns how that row fits. This story owns what the controls do to the inventory.

**Intent only** lists paths the selected revision's configured Intent
locations admit. A deletion is admitted by its path. A rename is admitted
when either path is, so a rename across a location boundary stays listed.
**Changes only** lists added, modified, removed, and renamed paths in the
active story comparison: the published comparison or the chosen landed run,
including the wider baseline when **Include merged changes** is selected.
Both on lists the paths in both sets. Turning one off widens only that
dimension. Both off lists the repository inventory at the selected revision,
including comparison paths for deletions and renames the revision no longer
contains. An ancestor folder of a matching path stays listed so the path can
be opened. A folder with no matching path is omitted.

The unified tree and a selected folder's file list show these same paths. A
folder view that lists no files stays as the
[tree story](#browse-one-selectable-review-tree) left it. Where a folder
lists files, those files are this inventory. The folder's proof explanation
stays with
[its story](#recognize-intent-folders-and-read-proof).

On a story, with no kept choice, **Changes only** starts on and **Intent
only** starts off. The choices stay with the reading place across leaving
Intent, refreshing the comparison, and choosing another comparison. In
whole-project scope **Changes only** is omitted, and a kept **Intent only**
choice still applies; with no kept choice it starts off. Returning to a
story restores the kept **Changes only** choice.

**Intent only** works with no story selected. With no configured Intent
locations, **Intent only** lists no paths and the browser says that no Intent
locations are configured.

When the story's comparison is still being read, has failed, or is
unavailable, **Changes only** explains why it is unavailable and does not
narrow the inventory. **Intent only** still applies. The comparison's
existing retry reads it again. Once the comparison is usable, the kept
**Changes only** choice applies. When the filters that are on match no path,
the browser says that no files match, and the controls stay so the developer
can widen the inventory.

A filter removes paths from the browser and leaves the open reading and Story
Home in place. Story Home's comparison and coverage evidence stay as the
[Home story](#read-story-evidence-from-intent-home) defines them, including
an unchanged test's contribution.

The [tree story](#browse-one-selectable-review-tree) supplies the one
repository tree, folder selection, and reachable deletions and renames.
Project CI, opening a file at the project revision, and reading a repository
with no Intent locations belong to
[project browsing](#browse-the-project-at-a-revision). Session selection and
session-subset comparisons belong to their existing work.

**Key examples.**

- A story's published comparison is open and nothing has been kept. The
  browser lists a changed spec, a changed production file, and a deleted spec
  under their folders, and omits an untouched spec. The selected folder's
  file list shows those same changed paths. Turning **Intent only** on leaves
  the changed and deleted specs and omits the production file. Both lists
  agree. When the story changed only a production file, both filters on say
  that no files match; turning **Intent only** off lists that file.
- Both filters are off. An untouched production file at the selected revision
  is listed, and a path the comparison deleted is listed though the revision
  no longer contains it. Turning **Changes only** on leaves the deletion and
  omits the untouched file.
- The developer chooses a landed run, then selects **Include merged changes**
  where that comparison supports it. **Changes only** lists that choice's
  paths, and the comparison choice stays.
- The comparison cannot be read. **Changes only** explains why, and the
  revision's files stay listed, narrowed by **Intent only** when that is on.
  After the comparison can be read, the kept **Changes only** choice narrows
  the list.
- With no story selected, **Changes only** is absent. **Intent only** off
  lists the inventory that scope shows. **Intent only** on lists the paths
  its configured locations admit. With no configured locations, **Intent
  only** says so, and turning it off lists that inventory again.
- **Changes only** is on and Home is showing. An unchanged failing test is
  absent from the browser. Its result still contributes to the story's CI
  evidence. A production file that is open stays open when **Intent only**
  is turned on; it leaves the browser until **Intent only** is turned off.

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
