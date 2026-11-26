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

<a id="recognize-intent-folders-and-read-proof"></a>

### Recognize Intent folders and read their proof

**Identity:** SEED-420#recognize-intent-folders-and-read-proof
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#recognize-intent-folders-and-read-proof","dependencies":[{"supplier":{"identity":"SEED-420#browse-one-selectable-review-tree","href":"seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree"},"implementation":"Shared selectable repository path tree in Intent","rationale":"Ancestor rollup cues and clean root folder rows apply to directories in the single selectable repository path tree. Today Intent renders flat location-group accordion sections without ancestor folder rows and with single-child compaction, while SEED-420#browse-one-selectable-review-tree is actively Taken to build that shared path tree and regular-versus-Intent folder selection.","condition":"Story review shows repository paths in one selectable folder tree without single-child compaction, routing regular folders to the minimal path view and configured Intent roots and nested folders to Summary, with the separate Intent section lists and Outside Intent locations section retired in story review.","state":"satisfied","resolution":{"revision":"07dad9d62ee48012ee757bf2e6858f2d7ebfeed6","path":".planning/seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree","summary":"The mounted intent-story-tree cases show independently selectable, uncompacted ancestor folders and an empty configured root. They verify a regular folder's path reading and Summary for configured and nested Intent folders. IntentBrowserTree uses the shared selectable tree for story review in place of the separate location and Outside Intent locations groups. The folder-proof plan now identifies IntentLocationGroup and IntentLocationHeader as the remaining group/header consumers to migrate.\nCondition satisfied: Story review shows repository paths in one selectable folder tree without single-child compaction, routing regular folders to the minimal path view and configured Intent roots and nested folders to Summary, with the separate Intent section lists and Outside Intent locations section retired in story review.\nAccepted integration: b3b0704a7c76b994c9300d1ab8880ef0493f2854 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/840-recognize-intent-folders-and-read-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b2421b0efbb179fd882aaae8a7d90ced699d7784cc6bcf67cb7b882b27684340","plan":"cca4fa48fdbf180ec4023afe92e56df4d3f463abe4fd78e0b7ecd96c4371fe5c"}}
```

**Goal.** A developer reviewing a story or browsing a published project in
Intent can spot where configured Intent locations sit in the shared file tree
without pattern clutter on folder rows, and read a root's test configuration
or a nested folder's scoped CI proof with its evidence basis identified.

**Scope.** Use the shared selectable repository folder tree both in story
review and when browsing a published project without a selected story over
its configured-location inventory at the browsed revision. Retire the
separate Intent location accordion headers and exclusive single-location
collapse. Configured Intent roots with no matching files or an unsupported
kind remain selectable at their root paths except when hidden by a story
changes-only filter.

In the shown tree, style each configured Intent root row visually distinctly
whether open or closed, building on the existing Intent location colour
family so roots stand apart from regular folders and collapsed ancestors
while preserving selection, story change marks, and CI comparison cues on
compared entry roots. Style a collapsed non-root folder with a related,
lighter cue when at least one configured Intent root is present beneath it in
the shown tree. Once expanded, clear the cue on that folder; if an
intervening child folder remains collapsed and still hides a shown Intent
root, its collapsed row carries the cue until the root is visible.

Tree folder rows show only the folder's name and state: open/closed
disclosure, collapsed file count, selection, Intent root or collapsed-ancestor
cue, story change mark, and compared-entry CI cues and words where
applicable. Move configured labels, test types, and folder/file patterns out
of tree rows into the selected root's Summary. Keep independent disclosure
and selection by pointer and keyboard, and reveal ancestor folders when
opening a path from CI links, Summary rows, or optimization candidates.

Selecting a configured Intent root opens Summary with its optional label,
repository path, declared test type (`kind`, or `sources` entries' declared
`syntax` with their patterns), configured `include` patterns when present,
matching Intent file count and immediate child breakdown (or the existing
empty/unsupported explanation), and CI proof with its evidence basis
identified. Non-matching files under a mixed-content root do not count as
matching Intent files in Summary. Selecting a folder inside a configured
Intent location opens Summary scoped to that folder — path, matching Intent
files under it, and scoped CI proof with its evidence basis identified —
without repeating root-only configuration metadata. Selecting a folder
outside configured Intent locations, including an ancestor above an Intent
root, shows the minimal folder view naming its path.

[File filtering](https://github.com/terryyin/open-dough/blob/a40805a4e6914dce18caf003e66042c92f3dd630/.planning/seeds/SEED-420-unified-intent-review.md#filter-review-files) owns **Intent only**, **Changes
only**, and filtering Summary's file list. [Project browsing](#browse-the-project-at-a-revision)
owns expanding whole-project inventory beyond configured Intent locations and
repositories without Intent locations.

**Key examples.**

- **Collapsed ancestors, intervening folders, and persistent roots:** A
  project configures Intent roots at `e2e`, `e2e_test/features`, and
  `e2e_test/packaged/features`. With top-level folders collapsed, `e2e`
  carries the Intent root style and `e2e_test` carries the collapsed-ancestor
  cue; regular folders carry neither. Expanding `e2e_test` clears its cue,
  shows `features` with the Intent root style, and leaves collapsed
  `packaged` with the collapsed-ancestor cue until `packaged` is expanded to
  reveal its `features` root. Expanding or collapsing a root keeps its root
  style. Folder rows show names and state without inline types or patterns.
- **Root Summary, mixed-content root, nested folder, and non-root ancestor:**
  In a story comparison where `dashboard` holds `dashboard/src` and
  `dashboard/frontend-tests` (`kind: "typescript"`, `include:
  ["**/*.spec.ts"]`), and `Distribution` (`sources` with `shell` and
  `javascript` patterns) also holds `Distribution/src/SKILL.md`: selecting
  `dashboard` shows the minimal folder view naming `dashboard`. Selecting
  `dashboard/frontend-tests` shows its label, path, `typescript`,
  `**/*.spec.ts`, matching specs, and CI comparison proof with endpoints
  identified. Selecting `Distribution` shows its `shell` and `javascript`
  patterns and counts only matching tests, excluding `Distribution/src/SKILL.md`.
  Selecting `dashboard/frontend-tests/intent` shows proof and matching files
  scoped to that subfolder with the comparison basis identified and without
  root configuration details.
- **Change-filtered tree avoids false ancestor cues:** A story modifies
  `dashboard/src/app.ts` and leaves `dashboard/frontend-tests` untouched.
  With change filtering on (**Selected story only** or **Changes only**),
  collapsed `dashboard` carries no Intent ancestor cue because no Intent root
  is in the filtered tree; turning it off restores `dashboard/frontend-tests`
  beneath `dashboard` and restores the collapsed-ancestor cue while
  `dashboard` is closed.
- **Project Intent without a selected story:** With no story selected,
  Project Intent renders its configured locations in the same shared folder
  tree starting collapsed, with independent folder disclosure. Selecting a
  nested folder under a root shows single-run CI proof scoped to that folder
  with the measured run, revision, branch, and any ancestor or newer-tree
  qualification. Selecting an empty or unsupported-kind root shows `0 files`,
  its declared type and patterns, and the existing problem explanation.

**Architecture.** Following [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
and [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus),
Project Intent and story review share one folder-tree representation and one
Summary reader instead of keeping a separate location-group accordion. Root
and collapsed-ancestor cues are derived presentation state over the shown
tree and configured `IntentLocation` list, and Summary scopes matching files
via `locationSelectsRepositoryPath` and proof from held `IntentCiEvidence`
with no extra Git or CI requests.

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
