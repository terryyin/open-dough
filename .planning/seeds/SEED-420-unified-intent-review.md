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
[sidebar behavior](https://github.com/terryyin/open-dough/blob/e4a350d35ee26dfe98375118520523dd1ca648f6/.planning/seeds/SEED-417-use-sidebars-consistently-across-the-dashboard.md),
[Board actions](SEED-416-put-story-actions-in-the-comment-toolbar.md) and
[outgoing follow-up context](https://github.com/terryyin/open-dough/blob/9d70e5741139db0443e0cf37f16c0881c7b1b55f/.planning/seeds/SEED-415-choose-clear-follow-up-context.md#choose-clear-follow-up-context).

The annotated review on 2026-11-25 used the Done story
`SEED-413#trim-follow-up-context-e2e-journeys` with a file diff open. It showed
an icon-only banner, stacked comparison details and actions, page-wide story
tabs, and separate Intent sections and outside files. The current entry
points are [IntentPage](../../dashboard/src/IntentPage.tsx),
[IntentHeader](../../dashboard/src/IntentHeader.tsx), and
[IntentBrowserTree](../../dashboard/src/IntentBrowserTree.tsx).

<a id="filter-review-files"></a>

### Filter the file browser by Intent and by changes

**Identity:** SEED-420#filter-review-files
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#filter-review-files","dependencies":[{"supplier":{"identity":"SEED-420#browse-one-selectable-review-tree","href":"seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree"},"implementation":"One story-review tree of repository paths","rationale":"These filters narrow that one inventory. The browser today lists configured Intent locations and changed files outside them, so both filters off cannot show the repository, and applying the filters to the sections that story retires would not leave this inventory. Building the repository tree here would take that story's outcome.","condition":"Story review shows Intent paths and other repository paths together in one tree at the selected revision, with each path in its repository folder, folder rows selectable, and comparison paths for deleted and renamed files reachable. The separate Intent section lists and Outside Intent locations section are retired.","state":"satisfied","resolution":{"revision":"07dad9d62ee48012ee757bf2e6858f2d7ebfeed6","path":".planning/seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree","summary":"Story review derives one uncompacted tree from the selected completion inventory and overlays changed paths. The mounted intent-story-tree cases show regular and Intent paths in context with independent folder selection. The real-Git intent-story-changes-moves journey verifies destination-only renames and former-path deletion rows, and intent-story-result-browser verifies that switching comparisons changes the pinned inventory. The separate story Intent and Outside Intent locations groups have been retired. The filter plan now names the delivered storyRepositoryTree and useIntentStoryTree entry points.\nCondition satisfied: Story review shows Intent paths and other repository paths together in one tree at the selected revision, with each path in its repository folder, folder rows selectable, and comparison paths for deleted and renamed files reachable. The separate Intent section lists and Outside Intent locations section are retired.\nAccepted integration: b3b0704a7c76b994c9300d1ab8880ef0493f2854 on origin/refs/heads/main."}}]}
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
[sidebar story](https://github.com/terryyin/open-dough/blob/e4a350d35ee26dfe98375118520523dd1ca648f6/.planning/seeds/SEED-417-use-sidebars-consistently-across-the-dashboard.md#use-sidebars-consistently-across-the-dashboard)
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
[tree story](https://github.com/terryyin/open-dough/blob/07dad9d62ee48012ee757bf2e6858f2d7ebfeed6/.planning/seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree) left it. Where a folder
lists files, those files are this inventory. The folder's proof explanation
stays with
[its story](https://github.com/terryyin/open-dough/blob/af4986541deba01a4177f66c9f6233ebc075a369/.planning/seeds/SEED-420-unified-intent-review.md#recognize-intent-folders-and-read-proof).

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
[Home story](https://github.com/terryyin/open-dough/blob/295c96b89ac352f18060e24a5f983f219392da8d/.planning/seeds/SEED-420-unified-intent-review.md#read-story-evidence-from-intent-home) defines them, including
an unchanged test's contribution.

The [tree story](https://github.com/terryyin/open-dough/blob/07dad9d62ee48012ee757bf2e6858f2d7ebfeed6/.planning/seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree) supplies the one
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

<a id="browse-the-project-at-a-revision"></a>

### Read the whole repository and its CI from Project Intent

**Identity:** SEED-420#browse-the-project-at-a-revision
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#browse-the-project-at-a-revision","dependencies":[{"supplier":{"identity":"SEED-420#recognize-intent-folders-and-read-proof","href":"seeds/SEED-420-unified-intent-review.md#recognize-intent-folders-and-read-proof"},"implementation":"The shared selectable folder tree and Summary navigation in Project Intent","rationale":"The current Project Intent browser uses separate location accordions. Its folder-cue supplier moves Project Intent into the shared repository tree and retires those accordions. Building or hooking up a second Project Intent browser would take that supplier's integration and duplicate selection and Summary ownership.","condition":"Project Intent uses the same selectable repository folder tree as story review, with separate disclosure and selection, persistent Intent root and collapsed ancestor cues, and root and nested Intent folder Summary navigation. Its location-group accordion has been retired.","state":"waiting"},{"supplier":{"identity":"SEED-420#filter-review-files","href":"seeds/SEED-420-unified-intent-review.md#filter-review-files"},"implementation":"Project-scoped Intent only filtering of the shared repository inventory","rationale":"The installed filter is a story-only comparison choice. Project browsing needs to pass its full path inventory into the shared filter and preserve one reading-place choice and one Intent membership rule. Adding the project choice here would take that supplier's explicitly planned Project Intent behavior.","condition":"Project Intent offers the persisted Intent only choice, initially off when no choice is kept, applies the shared location admission to the displayed inventory, and omits Changes only. The shared filter distinguishes a hidden path from a missing path and explains when no locations are configured.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/841-browse-the-project-at-a-revision/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"39ba6e2920e4660a81a21c5223e4ddaf545861fe6844e54cb7be1f904bfce190","plan":"5daa78c97034cd113cc685898e8483940eeffac6dec9e63c47296865dad4898a"}}
```

**Goal.** A developer can move from the project's measured CI results to any
file's source at the published revision shown in Intent, follow the nearby
code and tests, and return to the CI overview in the same workspace.

**Scope.** With no story selected, start at the existing project CI overview.
Reuse the shared selectable repository tree and its Intent folder cues. List
the published repository's tracked paths by default, with **Intent only**
available and **Changes only** omitted. Select regular folders for their
path and configured Intent folders for their Summary. A repository with no
configured Intent locations still has its full tree and file reading.

Keep navigation pinned to the displayed revision. The tree, its Intent
locations, and selected source use that revision. A newer observed revision
is offered through the existing **Show latest** action. Apply an update when
the new browsing data is available, and preserve the existing retry and
missing-path explanations. Keep source and CI provenance distinct. Tests
keep **Purpose** and **Proof** with the measured build identified. Other
files show their source, and Proof explains when no file-level result is
available. **Home** returns to the project's CI changes and measured builds
regardless of the browsing filter.

**Key examples.**

- At published revision A with a newer revision B available, open a production
  file, a neighboring document, and a configured test. Their source comes
  from A. The test's Proof names the measured build, and the production
  file's Proof explains the absence of a file-level result. **Home** restores
  the same project CI overview.
- With a configured test and a nonmatching file in the same directory,
  **Intent only** keeps the test and the folder's Intent cue. Clearing it
  restores the other file. With no configured locations, the default tree
  still opens a tracked document and **Intent only** explains the empty scope.
- When **Show latest** moves from A to B, a retained path reads B's version
  and a removed path gets the existing missing-path explanation. If the
  new inventory cannot be read, the current reading remains usable while
  the developer retries.

**Deferred.** An arbitrary revision picker, new CI runs, and migration of
the existing published Intent and attribution readers to local Git remain
outside this increment.

**Effort hypothesis:** M, medium confidence. This expands the inventory beyond
test locations while preserving revision-pinned reads.

## Order and scope

The [product backlog](../PRODUCT-BACKLOG.md#backlog-list) carries the priority
of the annotated review outcomes. The story header and Home can improve with
the comparisons already available. The shared story tree gives the filtering
and folder cues one inventory, and project browsing applies the same reading
to the published project revision. Session subset attribution, Structure,
and generating new paired CI runs remain separate directions.
