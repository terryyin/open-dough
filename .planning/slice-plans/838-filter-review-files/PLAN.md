# Filter the file browser by Intent and by changes

**Identity:** SEED-420#filter-review-files
**Source:** [Filter the file browser by Intent and by changes](../../seeds/SEED-420-unified-intent-review.md#filter-review-files)

A developer can narrow one story-review file inventory to configured Intent
paths, to the active comparison's changes, or to both. The tree and a
folder's file list show that inventory. Both filters off still lists the
repository at the selected revision. The story waits on
[SEED-420#browse-one-selectable-review-tree](https://github.com/terryyin/open-dough/blob/07dad9d62ee48012ee757bf2e6858f2d7ebfeed6/.planning/seeds/SEED-420-unified-intent-review.md#browse-one-selectable-review-tree)
for that one tree. This plan filters it. It does not build the tree, folder
selection, or proof explanations.

## Current decisions

- [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  gives the sidebar **Intent only** and **Changes only**, their intersection,
  the unfiltered repository inventory, and one filter for the tree and folder
  file lists. Browsing filters leave CI proof unchanged. Follow that. The
  design example's disabled project-scope control is already rejected: omit
  **Changes only** there.
- [ADR 0008, Spatial presentation remains derived](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#spatial-presentation-remains-derived)
  makes file filters presentation state. Keep the two choices with the
  reading place. They record no project fact.
- [Architectural North Star, Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  govern the proof. Drive the rendered browser with the existing published
  comparison fixtures. Keep a direct test of the filter rule beside the
  mounted journey. Use Playwright only for the existing end-to-end review
  journeys whose assertions name the old control.
- Proudly Found Elsewhere: change the existing story-scope choice. Reuse
  [location admission](../../../Distribution/src/skills/dough-makeme/scripts/intent-location-selection.mjs)
  (`locationSelectsRepositoryPath`: a path matches a location's configured
  sources, not merely its directory) and the comparison's added, modified,
  removed, and renamed paths. A rename matches Intent when either path is
  admitted. Replace `storyChangesOnly` and **Selected story only** with one
  filter over the supplier's repository paths. Derive the folder file list
  from that filtered inventory, as `filesOfSelection` derives today's summary
  rows from the shown tree. Do not add a second browser, and do not keep the
  location-group plus outside-group split the supplier retires.
- A path the selected revision does not hold still uses the existing
  "not in revision" explanation. A path the revision holds, which the filter
  hides, stays open and does not use that explanation. The current missing
  check treats any selected path absent from the shown tree as missing, so
  the filter must not feed that check a merely hidden path.
- On a story, with no kept choice, **Changes only** starts on and **Intent
  only** starts off. Store them under new reading-place keys. Leave the old
  `storyOnly` value unused: its default was off, and reusing it would invert
  the new default. Whole-project scope omits **Changes only** and keeps an
  **Intent only** choice; with none kept, **Intent only** starts off.
  Returning to a story restores **Changes only**.
- While the comparison is unread, failed, or unavailable, **Changes only**
  stays visible, explains why it is not applied, and does not narrow the
  inventory. The comparison's existing retry remains the way to read again.
  When the comparison becomes usable, the kept choice applies. When the
  filters that are on match no path, the browser says so and the controls
  stay. With no configured locations, **Intent only** says that none are
  configured.
- [The sidebar story](../../seeds/SEED-417-use-sidebars-consistently-across-the-dashboard.md#use-sidebars-consistently-across-the-dashboard)
  owns row fit. Supply the two controls after **Home**, **Intent only** then
  **Changes only**. [Story Home](https://github.com/terryyin/open-dough/blob/295c96b89ac352f18060e24a5f983f219392da8d/.planning/seeds/SEED-420-unified-intent-review.md#read-story-evidence-from-intent-home)
  owns Home's evidence. This plan only keeps an unchanged test's contribution
  visible there. Folder proof wording stays with its story. Session subsets
  stay with their story. The active comparison, including a landed run and
  **Include merged changes**, is the change set.
- At `f401a0d12f8dd590931bb938ace47e622dc7146d`, `IntentBrowser.tsx` is 246
  lines and `pageIntentReading.tsx` is 249. Neither exceeds 250. The slice
  that edits either file keeps it within 250 lines or makes that file's
  cohesive split in the same slice. Recheck both after the supplier lands;
  it will edit the browser.

## Decisive premises and baseline

Observed on 2026-11-25 at `f401a0d12f8dd590931bb938ace47e622dc7146d` in this
preparation worktree, Node v24.21.0, on AC power. The supplier tree is not
in this revision. These observations settle the rules the filter reuses.
They are not acceptance of the new controls.

| Consuming operation and profile | Result and planning consequence |
| --- | --- |
| `node scripts/test-backend.mjs dashboard/backend-tests/intent/intent-story-overlay.spec.ts` | 7 passed. A change sits where a location admits its path; a rename the new path does not admit sits at the old path when a location admits that; other changes are listed once outside. Deletions and renames remain when the overlay is restricted to changes. A file under a location directory that its sources do not select is outside. The filter uses this admission and this change set. It does not treat every file under a location directory as Intent. |
| `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-revision-apply.spec.ts` | 2 passed. After Show latest, a selected feature the new revision deleted is explained as not in that revision, nothing else is selected, and its source is gone. The filter must not reuse that explanation for a path the revision still holds. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| A story opens with **Changes only** on and **Intent only** off. Changed, deleted, and renamed paths are listed with their ancestor folders. An untouched file is omitted. The selected folder's file list shows the same paths. Turning **Changes only** off lists the untouched repository file and keeps the deletion. Choosing a landed run or **Include merged changes** lists that comparison's paths. The choice is kept across leaving Intent. An open untouched file stays open, without the not-in-revision notice, when **Changes only** hides it. No matching changes says so. | 1. Mount the existing story-changes fixture through the Intent page object. Assert accessible names, listed and omitted paths, the folder list, the kept choice, and the open reading. Replace the direct overlay cases for the retired control with the changes dimension of the same rule. |
| **Intent only** hides a changed production file and keeps a changed or deleted spec, including a rename admitted by either path. Both on, when only a production file changed, says no files match. Whole-project scope has no **Changes only**. **Intent only** narrows the inventory that scope shows to paths its locations admit. With no configured locations it says so, and turning it off lists that inventory again. | 2. Extend the same mounted story fixture, then the whole-project and no-locations fixtures. Assert the intersection, the empty match, the omitted control, and the open production file's reading. |
| An unread, failed, or unavailable comparison explains why **Changes only** is not applied and leaves the revision inventory, still narrowed by **Intent only** when that is on. After the comparison can be read, the kept choice applies. Home still shows an unchanged failing test's contribution while **Changes only** hides that path. | 3. Mount the comparison-gap fixture and a story whose CI proof includes an unchanged failure. Assert the explanation, the unnarrowed inventory, the later narrowing, and the same Home evidence. |

## Consumer trace and local gates

Search for `Selected story only`, `onlyChangedFiles`, `storyOnly`, and
`storyChangesOnly` before replacing the control. The current observers are
the Intent story page object and `ciFollowUpReadingPage.ts`; the mounted
specs `intent-story-changes-only`, `intent-story-changes-gaps`,
`intent-story-outside-locations`, `intent-reading-place`,
`intent-sidebar-toggle`, and `story-card-selection`; the direct overlay
spec; and e2e `intent-story-changes`, `intent-story-changes-moves`, and
`intent-story-completed`. Slice 1 updates observers of the changes control
and which changed paths are listed. Slice 2 updates observers of the
unfiltered tree, whole project, and outside files. Slice 3 updates observers
of a missing comparison and of Home evidence. Re-run the installed consumer
trace on the slice diff and give each new consumer `run`, `reused`, or
`excluded` with a reason. The supplier may already have moved these tests;
follow the tree it leaves.

- Run changed mounted specs with `npm run test:dashboard:frontend -- <specs>`,
  the direct filter spec with `node scripts/test-backend.mjs <spec>`, and
  affected end-to-end journeys with `npm run test:e2e -- <specs>`.
  On AC power wrap a long run in
  [`caffeinate -s -i`](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md),
  MakeMe for new fixture data, the page-object convention for browser
  assertions, and post-change refactoring before each slice commit.

## Slices

### 1. Show a story's changes in the shared file inventory

Type: Behavior
Status: planned
Proof: The mounted changes journey and the direct changes-dimension cases
in the proof map.

On the supplier's one repository tree, replace **Selected story only** with
**Changes only**, on by default when nothing is kept. List added, modified,
removed, and renamed paths from the active comparison, with the ancestor
folders needed to open them. Turning it off lists the repository at the
selected revision, including deletions and renames the revision no longer
contains. The folder file list shows the same paths. Changing the comparison
updates the list and keeps the choice. A path the filter hides stays open
and is not described as missing from the revision. When a usable comparison
has no matching path, say so. While the comparison is not usable, do not
narrow the inventory; slice 3 adds the explanation.

### 2. Narrow the same inventory to Intent

Type: Behavior
Status: planned
Proof: The intersection, whole-project, and no-locations journeys in the
proof map.

Add **Intent only**, off by default, using the existing location admission
and either path of a rename. Both filters on list only the intersection.
A folder's file list follows. In whole-project scope omit **Changes only**
and apply **Intent only** to the inventory that scope shows, including a
repository with no configured locations. Showing the whole repository there
belongs to project browsing once it uses this tree. An open production file
stays open when **Intent only** hides it.

### 3. Explain an unusable changes filter and leave Home evidence

Type: Behavior
Status: planned
Proof: The comparison-gap and unchanged-failure Home journeys in the proof
map.

When the comparison is unread, failed, or unavailable, **Changes only**
explains why it is not applied. **Intent only** still applies. The existing
comparison retry reads it again, and the kept **Changes only** choice
applies once the comparison is usable. Story Home still shows an unchanged
failing test's contribution while the browser hides that path.

## Verification and plan review

No separate refinement pass was needed. The three slices extend one
membership rule: changes, then Intent, then the case where the change set
cannot be read. Each has its own mounted proof and fits the slice budget.
This review found no remaining slice-specific concern.
